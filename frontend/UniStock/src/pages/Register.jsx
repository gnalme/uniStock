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

  const [userNameError, setUserNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleRegister = async () => {
    setUserNameError("");
    setEmailError("");
    setPasswordError("");

    let isValid = true;

    if (!userName.trim()) {
      setUserNameError(t("Name is required"));
      isValid = false;
    }
    if (!email.trim()) {
      setEmailError(t("Email is required"));
      isValid = false;
    }
    if (!password.trim()) {
      setPasswordError(t("Password is required"));
      isValid = false;
    }

    if (isValid) {
      try {
        await api.post("/account/register", { userName, email, password });
        navigate("/login");
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
          if (error.response.data.message === "Email already exists") {
            setEmailError(t("Email already exists"));
          }
        } else {
          alert(t("Registration failed"));
        }
      }
    }
  };

  return (
    <div className="position-absolute top-50 start-50 translate-middle text-center ">
      <div style={{ minWidth: "350px" }}>
        <h3 className="mb-4">{t("Create an account")}</h3>
        <div className="mb-3">
          <input
            className={`form-control ${userNameError ? 'is-invalid' : ''}`}
            placeholder={t("Name")}
            value={userName}
            onChange={e => setUserName(e.target.value)}
          />
          {userNameError && <div className="invalid-feedback">{userNameError}</div>}
        </div>
        <div className="mb-3">
          <input
            className={`form-control ${emailError ? 'is-invalid' : ''}`}
            placeholder={t("Email")}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          {emailError && <div className="invalid-feedback">{emailError}</div>}
        </div>
        <div className="mb-3">
          <input
            className={`form-control ${passwordError ? 'is-invalid' : ''}`}
            type="password"
            placeholder={t("Password")}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {passwordError && <div className="invalid-feedback">{passwordError}</div>}
        </div>
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