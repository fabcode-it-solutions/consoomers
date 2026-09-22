import TesterPage from "@/components/sections/TesterPage";
import { userService } from "@/services/users.service";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "@/libs/auth/auth";

import BrandPage from "@/components/profile/BrandPage";
import AdminPage from "@/components/profile/AdminPage"; 

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } =  params;

  try {
    const userData = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/user?id=${id}`,
      { next: { revalidate: 3600 } }
    );

    const user = await userData.json();

    if (!user?.user) {
      return {
        title: "User Not Found",
        description: "This user profile could not be found.",
      };
    }

    return {
      title: `${user.user.username || user.user.firstName || "Guest"} - Profile`,
      description: `View ${
        user.user.username || user.user.firstName || "Guest"
      }'s profile and posts.`,
      openGraph: {
        title: `${user.user.username} - Profile`,
        description: `View ${user.user.username}'s profile and posts.`,
        images: user.user.image ? [user.user.image] : undefined,
      },
    };
  } catch {
    return {
      title: "Profile",
      description: "User profile page",
    };
  }
}

interface ProfilePageProps {
  params: { id: string };
}

const ProfilePage = async ({ params }: ProfilePageProps) => {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/accounts/sign-in");
  }

  const data = await userService.getUser(id, "id");

  if (data.status === 404 || !data.user) {
    return notFound();
  }

  const user = data.user;

  const isAdmin = session.user.role === "admin";
  const isSelf = session.user.id === id;
  if (user.role === "tester" && (isAdmin || isSelf)) {
    return <TesterPage user={user} />;
  }
  if (user.role === "brand" && (isAdmin || isSelf)) {
    return <BrandPage user={user} />;
  }
  if (user.role === "admin" && (isAdmin || isSelf)) {
    return <AdminPage user={user} />;
  }
  return notFound();
};

export default ProfilePage;
