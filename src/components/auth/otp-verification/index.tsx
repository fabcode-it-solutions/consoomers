"use client";

import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import OtpField from "@/components/ui/OtpField";
import { signIn, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Verification: React.FC = () => {
  const { data: session } = useSession();
  const [counter, setCounter] = useState<number>(0);
  const [sending, setSending] = useState<boolean>(false);
  const [sendOtp, setSendOtp] = useState<boolean>(false);
  const [userOtp, setUserOtp] = useState<string>("");

  useEffect(() => {
    if (counter <= 0) return;
    const timer = setInterval(() => setCounter((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);

  const handleResend = async () => {
    if (counter > 0 || !session?.user?.email) return;

    setSending(true);

    const res = await signIn("email-otp", {
      email: session.user.email,
      action: "send",
      redirect: false,
    });

    if (!res?.error) {
      toast.success("OTP sent successfully! please check your email");
      setCounter(32);
      setSendOtp(true);
    } else {
      toast.error(res.error);
    }

    setSending(false);
  };

  const handleSubmit = async (otpValue: string) => {
    if (!session?.user?.email) return;

    if (session.user.otpExpires && session.user.otpExpires < Date.now()) {
      toast.error("OTP expired. Please resend");
      return;
    }

    await signIn("email-otp", {
      email: session.user.email,
      action: "verify",
      otp: otpValue,
      otpToken: session.user.otp,
      redirect: true,
      callbackUrl: "/accounts/sign-in",
    });
  };

  return (
    <div className="flex justify-center items-center md:min-h-[calc(100vh-180px)] relative md:mt-0 mt-12">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (userOtp.length === 6) handleSubmit(userOtp);
        }}
        className="flex flex-col items-center"
      >
        {/* <h1 className="text-2xl font-bold text-center">SMS Code Verification</h1> */}
        <Heading level={2}>SMS Code Verification</Heading>
        <p className="text-base font-normal mt-4">
          Click send button and check your email account
        </p>

        {!sendOtp ? (
          <div className="mt-6 flex flex-col gap-4 max-w-sm w-full">
            <div className="flex justify-center items-center">
              <Button
                className="flex justify-center items-center text-white"
                onClick={handleResend}
              >
                Send Code
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 max-w-sm w-full">
            <OtpField handleSubmit={handleSubmit} setValue={setUserOtp} />

            <div className="text-center text-gray-500 mt-4">
              {counter > 0 ? (
                <p>
                  Didn&apos;t receive a code?{" "}
                  <b className="cursor-pointer">
                    Resend in 0:{counter < 10 ? `0${counter}` : counter}
                  </b>
                </p>
              ) : (
                <button
                  type="button"
                  disabled={sending}
                  onClick={handleResend}
                  className="font-semibold cursor-pointer text-white"
                >
                  {sending ? "Sending..." : "Resend Code"}
                </button>
              )}
            </div>

            <div className="flex w-full justify-center mt-6">
              <Button className="text-white" type="submit">
                Submit
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Verification;
