import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function Register() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await api.post("/account/register", { userName, email, password });
      navigate("/login");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div className="position-absolute top-50 start-50 translate-middle text-center ">
    <div style={{ minWidth: "350px" }}>
      <h3 className="mb-4">{t("Create an account")}</h3>
      <input className="form-control mb-3" placeholder={t("Name")} value={userName} onChange={e => setUserName(e.target.value)} />
      <input className="form-control mb-3" placeholder={t("Email")} value={email} onChange={e => setEmail(e.target.value)} />
      <input className="form-control mb-3" type="password" placeholder={t("Password")} value={password} onChange={e => setPassword(e.target.value)} />
      <button className="btn btn-primary w-100" onClick={handleRegister}>{t("Register")}</button>
      <div className="socials d-flex mt-3 gap-2">
        <a 
          href="http://localhost:5265/api/account/login-google" 
          className="btn btn-outline-danger w-100"
        >
          <i className="bi bi-google"></i> {t("Google")}
        </a>
        <a 
          href="http://localhost:5265/api/account/login-github" 
          className="btn btn-outline-dark w-100 github"
        >
          <i className="bi bi-github"></i> {t("GitHub")}
        </a>
      </div>
    </div>
    </div>
  );
}
