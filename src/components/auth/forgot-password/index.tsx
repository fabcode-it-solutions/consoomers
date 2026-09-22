/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useApiRequest } from "@/hooks/useApiRequest";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ResetPassword from "./ResetPassword";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import Heading from "@/components/ui/Heading";

type ForgotPasswordResponse = {
  message?: string;
  error?: string;
};

const ForgotPasswordSchema = z.object({
  email: z.string().nonempty("Email is required").email("Invalid email"),
});
type FormData = z.infer<typeof ForgotPasswordSchema>;

type ForgotPasswordUser = {
  isToken?: boolean;
  resetPasswordExpires?: boolean;
  email?: string;
  authO?: string;
  id?: string; // <- UUID
};

const ForgotPassword = ({ user }: { user: ForgotPasswordUser | null }) => {
  const { request, loading } = useApiRequest<ForgotPasswordResponse>();
  const [resetEmail, setResetEmail] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null); // <-- Added state for API error

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: FormData) => {
    if (loading) return;
    setApiError(null); // clear previous errors

    try {
      const response = await request({
        url: "/api/auth/forgot-password",
        options: { method: "POST", body: data },
      });

      if (response?.error) {
        console.error(response.error);
        setApiError(response.error); // <-- set API error here
        return;
      }

      console.log(response?.message || "Password reset email sent successfully!");
     
      setValue("email", "");
    } catch (err: any) {
      console.error("Forgot Password Submit Error:", err);
      setApiError("We’re sorry — we couldn’t find an account linked to this email.​ Please make sure you’re using the same email address you signed up with, or create an account.​",
);
    }
  };

  useEffect(() => {
    if (user?.isToken) setResetEmail(true);
    if (user && !user?.resetPasswordExpires) {
      setResetEmail(false);
      toast.error("Password token expired, please try again.");
    }
  }, [user]);

  return (
    <div className="pt-[32px] flex flex-col justify-center items-center ">
      <div className="flex gap-[4px] flex-col">
        <Heading level={1}>
          {resetEmail ? "Reset Password" : "Forgot Password"}
        </Heading>
      </div>

      {resetEmail ? (
        <ResetPassword email={user?.email} authO={user?.authO} />
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-[50px] inline-flex flex-col gap-[20px] max-tab-lg:justify-center max-tab-lg:items-center"
        >
          <div className="flex flex-col gap-[8px] w-full">
            <InputField
              placeholder="JaneDoe@testmail.com"
              label="Email"
              {...register("email")}
              className="text-[#002029] min-w-[400px]"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}

            {apiError && (
              <p className="text-red-500 text-sm max-w-[400px] mt-[16px]">{apiError}</p>
            )}
          </div>

          <div className="flex justify-center items-center">
            <Button
              type={loading ? "button" : "submit"}
              className={`${
                loading
                  ? "cursor-not-allowed pointer-events-none opacity-55 text-white"
                  : ""
              } mt-[60px] max-tab-lg:mt-[40px] text-white `}
            >
              {loading ? "Sending..." : "Send to Email"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
