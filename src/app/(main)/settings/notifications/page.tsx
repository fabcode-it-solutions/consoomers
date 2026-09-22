// import Heading from "@/components/ui/Heading";
// import React from "react";
// import { Bell } from "lucide-react";

// const Page = () => {
//   return (
//     <div className="flex flex-col items-center justify-center h-full py-20 text-center">
//       <div className="flex items-center gap-3 mb-4">
//         <Bell className="w-8 h-8 text-blue-600" />
//         <Heading level={1}>Notifications</Heading>
//       </div>

//       <p className="text-gray-600 text-lg font-sofia-sans max-w-md">
//         We are currently working on this section. Soon you&apos;ll be able to
//         customize how you receive alerts and updates.
//       </p>

//       <div className="mt-8 px-6 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg shadow-sm">
//         <span className="font-medium">Coming Soon 🚧</span>
//       </div>
//     </div>
//   );
// };

// export default Page;

import React from "react";
import { Bell, Mail, Smartphone, MessageCircle, Volume2 } from "lucide-react";
import Heading from "@/components/ui/Heading";

type NotificationCardProps = {
  icon: React.ElementType;
  title: string;
  description: string;
};

const NotificationCard = ({
  icon: Icon,
  title,
  description,
}: NotificationCardProps) => {
  return (
    <div className="flex items-center justify-between gap-5 md:gap-0 p-4 bg-white/5 border-gray-300 border-2 rounded-sm hover:bg-white/10 transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-md bg-blue-600/20 text-blue-400">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-black">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>

      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" />
        <div
          className="w-12 h-7 bg-gray-300 rounded-full peer
               peer-checked:bg-blue-600 transition-colors"
        ></div>
        <span
          className="absolute left-1 top-1 h-5 w-5 bg-white rounded-full shadow-md
               transition-all peer-checked:translate-x-5"
        ></span>
      </label>
    </div>
  );
};

const NotificationsSettingsPage = () => {
  return (
    <div className=" space-y-8 max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <Heading level={1}>Notifications Settings</Heading>
        <p className="text-gray-400 mt-2 text-sm">
          Control how you want to get updates and alerts.
        </p>
      </div>

      <div className="space-y-4">
        <NotificationCard
          icon={Bell}
          title="General Alerts"
          description="Get important system notifications and updates"
        />
        <NotificationCard
          icon={Mail}
          title="Email Notifications"
          description="Receive updates in your registered email inbox"
        />
        <NotificationCard
          icon={Smartphone}
          title="Push Notifications"
          description="Show instant push alerts on your device"
        />
        <NotificationCard
          icon={MessageCircle}
          title="Messages"
          description="Alerts for new messages and conversations"
        />
        <NotificationCard
          icon={Volume2}
          title="Sound Alerts"
          description="Play sound when new notifications arrive"
        />
      </div>

      <div className="text-center pt-10">
        <span className="text-blue-400 font-semibold text-sm bg-blue-600/10 px-4 py-2 rounded-xl">
          Changes will auto-save
        </span>
      </div>
    </div>
  );
};

export default NotificationsSettingsPage;
