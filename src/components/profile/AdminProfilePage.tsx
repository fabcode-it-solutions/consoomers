// ==================== AdminProfileCard.tsx ====================
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import {
  Shield,
  UserRoundCog,
  CalendarDays,
  Mail,
  Users,
  Building2,
  Package,
  Vote,
  Activity,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Interfaces
interface AdminProfile {
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

interface AdminStats {
  totalUsers: number;
  totalBrands: number;
  totalProducts: number;
  totalVotes: number;
  pendingBrandRequests: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: "user" | "brand" | "product" | "vote";
  action: string;
  timestamp: string;
  details: string;
}

interface AdminProfileCardProps {
  profile: AdminProfile;
  currentUser?: {
    id: string;
    role: string;
  };
}

const tabs = [
  { name: "Overview", icon: <Activity size={18} /> },
  { name: "Statistics", icon: <TrendingUp size={18} /> },
  { name: "Recent Activity", icon: <Clock size={18} /> },
];

export default function AdminProfileCard({
  profile,
  currentUser,
}: AdminProfileCardProps) {
  const [selectedTab, setSelectedTab] = useState("Overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const canEdit = currentUser?.id === profile.userId || currentUser?.role === "admin";

  const formatDate = (isoString: string | Date) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

useEffect(() => {
  const fetchAdminStats = async () => {
    setLoadingStats(true);

    try {
      const res = await fetch(`/api/dashboard/stats?timeRange=all`);
      const data = await res.json();
      console.log(data, "data");

      if (res.ok) {
        const d = data.data; // FIXED — correct backend structure

        setStats({
          totalUsers: d.totalUsers || 0,
          totalBrands: d.totalBrands || 0,
          totalProducts: d.totalProducts || 0,
          totalVotes: d.totalVotes || 0,
          pendingBrandRequests: d.pendingBrandRequests || 0,
          recentActivity: d.recentActivity || [],
        });
      }
    } catch (err) {
      console.error("Error loading admin stats:", err);
      setStats({
        totalUsers: 0,
        totalBrands: 0,
        totalProducts: 0,
        totalVotes: 0,
        pendingBrandRequests: 0,
        recentActivity: [],
      });
    } finally {
      setLoadingStats(false);
    }
  };

  fetchAdminStats();
}, []);



  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <Users size={16} className="text-blue-600" />;
      case "brand":
        return <Building2 size={16} className="text-purple-600" />;
      case "product":
        return <Package size={16} className="text-green-600" />;
      case "vote":
        return <Vote size={16} className="text-orange-600" />;
      default:
        return <Activity size={16} className="text-gray-600" />;
    }
  };

  const StatCard = ({ icon, label, value, bgColor, textColor }: any) => (
    <div className="bg-white border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${bgColor} rounded-lg`}>
          {icon}
        </div>
        <span className={`text-2xl font-bold ${textColor}`}>{value}</span>
      </div>
      <p className="text-gray-600 text-sm font-medium">{label}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white border border-gray-100">
        <div className="px-6 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              <div className="relative">
                <Image
                  className="relative h-32 w-32 object-cover rounded-full border-4 border-blue-100"
                  src={profile?.imageUrl || "/assets/images/user.png"}
                  width={128}
                  height={128}
                  alt="Admin Profile"
                />
                <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-2">
                  <Shield size={20} className="text-white" />
                </div>
              </div>
              <div className="mb-2">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 capitalize">
                    {profile?.firstName} {profile?.lastName}
                  </h1>
                  <span className="inline-flex items-center px-3 py-1  text-xs font-semibold bg-blue-100 text-white">
                    <Shield size={12} className="mr-1" />
                    Admin
                  </span>
                </div>
                <p className="text-gray-500 text-lg">{profile?.username || profile?.email}</p>
              </div>
            </div>

            {/* {canEdit && (
              <Link
                href={`/profile/${profile.userId}/edit`}
                className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white transition-colors duration-200 font-medium shadow-sm hover:bg-blue-600"
              >
                <UserRoundCog size={18} />
                <span>Edit Profile</span>
              </Link>
            )} */}
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
            {profile?.position && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="p-1.5 bg-purple-50 rounded">
                  <UserRoundCog size={16} className="text-purple-600" />
                </div>
                <span className="font-medium">{profile.position}</span>
              </div>
            )}

            {profile?.department && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="p-1.5 bg-green-50 rounded">
                  <Building2 size={16} className="text-green-600" />
                </div>
                <span className="font-medium">{profile.department}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <div className="p-1.5 bg-blue-50 rounded">
                <Mail size={16} className="text-blue-600" />
              </div>
              <span className="font-medium">{profile.email}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <div className="p-1.5 bg-orange-50 rounded">
                <CalendarDays size={16} className="text-orange-600" />
              </div>
              <span className="font-medium">
                Joined {formatDate(profile?.createdAt)}
              </span>
            </div>
          </div>

          {profile?.permissions && profile.permissions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.permissions.map((permission) => (
                <span
                  key={permission}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100 hover:border-blue-200 transition-colors"
                >
                  {permission}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-8 bg-white border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="inline-flex items-center gap-1 bg-gray-100 p-1 rounded-md">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                className={`inline-flex items-center gap-2 px-6 py-2.5 font-medium text-sm transition-all duration-200 rounded ${
                  selectedTab === tab.name
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setSelectedTab(tab.name)}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-8">
            {selectedTab === "Overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  icon={<Users size={24} className="text-blue-600" />}
                  label="Total Users"
                  value={stats?.totalUsers || 0}
                  bgColor="bg-blue-50"
                  textColor="text-blue-600"
                />
                <StatCard
                  icon={<Building2 size={24} className="text-purple-600" />}
                  label="Total Brands"
                  value={stats?.totalBrands || 0}
                  bgColor="bg-purple-50"
                  textColor="text-purple-600"
                />
                <StatCard
                  icon={<Package size={24} className="text-green-600" />}
                  label="Total Products"
                  value={stats?.totalProducts || 0}
                  bgColor="bg-green-50"
                  textColor="text-green-600"
                />
                <StatCard
                  icon={<Vote size={24} className="text-orange-600" />}
                  label="Total Votes"
                  value={stats?.totalVotes || 0}
                  bgColor="bg-orange-50"
                  textColor="text-orange-600"
                />
                <StatCard
                  icon={<Clock size={24} className="text-red-600" />}
                  label="Pending Brand Requests"
                  value={stats?.pendingBrandRequests || 0}
                  bgColor="bg-red-50"
                  textColor="text-red-600"
                />
                <StatCard
                  icon={<TrendingUp size={24} className="text-indigo-600" />}
                  label="Growth Rate"
                  value="+12%"
                  bgColor="bg-indigo-50"
                  textColor="text-indigo-600"
                />
              </div>
            )}

            {selectedTab === "Statistics" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Platform Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Users</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {stats?.totalUsers || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Brands</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {stats?.totalBrands || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Products</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats?.totalProducts || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Votes</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {stats?.totalVotes || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center py-12 text-gray-500">
                  <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Detailed analytics coming soon</p>
                  <p className="text-sm mt-2">
                    Charts and graphs will be available here
                  </p>
                </div>
              </div>
            )}

            {selectedTab === "Recent Activity" && (
              <div className="space-y-4">
                {loadingStats ? (
                  <p className="text-gray-500 text-center py-10">
                    Loading recent activity...
                  </p>
                ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="p-2 bg-white rounded-lg">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.details}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg font-medium">
                      No recent activity
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Activity will appear here as actions are performed
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

