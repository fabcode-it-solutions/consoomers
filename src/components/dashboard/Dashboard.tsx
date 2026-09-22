"use client";
import React, { useState } from "react";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Download,
  RefreshCw,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  Target,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

// Mock data for charts
const salesData = [
  { month: "Jan", sales: 4000, orders: 240, revenue: 12000 },
  { month: "Feb", sales: 3000, orders: 198, revenue: 9800 },
  { month: "Mar", sales: 5000, orders: 320, revenue: 16000 },
  { month: "Apr", sales: 4500, orders: 280, revenue: 14200 },
  { month: "May", sales: 6000, orders: 390, revenue: 19500 },
  { month: "Jun", sales: 7200, orders: 450, revenue: 23400 },
];

const categoryData = [
  { name: "Wheels", value: 35, color: "#54DC00" },
  { name: "Engine Parts", value: 25, color: "#3B82F6" },
  { name: "Electronics", value: 20, color: "#8B5CF6" },
  { name: "Interior", value: 12, color: "#F59E0B" },
  { name: "Others", value: 8, color: "#6B7280" },
];

const recentActivity = [
  {
    id: 1,
    type: "sale",
    message: "New order #ORD-2024-001",
    amount: "$450",
    time: "2 min ago",
    status: "success",
  },
  {
    id: 2,
    type: "user",
    message: "New user registration",
    amount: "",
    time: "5 min ago",
    status: "info",
  },
  {
    id: 3,
    type: "alert",
    message: "Low stock alert: Brake Pads",
    amount: "",
    time: "10 min ago",
    status: "warning",
  },
  {
    id: 4,
    type: "sale",
    message: "Order completed #ORD-2024-002",
    amount: "$1,200",
    time: "15 min ago",
    status: "success",
  },
  {
    id: 5,
    type: "return",
    message: "Return request initiated",
    amount: "-$320",
    time: "20 min ago",
    status: "error",
  },
];

const DashboardPage: React.FC = () => {
  const [dateRange, setDateRange] = useState("7d");
  const [loading, setLoading] = useState(false);
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-[#94a3b8]",
      bgColor: "bg-accent-100/10",
    },
    {
      title: "Total Orders",
      value: "1,429",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      title: "Active Users",
      value: "2,845",
      change: "+3.1%",
      trend: "up",
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      title: "Products Listed",
      value: "892",
      change: "-2.4%",
      trend: "down",
      icon: Package,
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
    },
  ];

  const quickActions = [
    {
      title: "Add Product",
      icon: Package,
      color: "bg-accent-100",
      href: "/dashboard/products/create",
    },
    {
      title: "View Orders",
      icon: ShoppingCart,
      color: "bg-blue-500",
      href: "/dashboard/orders",
    },
    {
      title: "User Management",
      icon: Users,
      color: "bg-purple-500",
      href: "/dashboard/users",
    },
    {
      title: "Analytics",
      icon: TrendingUp,
      color: "bg-orange-500",
      href: "/dashboard/analytics",
    },
  ];

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-100/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#94a3b8]" />
          </div>
          <div>
            <h1 className="text-2xl font-audiowide text-[#f1f5f9]">
              Dashboard Analytics
            </h1>
            <div className="flex items-center gap-6 text-sm text-[#94a3b8] font-sofia-sans mt-1">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Live data
              </span>
              <span>Last updated: 2 minutes ago</span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-dark-100 border border-[#334155] rounded-lg text-[#f1f5f9] font-sofia-sans text-sm focus:outline-none focus:border-accent-100/50"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          <button
            onClick={handleRefresh}
            className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-gray-5/10 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-accent-100/10 text-[#94a3b8] rounded-lg hover:bg-accent-100/20 transition-colors font-sofia-sans text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-dark-100 border border-[#334155] rounded-lg p-6 hover:border-gray-5/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger className="p-1 text-[#94a3b8] hover:text-[#f1f5f9] rounded transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="bg-dark-100 border border-[#334155] rounded-lg p-1 shadow-lg">
                    <DropdownMenu.Item className="px-3 py-2 text-sm text-[#f1f5f9] hover:bg-gray-5/10 rounded cursor-pointer">
                      View Details
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="px-3 py-2 text-sm text-[#f1f5f9] hover:bg-gray-5/10 rounded cursor-pointer">
                      Export Data
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>

            <div>
              <p className="text-[#94a3b8] text-sm font-sofia-sans">
                {stat.title}
              </p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-bold text-[#f1f5f9] font-supreme">
                  {stat.value}
                </p>
                <div
                  className={`flex items-center gap-1 text-sm font-sofia-sans ${
                    stat.trend === "up" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-dark-100 border border-[#334155] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-audiowide text-[#f1f5f9]">
                Sales Trend
              </h3>
              <p className="text-[#94a3b8] text-sm font-sofia-sans">
                Monthly sales performance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm font-sofia-sans">
                <div className="w-3 h-3 bg-accent-100 rounded-full"></div>
                <span className="text-[#94a3b8]">Sales</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-sofia-sans">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-[#94a3b8]">Orders</span>
              </div>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#54DC00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#54DC00" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="ordersGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F3F4F6",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#54DC00"
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#ordersGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-dark-100 border border-[#334155] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-audiowide text-[#f1f5f9]">
                Category Distribution
              </h3>
              <p className="text-[#94a3b8] text-sm font-sofia-sans">
                Sales by product category
              </p>
            </div>
          </div>

          <div className="h-80 flex items-center">
            <div className="w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F3F4F6",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-1/2 space-y-3">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-[#94a3b8] text-sm font-sofia-sans">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-[#f1f5f9] text-sm font-supreme">
                    {category.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-dark-100 border border-[#334155] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-audiowide text-[#f1f5f9]">
                Recent Activity
              </h3>
              <p className="text-[#94a3b8] text-sm font-sofia-sans">
                Latest platform activities
              </p>
            </div>
            <button className="text-[#94a3b8] text-sm font-sofia-sans hover:text-[#94a3b8]/80">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 hover:bg-gray-5/5 rounded-lg transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.status === "success"
                      ? "bg-green-500/20"
                      : activity.status === "warning"
                      ? "bg-yellow-500/20"
                      : activity.status === "error"
                      ? "bg-red-500/20"
                      : "bg-blue-500/20"
                  }`}
                >
                  {activity.status === "success" && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                  {activity.status === "warning" && (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  )}
                  {activity.status === "error" && (
                    <Target className="w-4 h-4 text-red-400" />
                  )}
                  {activity.status === "info" && (
                    <Users className="w-4 h-4 text-blue-400" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-[#f1f5f9] text-sm font-sofia-sans">
                    {activity.message}
                  </p>
                  <p className="text-[#94a3b8] text-xs">{activity.time}</p>
                </div>

                {activity.amount && (
                  <span
                    className={`text-sm font-supreme ${
                      activity.amount.startsWith("-")
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {activity.amount}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-dark-100 border border-[#334155] rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-audiowide text-[#f1f5f9]">
              Quick Actions
            </h3>
            <p className="text-[#94a3b8] text-sm font-sofia-sans">Common tasks</p>
          </div>

          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-5/5 rounded-lg transition-colors group"
              >
                <div
                  className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-[#f1f5f9] font-sofia-sans">
                  {action.title}
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#94a3b8] ml-auto group-hover:text-[#94a3b8] transition-colors" />
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-[#334155]">
            <div className="text-center">
              <p className="text-[#94a3b8] text-sm font-sofia-sans mb-2">
                System Status
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-sofia-sans">
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;