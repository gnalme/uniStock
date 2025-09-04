import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useTranslation } from "react-i18next";
import LikeButton from "../components/LikeButton";

export default function Inventories() {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    api
      .get("/inventories")
      .then((res) => setInventories(res.data))
      .catch((e) => {
        console.error(e);
        setErr("Failed to load inventories");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = searchTerm.trim();
    if (!q) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await api.get("/inventories/search", {
          params: { query: q },
        });
        setSearchResults(res.data);
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  const list = searchTerm.trim() ? searchResults : inventories;

  useEffect(() => {
    api.get("/inventories")
      .then(res => setInventories(res.data))
      .catch(() => setErr("Failed to load inventories"))
      .finally(() => setLoading(false));
  }, []);   

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const deletable = inventories.filter((i) => i.canDelete).map((i) => i.id);
    if (selectedIds.length === deletable.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(deletable);
    }
  };

   const handleBulkDelete = async () => {
    try {
      await api.post("/inventories/bulk-delete", selectedIds);
      setInventories((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
      setSearchResults((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
      setSelectedIds([]);
      setSelectMode(false);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Delete failed");
    }
  };



  if (loading) return <div className="container mt-4">{t("Loading...")}</div>;
  if (err) return <div className="container mt-4 text-danger">{err}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">

        <div className="d-flex">
          <div className="d p-2">
            <i class="bi bi-search"></i>
          </div>
          <input
          type="text"
          className="form-control s"
          style={{ maxWidth: 400 }}
          placeholder={t('Search by title')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="d-flex">
        {!selectMode ? (
        <button
          className="btn btn btn-outline-danger me-3"
          onClick={() => setSelectMode(true)}
        >
          {t("Delete")} <i class="bi bi-trash3"></i>
        </button>
      ) : (
        <div className="d-flex gap-1">
          <button
            className="btn btn-danger "
            onClick={handleBulkDelete}
            disabled={selectedIds.length === 0}
          >
            {t("Confirm Delete")} <i class="bi bi-trash3"></i>
          </button>
          <button
            className="btn btn-secondary mx-3"
            onClick={() => {
              setSelectMode(false);
              setSelectedIds([]);
            }}
          >
            {t("Cancel")}
          </button>
        </div>
      )}

        <button
          className="btn btn-primary"
          onClick={() => navigate("/inventories/new")}
          disabled={!isAuthenticated}
        >
          {t("Create Inventory")} <i className="bi bi-plus-lg"></i>
        </button>
        </div>
      </div>

      {searchTerm.trim() && (
        <div className="mb-2 small text-muted">
          {searching ? t("Searching...") : `${t("Found")}: ${list.length}`}
        </div>
      )}

      {selectMode && (
        <div className="d-flex mb-3 mt-0 mx-1">
            <input
            type="checkbox"
            checked={
              selectedIds.length > 0 &&
              selectedIds.length === inventories.filter((i) => i.canDelete).length
            }
            onChange={toggleSelectAll}
          />
          <p className="mb-0 mx-1">{t("Select All")}</p>
        </div>
        )}

      <div className="row">
        {list.length === 0 && <p>No inventories found.</p>}

        {list.map((inv) => (
          <div className="col-md-4 mb-4" key={inv.id}>
            <div className="card h-100 shadow-sm">

              {selectMode && inv.canDelete && (
                  <input
                    type="checkbox"
                    className="form-check-input mx-2 mt-2 position-absolute end-0"
                    checked={selectedIds.includes(inv.id)}
                    onChange={() => toggleSelect(inv.id)}
                  />
                )}

                <LikeButton 
                  inventoryId={inv.id} 
                  initialLiked={inv.userHasLiked} 
                  initialCount={inv.likesCount} />

              <div
                className="card-body"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/inventories/${inv.id}`)}
              >
                <h5 className="card-title">{inv.title}</h5>
                <p className="card-text text-muted">{inv.category}</p>

                {inv.description && (
                  <p
                    className="card-text text-truncate"
                    style={{ maxWidth: "100%" }}
                    title={inv.description}
                  >
                    {inv.description}
                  </p>
                )}

                {inv.ownerName && (
                  <p className="small text-secondary">
                    {t("Owner")}: {inv.ownerName}
                  </p>
                )}
                
              </div>
            </div>
          </div>
          
        ))}
      </div>
      
    </div>
    
  );
}
