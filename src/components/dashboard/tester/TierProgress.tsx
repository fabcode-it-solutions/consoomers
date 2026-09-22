/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  Heart,
  ThumbsUp,
  Package,
  Mail,
  Target,
  Filter,
  Activity,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

import { ActivityType } from "@/db/schema/users";
import { calculateTotalScore, fetchActivities } from "@/lib/activity-logger";

interface Activity {
  id: string;
  testerId: string;
  activityType: ActivityType;
  productId?: string | null;
  details: Record<string, any>;
  createdAt: Date | string;
}

interface ActivityHistoryProps {
  testerId: string;
}


const activityConfig: Record<
  ActivityType,
  {
    icon: any;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    iconBg: string;
  }
> = {
  like: {
    icon: Heart,
    label: "Liked a Product",
    color: "text-red-400",
    bgColor: "bg-red-500/5",
    borderColor: "border-red-500/20",
    iconBg: "bg-red-500/10",
  },
  vote: {
    icon: ThumbsUp,
    label: "Voted on Product",
    color: "text-blue-400",
    bgColor: "bg-blue-500/5",
    borderColor: "border-blue-500/20",
    iconBg: "bg-blue-500/10",
  },
  request_sample: {
    icon: Package,
    label: "Requested a Sample",
    color: "text-green-400",
    bgColor: "bg-green-500/5",
    borderColor: "border-green-500/20",
    iconBg: "bg-green-500/10",
  },
  focus_group_invite: {
    icon: Mail,
    label: "Invited to Focus Group",
    color: "text-purple-400",
    bgColor: "bg-purple-500/5",
    borderColor: "border-purple-500/20",
    iconBg: "bg-purple-500/10",
  },
  focus_group_selected: {
    icon: Target,
    label: "Selected for Focus Group",
    color: "text-orange-400",
    bgColor: "bg-orange-500/5",
    borderColor: "border-orange-500/20",
    iconBg: "bg-orange-500/10",
  },

};


const ActivityHistory: React.FC<ActivityHistoryProps> = ({ testerId }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ActivityType | "all">("all");

  useEffect(() => {
    loadActivities();
  }, [testerId, filter]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await fetchActivities({
        testerId,
        activityType: filter === "all" ? undefined : filter,
        limit: 50,
      });
      setActivities(data.activities || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalScore = calculateTotalScore(activities);

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  /* ----------------------------------------------------
     LOADING SKELETON
  ----------------------------------------------------- */
  if (loading) {
    return (
      <div className="p-6 bg-dark-100 border border-[#334155] rounded-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-5/10 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-5/5 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------
     RENDER
  ----------------------------------------------------- */

  return (
    <div className="space-y-6">

      {/* ----------------------------------------------------
          FILTER PANEL
      ----------------------------------------------------- */}
      <div className="bg-dark-100 border border-[#334155] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-[#94a3b8]" />
          <h3 className="font-audiowide text-[#f1f5f9] text-lg">Filter Activities</h3>
        </div>

        <div className="flex flex-wrap gap-2">

          {/* ALL BUTTON */}
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-sofia-sans text-sm transition-all ${
              filter === "all"
                ? "bg-accent-100/10 text-[#54DC00] border border-accent-100/30"
                : "bg-gray-5/5 text-[#94a3b8] hover:bg-gray-5/10 border border-[#334155]"
            }`}
          >
            All Activities
          </button>

          {/* INDIVIDUAL FILTERS */}
          {Object.keys(activityConfig).map((type) => {
            const config = activityConfig[type as ActivityType];
            const Icon = config.icon;

            return (
              <button
                key={type}
                onClick={() => setFilter(type as ActivityType)}
                className={`px-4 py-2 rounded-lg font-sofia-sans text-sm transition-all flex items-center gap-2 ${
                  filter === type
                    ? "bg-accent-100/10 text-[#54DC00] border border-accent-100/30"
                    : "bg-gray-5/5 text-[#94a3b8] hover:bg-gray-5/10 border border-[#334155]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

 
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">

        {/* TOTAL SCORE */}
        <div className="bg-dark-100 border border-[#334155] rounded-lg p-4 text-center hover:border-gray-5/40 transition-colors">
          <div className="w-10 h-10 bg-accent-100/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-5 h-5 text-[#54DC00]" />
          </div>
          <div className="text-2xl font-audiowide font-bold text-[#54DC00]">
            {totalScore}
          </div>
          <div className="text-xs text-[#94a3b8] font-sofia-sans mt-1">
            Total Score
          </div>
        </div>

        {/* TOTAL ACTIVITIES */}
        <div className="bg-dark-100 border border-[#334155] rounded-lg p-4 text-center hover:border-gray-5/40 transition-colors">
          <div className="w-10 h-10 bg-blue-400/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-audiowide font-bold text-blue-400">
            {activities.length}
          </div>
          <div className="text-xs text-[#94a3b8] font-sofia-sans mt-1">
            Activities
          </div>
        </div>

        {/* INDIVIDUAL TYPE STATS */}
        {Object.keys(activityConfig).map((type) => {
          const config = activityConfig[type as ActivityType];
          const Icon = config.icon;

          return (
            <div
              key={type}
              className="bg-dark-100 border border-[#334155] rounded-lg p-4 text-center hover:border-gray-5/40 transition-colors"
            >
              <div className={`w-10 h-10 ${config.iconBg} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>

              <div className={`text-2xl font-audiowide font-bold ${config.color}`}>
                {stats[type] || 0}
              </div>

              <div className="text-xs text-[#94a3b8] font-sofia-sans mt-1 truncate">
                {config.label}
              </div>
            </div>
          );
        })}

      </div>

      {/* ----------------------------------------------------
          TIMELINE
      ----------------------------------------------------- */}
      <div className="bg-dark-100 border border-[#334155] rounded-lg overflow-hidden">

        <div className="p-6 border-b border-[#334155]">
          <h3 className="text-xl font-audiowide text-[#f1f5f9] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#54DC00]" />
            Activity Timeline
          </h3>
        </div>

        <div className="p-6">

          {/* EMPTY STATE */}
          {activities.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-5/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-10 h-10 text-[#94a3b8]" />
              </div>
              <p className="text-lg font-sofia-sans text-[#f1f5f9]">
                No activities yet
              </p>
              <p className="text-sm text-[#94a3b8] font-sofia-sans">
                Your activity will appear here as you engage.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const config = activityConfig[activity.activityType];
                const Icon = config.icon;

                return (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${config.borderColor} ${config.bgColor} hover:bg-gray-5/5 transition-all group`}
                  >
                    {/* ICON */}
                    <div
                      className={`p-3 rounded-lg ${config.iconBg} group-hover:scale-110 transition-transform flex-shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>

                    {/* DETAILS */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className={`font-audiowide font-semibold ${config.color} text-sm`}>
                          {config.label}
                        </h4>

                        <span className="text-xs text-[#94a3b8] font-sofia-sans whitespace-nowrap">
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>

                      {/* DETAILS OBJECT */}
                      {activity.details && Object.keys(activity.details).length > 0 && (
                        <div className="space-y-1">
                          {Object.entries(activity.details).map(([k, v]) => (
                            <div key={k} className="text-sm text-[#f1f5f9] font-sofia-sans">
                              <span className="text-[#94a3b8]">
                                {k.replace(/([A-Z])/g, " $1").trim()}:
                              </span>{" "}
                              <span className="font-medium">
                                {typeof v === "object" ? JSON.stringify(v) : String(v)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ActivityHistory;
