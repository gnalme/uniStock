import { useEffect, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import api from "../api";
import { useTranslation } from 'react-i18next';

export default function Comments({ inventoryId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [connection, setConnection] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    loadComments();

    const newConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5265/commentsHub", {
        accessTokenFactory: () => localStorage.getItem("token")
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, [inventoryId]);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          connection.invoke("JoinGroup", inventoryId);

          connection.on("ReceiveComment", (comment) => {
            setComments((prev) => [comment, ...prev]);
          });
        })
        .catch(err => console.error("Connection failed: ", err));
    }
  }, [connection]);

  const loadComments = async () => {
    const res = await api.get(`/comments/${inventoryId}`);
    setComments(res.data);
  };

  const handleAdd = async () => {
    if (!text.trim()) return;
    await api.post("/comments", { inventoryId, text });
    setText("");
  };

  return (
    <div className="mt-4 pt-4 d-flex flex-column position-relative bottom-0 comm">
      <h5>{t("Comments")}</h5>
      <div className="input-group mb-3">
        <input
          className="form-control"
          placeholder={t("Write a comment...")}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleAdd}>
          {t("Send")}
        </button>
      </div>

      <ul className="list-group">
        {comments.map((c) => (
          <li key={c.id} className="list-group-item">
            <strong>{c.userName}</strong> 
            <p>{c.text}</p>
            <div className="small text-muted">
              {new Date(c.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
