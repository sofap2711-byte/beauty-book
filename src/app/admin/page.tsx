import { isAdmin } from "./actions";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const admin = await isAdmin();

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {admin ? <AdminDashboard /> : <AdminLogin />}
    </div>
  );
}
