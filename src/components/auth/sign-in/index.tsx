"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Anchor from "@/components/ui/Anchor";
import { useRouter } from "next/navigation";
import ReactivateAccountModal from "@/components/global/media/ReactivateAccountModal";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [emailForReactivation, setEmailForReactivation] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      const res = await signIn("email-password", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      // If backend says account is deactivated
      if (res?.error === "ACCOUNT_DEACTIVATED") {
        setEmailForReactivation(data.email);
        setShowReactivateModal(true);
        return;
      }

      if (res?.error) {
        toast.error(res.error);
        return;
      } else {
        toast.success("Login successful!");

        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center md:min-h-[calc(100vh-180px)] relative overflow-hidden">
      <div>
        <div className="w-full rounded-2xl bg-white">
          <Heading
            level={2}
            className="text-[32px] font-semibold font-workSans mb-[4px] text-center text-[#151515] mt-3"
          >
            To start browsing our brands as a tester,
            <span className="hidden sm:inline">
              <br />
            </span>{" "}
            log in or create an account
          </Heading>
          {/* <p className="text-base font-medium text-[#15151580] text-center">
            Brands Intake Form - CONSOOMERS
          </p> */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-[30px] flex flex-col gap-[30px] p-8 border border-gray-200 rounded-none"
          >
            <div>
              <InputField
                type="email"
                {...register("email")}
                placeholder="Enter your email"
                className="min-w-[400px]"
                label="Email"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="relative">
              <InputField
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Enter your password"
                label="Password"
                required
                rightIcon={
                  showPassword ? (
                    <EyeOff className="w-[20px] h-[20px]" />
                  ) : (
                    <Eye className="w-[20px] h-[20px]" />
                  )
                }
                onRightIconClick={() => setShowPassword(!showPassword)}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Link
              href="/accounts/forgot-password"
              className="text-sm font-bold text-[#002029] text-right"
            >
              Forgot Password?
            </Link>

            <div
            //  className="flex justify-around gap-6"
            >
              <Button type="submit" className="mt-[0px] w-full text-white">
                {loading ? "Logging in..." : "Login"}
              </Button>
              {/* <Anchor href="/accounts/register/tester">
                CREATE YOUR ACCOUNT
              </Anchor> */}
            </div>

            <div className="justify-center items-center text-center mx-auto">
              <p className="text-gray-600">
                Don&apos;t have an account yet? Create one today!
              </p>
              <div className="flex justify-center gap-6 mt-5">
                <Button
                  type="button"
                  onClick={() => router.push("/accounts/register/tester")}
                  className="text-white"
                >
                  JOIN AS A TESTER
                </Button>
              </div>
            </div>
          </form>

          {/* <p className="text-center text-sm text-gray-600 mt-4">
            Don&#39;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 hover:underline"
            >
              Register
            </Link>
          </p> */}

          <p className="text-center text-xl text-black font-bold mt-4">
            If you&apos;re brand
          </p>

          <div className="flex justify-center gap-6 mt-5">
            <Button
              type="button"
              onClick={() => router.push("/accounts/register/brand")}
              className="text-[#000] !bg-[#ffd400]"
            >
              JOIN AS A BRAND
            </Button>
          </div>
        </div>
      </div>
      {showReactivateModal && (
        <ReactivateAccountModal
          open={showReactivateModal}
          email={emailForReactivation}
          onClose={() => setShowReactivateModal(false)}
        />
      )}
    </div>
  );
}
