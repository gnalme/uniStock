import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Table, Button, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import api from '../api';
import { useTranslation } from 'react-i18next';
import AddItemModal from './AddItemModal';

export default function ItemManager({ inventoryId: propInventoryId }) {
  const { inventoryId: routeId } = useParams();
  const inventoryId = propInventoryId || routeId;
  const [items, setItems] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canEdit, setCanEdit] = useState(true); 
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();

  const { t } = useTranslation();

  const loadItems = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/item/${inventoryId}`);
      setItems(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error to load items');
    } finally {
      setLoading(false);
    }
  };

  const loadFields = async () => {
    try {
      const res = await api.get(`/customfield/${inventoryId}`);
      setCustomFields(res.data);
    } catch (err) {
      console.error('Error to load custom fields', err);
    }
  };

  useEffect(() => {
    loadItems();
    loadFields();
  }, [inventoryId]);


  const toggleSelect = (id) => {
  setSelectedIds(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );
};

const toggleSelectAll = () => {
  if (selectedIds.length === items.length) {
    setSelectedIds([]);
  } else {
    setSelectedIds(items.map(it => it.id));
  }
};

const handleBulkDelete = async () => {
  if (selectedIds.length === 0) return;
  
  try {
    await api.post('/item/delete', selectedIds)
    setItems(prev => prev.filter(it => !selectedIds.includes(it.id)));
    setSelectedIds([]);
  } catch (err) {
    setError(err.response?.data?.message || 'Item delete error');
  }
};

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        {canEdit && (
          <div className='position-relative left-0'>
            <Button variant="primary" onClick={() => navigate(`/customfield/${inventoryId}`)} className='me-2'>
              {t("Add Field")}
            </Button>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              {t("Add Item")}
            </Button>
            <Button
              variant="danger"
              className="ms-2"
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
            >
              {t("Delete")}
            </Button>
          </div>
        )}
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>
                <Form.Check
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={selectedIds.length > 0 && selectedIds.length === items.length}
                />
              </th>
              <th>Custom ID</th>
              {customFields.filter(f => f.showInTable).map(f => (
                <th key={f.id}>{f.title}</th>
              ))}
              <th>{t("Created")}</th>
              <th>{t("Author")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={selectedIds.includes(it.id)}
                    onChange={() => toggleSelect(it.id)}
                  />
                </td>
                <td>{it.customId}</td>
                {customFields.filter(f => f.showInTable).map(f => (
                  <td key={f.id}>
                    {it.fieldValues?.find(v => v.fieldId === f.id)?.value || ''}
                  </td>
                ))}
                <td>{new Date(it.createdAt).toLocaleString()}</td>
                <td>{it.createdByName}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <AddItemModal
      show={showAddModal}
        onHide={() => setShowAddModal(false)}
        inventoryId={inventoryId}
        customFields={customFields}
        onAddItemSuccess={loadItems}
        />

      
    </div>
  );
}
