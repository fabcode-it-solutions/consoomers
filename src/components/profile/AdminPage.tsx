// ==================== AdminPage.tsx ====================

"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AdminProfileCard from "./AdminProfilePage";


// Admin profile interface
export interface AdminProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  username?: string;
  imageUrl?: string;
  createdAt: string | Date;
  permissions?: string[];
  department?: string;
  position?: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: string;
  imageUrl?: string;
  createdAt?: string | Date;
}

const AdminPage = ({ user }: { user: User }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  // For admins, we can create the profile directly from user data
  const adminProfile: AdminProfile = {
    id: user.id,
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role || "admin",
    username: user.username,
    imageUrl: user.imageUrl,
    createdAt: user.createdAt || new Date(),
    permissions: ["User Management", "Brand Management", "Product Management", "Vote Management", "System Settings"],
    department: "Administration",
    position: "System Administrator",
  };

  const currentUser =
    session?.user?.id && session?.user?.role
      ? {
          id: session.user.id,
          role: session.user.role,
        }
      : undefined;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-100 p-8">
          <div className="animate-pulse">
            <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminProfileCard
      profile={adminProfile}
      currentUser={currentUser}
    />
  );
};

export default AdminPage;