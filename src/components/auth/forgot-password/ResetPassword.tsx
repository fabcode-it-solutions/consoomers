/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import { useApiRequest } from "@/hooks/useApiRequest";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export const ForgotPasswordSchema = z
  .object({
    password: z
      .string()
      .nonempty("Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    confirmPassword: z
      .string()
      .nonempty("Confirm password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message:
      "Your confirm password does not match your password. Please check your confirm passowrd .",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof ForgotPasswordSchema>;
type ApiResult = {
  status?: number;
  [key: string]: unknown;
};

const ResetPassword = ({
  email,
  authO,
}: {
  email?: string;
  authO?: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { request, loading, result } = useApiRequest<ApiResult>();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      confirmPassword: "",
      password: "",
    },
  });
  console.log(showConfirmPassword, "showConfirmPassword");
  const onSubmit = async (data: FormData) => {
    if (loading) {
      return null;
    }
    await request({
      url: "/api/auth/reset-password",
      options: {
        method: "POST",
        body: {
          email,
          auth: authO,
          ...data,
        },
      },
    });
  };
  useEffect(() => {
    if (result && result?.status === 200) {
      router.push("/accounts/sign-in");
    }
  }, [result]);
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-[50px] inline-flex flex-col gap-[20px] max-tab-lg:justify-center max-tab-lg:items-center"
    >
      <div className="flex flex-col gap-10  w-full">
        
        <InputField
          type={showPassword ? "text" : "password"}
          label="Password"
          placeholder="********"
          {...register("password")}
          className="flex-1 text-[#002029] min-w-[400px]"
          rightIcon={
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="cursor-pointer"
            >
              <EyeIcon className="w-[20px] h-[20px]"/>
            </div>
          }
        />
        {errors.password && (
          <p className="text-red-500 text-base capitalize">
            {errors.password.message}
          </p>
        )}
       
        <InputField
          type={showConfirmPassword ? "text" : "password"}
          placeholder="********"
          {...register("confirmPassword")}
          label="  Confirm Password"
          className="flex-1 text-[#002029] min-w-[400px]"
          rightIcon={
            <div
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="cursor-pointer"
            >
              <EyeIcon className="w-[20px] h-[20px]"/>
            </div>
          }
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-base  max-w-[400px]">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      <div className="flex justify-center items-center text-white">
        <Button
          type={loading ? "button" : "submit"}
          className={`${
            loading ? "cursor-not-allowed pointer-events-none opacity-55" : ""
          } mt-[60px] max-tab-lg:mt-[40px] `}
        >
          {loading ? "Reseting..." : "Reset"}
        </Button>
      </div>
    </form>
  );
};

export default ResetPassword;
