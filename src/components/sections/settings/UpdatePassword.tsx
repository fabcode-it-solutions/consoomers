// "use client";

// import Button from "@/components/ui/Button";
// import React, { useState } from "react";
// import { Eye, EyeOff } from "lucide-react";

// interface ChangePasswordProps {
//   userId: string;
// }

// const ChangePassword: React.FC<ChangePasswordProps> = ({ userId }) => {
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const [showOld, setShowOld] = useState(false);
//   const [showNew, setShowNew] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const handleChangePassword = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setMessage(null);
//     setError(null);

//     if (newPassword !== confirmPassword) {
//       setError("New passwords do not match");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch("/api/settings/update-password", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId, oldPassword, newPassword, confirmPassword }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setMessage("Password updated successfully!");
//         setOldPassword("");
//         setNewPassword("");
//         setConfirmPassword("");
//       } else {
//         setError(data.error || "Something went wrong");
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white shadow-sm rounded-sm">
//       <h2 className="text-xl font-semibold mb-4">Change Password</h2>

//       <form onSubmit={handleChangePassword} className="space-y-4">
//         {/* Old Password */}
//         <div>
//           <label className="block text-sm font-medium mb-1">Old Password</label>
//           <div className="relative">
//             <input
//               type={showOld ? "text" : "password"}
//               value={oldPassword}
//               onChange={(e) => setOldPassword(e.target.value)}
//               className="w-full border border-gray-300 rounded-md p-2 pr-10"
//               required
//             />
//             <button
//               type="button"
//               onClick={() => setShowOld((prev) => !prev)}
//               className="absolute right-3 top-2.5 text-gray-500"
//             >
//               {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
//             </button>
//           </div>
//         </div>

//         {/* New Password */}
//         <div>
//           <label className="block text-sm font-medium mb-1">New Password</label>
//           <div className="relative">
//             <input
//               type={showNew ? "text" : "password"}
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               className="w-full border border-gray-300 rounded-md p-2 pr-10"
//               required
//             />
//             <button
//               type="button"
//               onClick={() => setShowNew((prev) => !prev)}
//               className="absolute right-3 top-2.5 text-gray-500"
//             >
//               {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
//             </button>
//           </div>
//         </div>

//         {/* Confirm Password */}
//         <div>
//           <label className="block text-sm font-medium mb-1">Confirm New Password</label>
//           <div className="relative">
//             <input
//               type={showConfirm ? "text" : "password"}
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               className="w-full border border-gray-300 rounded-md p-2 pr-10"
//               required
//             />
//             <button
//               type="button"
//               onClick={() => setShowConfirm((prev) => !prev)}
//               className="absolute right-3 top-2.5 text-gray-500"
//             >
//               {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
//             </button>
//           </div>
//         </div>

//         {message && <p className="text-green-600">{message}</p>}
//         {error && <p className="text-red-600">{error}</p>}

//         <div className="flex justify-center">
//           <Button type="submit" className="text-white">
//             {loading ? "Updating..." : "Change Password"}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ChangePassword;


"use client";

import Button from "@/components/ui/Button";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface ChangePasswordProps {
  userId: string;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ userId }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/settings/update-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, oldPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white border border-gray-100">
      <h2 className="text-2xl font-semibold mb-6 text-center">Change Password</h2>

      <form onSubmit={handleChangePassword} className="space-y-5">
        {/* Old Password */}
        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Old Password
          </label>
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 pr-12 transition-all outline-none text-gray-900"
              required
            />
            <button
              type="button"
              onClick={() => setShowOld((prev) => !prev)}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
            >
              {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 pr-12 transition-all outline-none text-gray-900"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew((prev) => !prev)}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
            >
              {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 pr-12 transition-all outline-none text-gray-900"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {message && <p className="text-green-600 text-center font-medium">{message}</p>}
        {error && <p className="text-red-600 text-center font-medium">{error}</p>}

        <div className="flex justify-center pt-2">
          <Button type="submit" className="text-white">
            {loading ? "Updating..." : "Change Password"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
