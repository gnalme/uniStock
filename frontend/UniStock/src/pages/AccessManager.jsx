import { useEffect, useState } from "react";
import api from "../api";
import { useTranslation } from 'react-i18next';
import { useParams } from "react-router-dom";

export default function AccessManager() {
  const {id} = useParams();
  const [accessList, setAccessList] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const { t } = useTranslation();

  const loadAccessList = async () => {
    const res = await api.get(`/access/${id}`);
    setAccessList(res.data);
  };

  const loadUsers = async () => {
    const res = await api.get("/admin/users");
    setUsers(res.data);
  };

  const grantAccess = async () => {
    if (!selectedUser) {
      alert("Please select a user to grant access.");
      return;
    }

    try {
      await api.post("/access/grant", {
        userId: selectedUser,
        inventoryId: id,
      });
      setSelectedUser("");
      loadAccessList();
    } catch (err) {
      console.error("Failed to grant access:", err);
      alert(err.response?.data?.message || "An error occurred.");
    }
  };

  const revokeAccess = async (userId) => {
    await api.post("/access/revoke", {
      inventoryId: id,
      userId,
    });
    loadAccessList();
  };

  useEffect(() => {
    loadAccessList();
    loadUsers();
  }, [id]);

  return (
    <div className="container mt-4">
      <div className="input-group mb-2 mt-4">
        <select
          className="form-select"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">{t("Select user")}</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.userName}   ({u.email})
            </option>
          ))}
        </select>
        <button className="btn btn-success" onClick={grantAccess}>
          {t("Grant")}
        </button>
      </div>

      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            <th>{t("User")}</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {accessList.map((a) => (
            <tr key={a.userId}>
              <td>{a.userName}</td>
              <td>{a.email}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => revokeAccess(a.userId)}
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
