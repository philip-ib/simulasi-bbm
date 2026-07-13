import { useApp } from "../../context/AppContext.jsx";
import AdminLogin from "./AdminLogin.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

export default function AdminPage() {
  const { isLoggedIn } = useApp();

  if (!isLoggedIn) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}
