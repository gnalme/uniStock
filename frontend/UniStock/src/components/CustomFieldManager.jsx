import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Button, Form, Modal, Spinner, Alert } from "react-bootstrap";
import api from "../api";
import { useTranslation } from "react-i18next";

export default function CustomFieldManager() {
  const { id } = useParams();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();

  const [newField, setNewField] = useState({
    title: "",
    description: "",
    type: "TextSingle",
    showInTable: true,
    order: 0,
  });

  const fieldTypes = {
  TextSingle: 0,
  TextMulti: 1,
  Number: 2,
  Bool: 3,
  Link: 4,
};

  const loadFields = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/customfield/${id}`);
      setFields(res.data);
    } catch (err) {
      setError("Error to load field");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      await api.post("/customfield", {
        inventoryId: id,
        title: newField.title,
        description: newField.description,
        type: fieldTypes[newField.type],
        showInTable: newField.showInTable,
        order: newField.order,
      });
      setShowModal(false);
      setNewField({
        title: "",
        description: "",
        type: "TextSingle",
        showInTable: true,
        order: fields.length + 1,
      });
      loadFields();
    } catch (err) {
      setError("Error field create");
    } finally {
      setLoading(false);
    }
  };

  const typeCounts = fields.reduce((acc, f) => {
  acc[f.type] = (acc[f.type] || 0) + 1;
  return acc;
}, {});

  const handleDelete = async (id) => {
    try {
      await api.delete(`/customfield/${id}`);
      loadFields();
    } catch (err) {
      setError("Error field delete");
    }
  };

  useEffect(() => {
    loadFields();
  }, [id]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>{t("Custom Fields")}</h4>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          {t("Add field")}
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>{t("Title")}</th>
              <th>{t("Description")}</th>
              <th>{t("Type")}</th>
              <th>{t("In table")}</th>
              <th>{t("Order")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.id}>
                <td>{f.title}</td>
                <td>{f.description}</td>
                <td>{f.type}</td>
                <td>{f.showInTable ? "Yes" : "No"}</td>
                <td>{f.order}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(f.id)}
                  >
                    {t("Delete")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t("New custom field")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>{t("Title")}</Form.Label>
              <Form.Control
                type="text"
                value={newField.title}
                onChange={(e) =>
                  setNewField({ ...newField, title: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>{t("Description")}</Form.Label>
              <Form.Control
                type="text"
                value={newField.description}
                onChange={(e) =>
                  setNewField({ ...newField, description: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>{t("Type")}</Form.Label>
              <Form.Select
                value={newField.type}
                onChange={(e) =>
                  setNewField({ ...newField, type: e.target.value })
                }
              >
                {["TextSingle", "Number", "Bool", "Date", "Select"].map((type) => (
                  <option key={type} value={type} disabled={typeCounts[type] >= 3}>
                    {type} {typeCounts[type] >= 3 ? "(limit)" : ""}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Check
                type="checkbox"
                label={t("Show in table")}
                checked={newField.showInTable}
                onChange={(e) =>
                  setNewField({ ...newField, showInTable: e.target.checked })
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>{t("Order")}</Form.Label>
              <Form.Control
                type="number"
                value={newField.order}
                onChange={(e) =>
                  setNewField({ ...newField, order: Number(e.target.value) })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t("Cancel")}
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            {t("Create")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
