import { useState } from "react";
import api from "../api";

export default function LikeButton({ inventoryId, initialLiked, initialCount }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const toggleLike = async () => {
      const res = await api.post(`/inventories/${inventoryId}/like`);
      setLiked(res.data.liked);
      setCount(res.data.likesCount);
  };

  return (
    <div className="mx-2 mb-2 position-absolute end-0 bottom-0">
    <button
      className="btn d-flex align-items-center gap-2"
      onClick={toggleLike}
    >
      <i className={liked ? "bi bi-heart-fill" : "bi bi-heart"}></i>
      <span>{count}</span>
    </button>
    </div>
  );
}
