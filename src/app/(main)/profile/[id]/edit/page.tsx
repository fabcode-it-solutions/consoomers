import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth/auth";
import { redirect, notFound } from "next/navigation";
import EditBrandPage from "@/components/profile/EditProfileCard";
import EditTesterProfile from "@/components/editProfile/EditTesterProfile";

interface EditProfilePageProps {
  params: { id: string };
}

const EditProfilePage = async ({ params }: EditProfilePageProps) => {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/accounts/sign-in");
  }
try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/user?id=${id}`, { cache: 'no-store' });
  if (!response.ok) {
    return notFound();
  }
  const data = await response.json();
  if (!data?.user) {
    return notFound();
  }
  const user = data.user;
  const isAdmin = session.user.role === "admin";
  const isSelf = String(session.user.id) === String(user.id);
  const userRole = user.role?.toLowerCase();
  if ((userRole === "tester" || userRole === "brand") && (isAdmin || isSelf)) {
    return userRole === "tester"
      ? <EditTesterProfile user={user} />
      : <EditBrandPage user={user} />;
  }

  console.log(" Access denied or invalid role", { userRole, isAdmin, isSelf });
  return notFound();

} catch (error) {
  console.error("Error fetching user:", error);
  return notFound();
}

};

export default EditProfilePage;