import ForgotPassword from "@/components/auth/forgot-password";
import { findUserByEmail } from "@/models/user.model";
import { Suspense } from "react";

type ForgotPasswordUser = {
  isToken?: boolean;
  resetPasswordExpires?: boolean;
  email?: string;
  authO?: string;
  id?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const rawAuthO = (await searchParams).authO;
  const authO = Array.isArray(rawAuthO) ? rawAuthO[0] : rawAuthO;

  const existing = authO
    ? await findUserByEmail({ passwordToken: authO as string })
    : null;

  const user: ForgotPasswordUser | null = authO
    ? {
        isToken: !!existing,
        resetPasswordExpires: existing?.resetPasswordExpires
          ? existing.resetPasswordExpires > new Date()
          : false,
        email: existing?.email,
        authO,
        id: existing?.id, 
      }
    : null;

  return (
    <Suspense>
      <ForgotPassword user={user} />
    </Suspense>
  );
}
