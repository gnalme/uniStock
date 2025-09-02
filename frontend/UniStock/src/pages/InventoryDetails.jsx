import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, Tab } from 'react-bootstrap';
import api from '../api';
import Comments from '../components/Comments';
import EditPage from '../components/EditComponent';
import { useTranslation } from 'react-i18next';
import AccessManager from './AccessManager';
import ItemManager from '../components/ItemManager';

export default function InventoryDetails() {
  const { id } = useParams();
  const [inventory, setInventory] = useState(null);
  const [items, setItems] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setErr('');

        if (!id || id === 'undefined') {
          throw new Error('Invalid inventory ID');
        }

        const [inventoryRes, itemsRes] = await Promise.all([
          api.get(`/inventories/${id}`),
          api.get(`/item/${id}`),
        ]);

        setInventory(inventoryRes.data);
        setCustomFields(inventoryRes.data.fields || []);
        setItems(itemsRes.data || []);
      } catch (e) {
        setErr(e.response?.data?.message || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) return <p className="m-3">Loading...</p>;
  if (err) return <p className="m-3 text-danger">{err}</p>;
  if (!inventory) return <p className="m-3">Inventory not found</p>;

  return (
    <div className="container mt-4">
      <h3>{inventory.title}</h3>
      <hr />

      <Tabs defaultActiveKey={inventory.canEdit ? "edit" : "items"} id="inventory-tabs" className="mb-3">
        {inventory.canEdit && (
          <Tab eventKey="edit" title={t("Edit")}>
            <EditPage />
          </Tab>
        )}

        <Tab eventKey="items" title={t("Items")}>
          <ItemManager inventoryId={id} />
        </Tab>

        <Tab eventKey="comments" title={t("Comments")}>
          <Comments inventoryId={inventory.id} />
        </Tab>

        {inventory.canManage && (
          <Tab eventKey="access" title={t("Access")}>
            <AccessManager />
          </Tab>
        )}

        
      </Tabs>
    </div>
  );
}
