import NotificationBellWrapper from "@/components/notification/NotificationWrapper";
import { AdminHeader } from "@/layouts/admin/AdminHeader";
import { AdminSidebar } from "@/layouts/admin/AdminSiderBar";
import { Toaster } from "react-hot-toast";



export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark-100 admin-panel">
      <div className="flex min-h-screen ">
        <AdminSidebar />
        <div className="flex-1 flex flex-col ">
          <AdminHeader />
          <main className="flex-1  bg-[#1e293b]">
             <Toaster position="top-right" reverseOrder={false} />
            
            <div className="container mx-auto px-6 py-8 max-mb-xl:px-4 w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
