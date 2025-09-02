import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { useTranslation } from 'react-i18next';
import { Form } from 'react-bootstrap';

export default function InventoryDetails() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [isPublicWritable, setIsPublicWritable] = useState(false);

  const [savedMessage, setSavedMessage] = useState("");
  const saveIntervalRef = useRef(null);

  const hasChanges =
    editTitle !== inventory?.title ||
    editDescription !== inventory?.description ||
    editCategory !== inventory?.category ||
    isPublicWritable !== inventory?.isPublicWritable;

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await api.get(`/inventories/${id}`);
        setInventory(res.data);
        setEditTitle(res.data.title);
        setEditDescription(res.data.description);
        setEditCategory(res.data.category);
        setIsPublicWritable(res.data.isPublicWritable);
      } catch (e) {
        console.error("Failed to fetch inventory", e);
        setError("Failed to load inventory details.");
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [id]);

  useEffect(() => {
    if (inventory?.canEdit) {
      saveIntervalRef.current = setInterval(() => {
        if (hasChanges) {
          handleAutoSave();
        }
      }, 5500);
    }
    return () => clearInterval(saveIntervalRef.current);
  }, [inventory, editTitle, editDescription, editCategory, isPublicWritable , hasChanges]);

  const handleAutoSave = async () => {
    try {
      await api.put(`/inventories/${id}`, {
        id: id,
        title: editTitle,
        description: editDescription,
        category: editCategory,
        isPublicWritable: isPublicWritable
      });
      setSavedMessage(t("Saved successfully"));
      setTimeout(() => setSavedMessage(""), 2500);

      setInventory(prev => ({
        ...prev,
        title: editTitle,
        description: editDescription,
        category: editCategory,
        isPublicWritable: isPublicWritable
      }));
    } catch (e) {
      console.error("Auto-save failed", e);
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 text-danger">{error}</div>;
  if (!inventory) return <div className="container mt-4">Inventory not found.</div>;
  
  return (
    <div className="container pe-4 pb-4 me-4 mt-4">
      <div className="mb-3">
        <label className="form-label">{t("Title")}</label>
        <input
          type="text"
          className="form-control"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          disabled={!inventory.canEdit} 
        />
        
      </div>
      <div className="mb-3">
        <label className="form-label">{t("Description")}</label>
        <textarea
          className="form-control"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          disabled={!inventory.canEdit} 
        />
      </div>
      <div className="mb-3">
        <label className="form-label">{t("Category")}</label>
        <input
          type="text"
          className="form-control"
          value={editCategory}
          onChange={(e) => setEditCategory(e.target.value)}
          disabled={!inventory.canEdit} 
        />
      </div>
      <div className="mb-3">
        <Form.Check
          type="checkbox"
          checked={isPublicWritable}
          onChange={(e) => setIsPublicWritable(e.target.checked)}
          label={t("Allow public editing")}
          disabled={!inventory.canEdit}
        />
      </div>
      {savedMessage && (
        <div className="alert alert-success py-2 position-absolute">{savedMessage}</div>
      )}
    </div>
  );
}
