import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import api from '../api';
import { useTranslation } from 'react-i18next';

export default function AddItemModal({ show, onHide, inventoryId, customFields, onAddItemSuccess }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newItem, setNewItem] = useState({
    customId: '',
    fieldValues: {}
  });

  useEffect(() => {
    if (show) {
      setNewItem({
        customId: '',
        fieldValues: {}
      });
      setError('');
    }
  }, [show]);

  const handleAddItem = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = {
        inventoryId,
        ...(newItem.customId ? { customId: newItem.customId } : {}),
        fieldValues: Object.entries(newItem.fieldValues)
          .filter(([_, value]) => value !== "" && value !== null && value !== undefined)
          .map(([fieldId, value]) => ({
            fieldId: fieldId,
            value
          }))
      };

      await api.post('/item', payload);

      onAddItemSuccess();
      onHide();
    } catch (err) {
      setError(err.response?.data?.message || t('Error adding item'));
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId, value) => {
    setNewItem(prev => ({
      ...prev,
      fieldValues: {
        ...prev.fieldValues,
        [fieldId]: value
      }
    }));
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{t("Add new Item")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Custom ID</Form.Label>
            <Form.Control
              type="text"
              placeholder={t("(generated automatically)")}
              value={newItem.customId}
              onChange={(e) => setNewItem({ ...newItem, customId: e.target.value })}
            />
          </Form.Group>

          {customFields.map(field => (
            <Form.Group className="mb-3" key={field.id}>
              <Form.Label>
                {field.title}{" "}
                {field.description && (
                  <span className="text-muted small">({field.description})</span>
                )}
              </Form.Label>
              {field.type === "TextSingle" && (
                <Form.Control
                  type="text"
                  value={newItem.fieldValues[field.id] || ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                />
              )}
              {field.type === "TextMulti" && (
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newItem.fieldValues[field.id] || ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                />
              )}
              {field.type === "Number" && (
                <Form.Control
                  type="number"
                  value={newItem.fieldValues[field.id] || ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                />
              )}
              {field.type === "Bool" && (
                <Form.Check
                  type="checkbox"
                  label="Yes / No"
                  checked={newItem.fieldValues[field.id] || false}
                  onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                />
              )}
              {field.type === "Link" && (
                <Form.Control
                  type="url"
                  placeholder="https://..."
                  value={newItem.fieldValues[field.id] || ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                />
              )}
            </Form.Group>
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t("Cancel")}
        </Button>
        <Button variant="primary" onClick={handleAddItem} disabled={loading}>
          {loading ? (
            <>
              <Spinner as="span" size="sm" animation="border" />
            </>
          ) : (
            <>
              {t("Add")}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}