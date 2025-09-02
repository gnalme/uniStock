import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useContext } from "react";
import { ThemeContext } from "../themeContext";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const userName = localStorage.getItem('userName');
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const { user } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark p-3">
      <div className="container-fluid">
        <h4 className="text-light m-0">UniStock</h4>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto ms-lg-4 mt-2 gap-3">
            {token && (
              <>
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === "/inventories" ? "fw-bold text-white" : ""}`} to="/inventories">{t("Inventories")}</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === "/profile" ? "fw-bold text-white" : ""}`} to="/profile">{t("Profile")}</Link>
              </li>
              </>
            )}
            {token && isAdmin && (
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === "/admin" ? "fw-bold text-white" : ""}`} to="/admin">{t("Admin Panel")}</Link>
              </li>
            )}
          </ul>

          <div className="d-flex flex-column flex-lg-row align-items-lg-center">
            {token ? (
              <>
                <div className="d-flex justify-content-between me-3 gap-3">
                  {user && (
                  <span className="navbar-text me-lg-3 mb-2 mb-lg-0">
                    {t("Welcome")}, {user.userName}
                  </span>
                )}

                <div className="form-check form-switch text-light d-flex justify-content-center align-items-center me-lg-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="themeSwitch"
                    checked={theme === "dark"}
                    onChange={toggleTheme}
                  />
                  <label className="form-check-label ms-2" htmlFor="themeSwitch">
                    {theme === "dark" ? "Dark" : "Light"}
                  </label>
                </div>

                <div className="btn-group mb-2 mb-lg-0 me-lg-3 p-1">
                  <button 
                    className={`btn btn-sm ${i18n.language === 'en' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => changeLanguage('en')}
                  >
                    EN
                  </button>
                  <button 
                    className={`btn btn-sm ${i18n.language === 'ru' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => changeLanguage('ru')}
                  >
                    RU
                  </button>
                </div>
                </div>

                <button className="btn btn-outline-light mb-2 mb-lg-0" onClick={logout}>
                  {t("Logout")}
                  <i className="bi bi-box-arrow-right ms-2"></i>
                </button>
              </>
            ) : (
              <>
                <div className="form-check form-switch text-light mb-2 mb-lg-0 me-lg-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="themeSwitch"
                    checked={theme === "dark"}
                    onChange={toggleTheme}
                  />
                  <label className="form-check-label" htmlFor="themeSwitch">
                    {theme === "dark" ? "Dark" : "Light"}
                  </label>
                </div>

                <div className="btn-group mb-2 mb-lg-0 me-lg-3">
                  <button 
                    className={`btn btn-sm ${i18n.language === 'en' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => changeLanguage('en')}
                  >
                    EN
                  </button>
                  <button 
                    className={`btn btn-sm ${i18n.language === 'ru' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => changeLanguage('ru')}
                  >
                    RU
                  </button>
                </div>

                <Link className="btn btn-outline-light me-2 mb-2 mb-lg-0" to="/login">
                  {t("Sign In")}
                </Link>
                <Link className="btn btn-primary mb-2 mb-lg-0" to="/register">
                  {t("Register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
