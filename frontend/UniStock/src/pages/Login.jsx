import { useState } from "react";
import api from "../api.js";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/account/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("isAdmin", res.data.isAdmin);
      localStorage.setItem("userName", res.data.userName);
      navigate(res.data.isAdmin ? "/inventories" : "/");
    } catch(err) {
        const msg = err.response?.data?.message;
        if (msg === "User is blocked") {
          alert("User blocked. Contact the administrator.");
        } else {
          alert("Invalid email or password");
        }
    }
  };

  return (
    <div className="position-absolute top-50 start-50 translate-middle text-center ">
      <div style={{ minWidth: "350px" }}>
        <h3>{t("Sign In")}</h3>
        <h5 className="mb-4">{t("or")} <Link to="/register">{t("create an account")}</Link> </h5>
        <input className="form-control mb-3" placeholder={t("Email")} value={email} onChange={e => setEmail(e.target.value)} />
        <input className="form-control mb-3" type="password" placeholder={t("Password")} value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn btn-primary w-100" onClick={handleLogin}>{t("Continue")}</button>
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
        <h5 className="mt-4"><Link to="/inventories">{t("Sign in as a guest")}</Link></h5>
      </div>
    </div>
  );
}
