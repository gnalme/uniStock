import { BrowserRouter, Routes, Route } from "react-router-dom";
import './i18n'; 
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPanel from "./pages/AdminPanel";
import Navbar from "./components/Navbar";
import Inventories from "./pages/Inventories";
import InventoryDetails from "./pages/InventoryDetails";
import InventoryForm from "./pages/InventoryForm";
import AccessManager from "./pages/AccessManager";
import ItemsManagement from "./components/ItemManager";
import { ThemeProvider } from "./themeContext.jsx";
import CustomFieldManager from "./components/CustomFieldManager.jsx";
import SocialLoginCallback from "./components/SocialLoginCallback.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx"; 
import ProfilePage from "./pages/ProfilePage.jsx";
import { AuthProvider } from "./AuthContext.jsx";

function App() {
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/social-login-success" element={<SocialLoginCallback />} />
          
          <Route path="/" element={<ProtectedRoute element={<Inventories />} />} />
          <Route path="/inventories" element={<Inventories />}/>
          <Route path="/inventories/new" element={<ProtectedRoute element={<InventoryForm />} />} />
          <Route path="/inventories/:id" element={<InventoryDetails />} />
          <Route path="/inventories/:inventoryId/items" element={<ProtectedRoute element={<ItemsManagement />} />} />
          <Route path="/inventories/:inventoryId/fields" element={<ProtectedRoute element={<CustomFieldManager />} />} />
          <Route path="/profile" element={<ProfilePage />}/>
          <Route path="/customfield/:id" element={<ProtectedRoute element={<CustomFieldManager />} />} />

          {isAdmin && <Route path="/admin" element={<ProtectedRoute element={<AdminPanel />} />} />}
        </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;