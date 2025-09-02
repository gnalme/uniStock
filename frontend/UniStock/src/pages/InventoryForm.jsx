import { useState, useEffect } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api";

export default function InventoryForm() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isPublicWritable, setIsPublicWritable] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return; 

    const loadInventory = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/inventories/${id}`);
        const inv = res.data;
        setTitle(inv.title || "");
        setDescription(inv.description || "");
        setCategory(inv.category || "");
        setIsPublicWritable(inv.isPublicWritable || false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      title,
      description,
      category,
      isPublicWritable,
    };

    try {
      if (id) {
        await api.put(`/inventories/${id}`, payload);
        navigate(`/inventories/${id}`);
      } else {
        await api.post("/inventories", payload);
        navigate("/inventories");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Save error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <h3>{id ? t("Edit Inventory") : t("Create Inventory")}</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{t("Title")} *</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t("Description")}</Form.Label>
          <Form.Control
            as="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t("Category")}</Form.Label>
          <Form.Control
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            checked={isPublicWritable}
            onChange={(e) => setIsPublicWritable(e.target.checked)}
            label={t("Allow public editing")}
          />
        </Form.Group>

        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : t("Create Inventory")}
        </Button>
      </Form>
    </div>
  );
}
