import { useEffect, useState } from "react";
import api from "../api";
import { useTranslation } from "react-i18next";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, Tab } from "react-bootstrap";

export default function ProfilePage() {
  const { t } = useTranslation();
  const [myInventories, setMyInventories] = useState([]);
  const [accessibleInventories, setAccessibleInventories] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const { user, setUser } = useAuth();
  const [userName, setUserName] = useState(user?.userName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [activeTab, setActiveTab] = useState("my"); 

  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem("token");

  const loadProfile = async () => {
    try {
      const res = await api.get("/account/me");
      setUser(res.data);
      setUserName(res.data.userName);
      setEmail(res.data.email);
    } catch (error) {
      console.error("Failed to load profile", error);
    }
  };

  const loadInventories = async () => {
    try {
      const resOwned = await api.get("/inventories/my");
      setMyInventories(resOwned.data);

      const resAccess = await api.get("/inventories/with-access");
      setAccessibleInventories(resAccess.data);
    } catch (error) {
      console.error("Failed to load inventories", error);
    }
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      const res = await api.put("/account/update", {
        userName,
        email,
      });
      setUser((prev) => ({
        ...prev,
        userName: res.data.userName || res.data.name,
        email: res.data.email,
      }));

      setSavedMessage("Profile updated!");

      setTimeout(() => setSavedMessage(""), 3000);
    } catch (e) {
      alert(e.response?.data?.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadInventories();
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentInventories = activeTab === "my" ? myInventories : accessibleInventories;
    const allIds = currentInventories.map((i) => i.id);
    if (selectedIds.length === allIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await api.post("/inventories/bulk-delete", selectedIds);
      setMyInventories((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
      setSelectedIds([]);
      setSelectMode(false);
    } catch (e) {
      console.error(e);
      alert("An error occurred while deleting inventories.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>{t("Personal Account")}</h2>

      {savedMessage && (
        <div className="alert alert-success py-2 position-absolute">{savedMessage}</div>
      )}

      {user && (
        <div className="card mb-4">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">{t("Name")}</label>
              <input
                className="form-control"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">{t("Email")}</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={updateProfile}
              disabled={saving}
            >
              {saving ? t("Saving...") : t("Save")}
            </button>
          </div>
        </div>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => {
          setActiveTab(k);
          setSelectedIds([]);
        }}
        className="mb-3 mt-3"
        fill
      >
        <Tab eventKey="my" title={t("My Inventories")}>
          {activeTab === "my" && (
            <button
                  className="btn btn-danger mt-4"
                  onClick={handleBulkDelete}
                  disabled={selectedIds.length === 0}
                >
                  {t("Delete")} <i class="bi bi-trash3"></i>
                </button>
          )}

          <button
            className="btn btn-primary ms-3 mt-4"
            onClick={() => navigate("/inventories/new")}
            disabled={!isAuthenticated}
          >
            {t("Create Inventory")} <i className="bi bi-plus-lg"></i>
          </button>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={
                      selectedIds.length > 0 &&
                      selectedIds.length === myInventories.length
                    }
                  />
                </th>
                <th>{t("Title")}</th>
                <th>{t("Description")}</th>
                <th>{t("Category")}</th>
              </tr>
            </thead>
            <tbody>
              {myInventories.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(inv.id)}
                      onChange={() => toggleSelect(inv.id)}
                    />
                  </td>
                  <td
                    onClick={() => navigate(`/inventories/${inv.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {inv.title}
                  </td>
                  <td
                    className="text-truncate"
                    onClick={() => navigate(`/inventories/${inv.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {inv.description || "-"}
                  </td>
                  <td
                    onClick={() => navigate(`/inventories/${inv.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {inv.category}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tab>

        <Tab eventKey="accessible" title={t("Inventories with Write Access")}>
          <table className="table table-striped mt-4">
            <thead>
              <tr>
                <th>{t("Title")}</th>
                <th>{t("Description")}</th>
                <th>{t("Category")}</th>
              </tr>
            </thead>
            <tbody>
              {accessibleInventories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-muted">
                    {t("No accessible inventories")}
                  </td>
                </tr>
              ) : (
                accessibleInventories.map((inv) => (
                  <tr key={inv.id}>
                    <td
                      onClick={() => navigate(`/inventories/${inv.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {inv.title}
                    </td>
                    <td
                      className="text-truncate"
                      onClick={() => navigate(`/inventories/${inv.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {inv.description || "-"}
                    </td>
                    <td
                      onClick={() => navigate(`/inventories/${inv.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {inv.category}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Tab>
      </Tabs>
    </div>
  );
}
