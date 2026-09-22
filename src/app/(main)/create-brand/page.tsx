// app/brands/create/page.tsx
import NotFound from "@/app/not-found";
import CreateBrandForm from "@/components/auth/register/brand/CreateBrand";
import { authOptions } from "@/libs/auth/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

export default async function CreateBrandPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/accounts/sign-in");
  }

  const userId = session?.user?.id ?? "";
  const userRole = session?.user?.role ?? "";

  if (userRole !== "brand" && userRole !== "admin") {
   notFound();
  }

  return <CreateBrandForm userId={userId} />;
}
