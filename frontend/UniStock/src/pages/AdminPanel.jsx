import { useEffect, useState } from "react";
import api from "../api";
import { useTranslation } from 'react-i18next';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]); 
  const { t } = useTranslation();

  const loadUsers = async () => {
    const res = await api.get("/admin/users");
    setUsers(res.data);
  };

  const action = async (url) => {
    const ids = selectedUsers;
    const formData = new URLSearchParams();
    ids.forEach(id => formData.append("ids", id));

    try {
      const res = await api.post(`/admin/${url}`, formData);
      
      if (res.data.logoutSelf) {
        localStorage.clear(); 
        window.location.href = '/login'; 
        return;
      }
      
      loadUsers();
      setSelectedUsers([]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allUserIds = users.map(u => u.id);
      setSelectedUsers(allUserIds);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (e, userId) => {
    if (e.target.checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const isAllSelected = selectedUsers.length === users.length && users.length > 0;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-start gap-2 mb-3">
        <button 
          className="btn btn-sm btn-outline-primary" 
          onClick={() => action("block")} 
          disabled={selectedUsers.length === 0}
        >
          <i className="bi bi-lock"></i> {t("Block")}
        </button>
        <button 
          className="btn btn-sm btn-outline-primary" 
          onClick={() => action("unblock")} 
          disabled={selectedUsers.length === 0}
        >
          <i className="bi bi-unlock"></i> {t("Unblock")}
        </button>
        <button 
          className="btn btn-sm btn-outline-primary" 
          onClick={() => action("makeadmin")} 
          disabled={selectedUsers.length === 0}
        >
          <i className="bi bi-person-add"></i> {t("Make Admin")}
        </button>
        <button 
          className="btn btn-sm btn-outline-primary" 
          onClick={() => action("unmakeadmin")} 
          disabled={selectedUsers.length === 0}
        >
          <i className="bi bi-person-slash"></i> {t("Remove Admin")}
        </button>
        <button 
          className="btn btn-sm btn-outline-danger" 
          onClick={() => action("delete")} 
          disabled={selectedUsers.length === 0}
        >
          <i className="bi bi-trash3"></i> {t("Delete")}
        </button>
      </div>

      <table className="table table-striped mt-4">
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                onChange={handleSelectAll} 
                checked={isAllSelected}
              />
            </th>
            <th>Email</th>
            <th>{t("Name")}</th>
            <th>{t("Blocked")}</th>
            <th>{t("Admin")}</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedUsers.includes(u.id)} 
                  onChange={(e) => handleSelectUser(e, u.id)}
                />
              </td>
              <td>{u.email}</td>
              <td>{u.userName}</td>
              <td>{u.isBlocked ? "Yes" : "No"}</td>
              <td>{u.isAdmin ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}