import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SocialLoginCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const isAdmin = searchParams.get("isAdmin");
    const userId = searchParams.get("userId");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("isAdmin", isAdmin);
      localStorage.setItem("userId", userId);
      
      navigate(isAdmin === "true" ? "/admin" : "/");
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="container mt-5 text-center">
      <h3>Logging in...</h3>
      <p>Please wait, you will be redirected shortly.</p>
    </div>
  );
}