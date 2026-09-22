import SettingsSidebar from "@/components/settings/SettingsSideBar";
import { Toaster } from "react-hot-toast";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark-100 admin-panel">
      <div className="flex min-h-screen ">
        <SettingsSidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1">
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
