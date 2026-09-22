/* eslint-disable @typescript-eslint/no-explicit-any */
// components/profile/EditBrandProfile.tsx
"use client";

import React, { useEffect, useState } from "react";
import * as Form from "@radix-ui/react-form";
import InputField from "../ui/InputField";
import SelectField from "../ui/SelectField";
import CheckboxGroup from "../ui/CheckboxGroup";
import Button from "../ui/Button";
import Stepper from "../ui/Stepper";
import Heading from "../ui/Heading";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

// --- OPTIONS ---
const categories = [
  "Beauty & Personal Care",
  "Fitness & Wellness",
  "Food & Beverage",
  "Fashion & Accessories",
  "Home & Garden",
  "Tech & Electronics",
  "Kids & Baby Products",
  "Pet Products",
  "Other",
];

const yesNo = [
  "Yes",
  "Yes, Online + Wholesale",
  "Yes, Online only",
  "Not yet, but we are launching soon",
  "No",
];

const goalsList = [
  "Increase Brand Awareness",
  "Receive Targeted Brand & Product Feedback",
  "Drive Sales",
  "Improve Customer Engagement",
  "Refine Target Audience",
  "Receive Consumer Data & Insights",
  "All of the above",
];

// --- FORM SCHEMAS ---
const step1Schema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phoneNumber: z.string().min(5, "Phone number is required"),
});

const step2Schema = z.object({
  position: z.string().min(1, "Position is required"),
  brandName: z.string().min(1, "Brand name is required"),
  category: z.string().min(1, "Category is required"),
  website: z.string().url("Enter a valid URL"),
  sellingInUS: z.string().min(1, "This is a required question"),
  goals: z.array(z.string()).min(1, "Select at least one goal"),
});

const fullSchema = step1Schema.merge(step2Schema);
type FormData = z.infer<typeof fullSchema>;

// --- COMPONENT ---
interface BrandProfile {
  id: string;
  userId: string;
  name: string;
  brandName?: string;
  website?: string;
  industry?: string;
  position?: string;
  category?: string;
  sellingInUS?: string;
  goals?: string[];
  handle: string;
  brandId: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  coverImage?: { id?: string; url: string; alt?: string };
  phoneNumber?: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: string;
  brandProfile?: BrandProfile;
  phoneNumber?: string;
}

interface EditBrandProfileStepFormProps {
  user: User;
  brandProfile: BrandProfile;
}

const EditBrandProfileStepForm = ({ user, brandProfile }: EditBrandProfileStepFormProps) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      position: "",
      brandName: "",
      category: "",
      website: "",
      sellingInUS: "",
      goals: [],
    },
  });

  const watchedGoals = watch("goals", []);
  useEffect(() => {
    if (!brandProfile) return;

    const normalizeArray = (val: any) =>
      Array.isArray(val)
        ? val
        : typeof val === "string"
        ? val.split(",").map((g: string) => g.trim()).filter(Boolean)
        : [];

    const normalizeSelect = (val: any, options: string[]) => {
      if (!val) return "";
      const match = options.find((o) => o.toLowerCase() === String(val).toLowerCase());
      return match || "";
    };

    reset({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      phoneNumber: brandProfile.phoneNumber ?? user.phoneNumber ?? "",
      position: brandProfile.position ?? "",
      brandName: brandProfile.brandName ?? brandProfile.name ?? "",
      category: normalizeSelect(brandProfile.category ?? "", categories),
      website: brandProfile.website ?? "",
      sellingInUS: normalizeSelect(brandProfile.sellingInUS ?? "", yesNo),
      goals: normalizeArray(brandProfile.goals ?? []),
    });
  }, [brandProfile, reset, user]);

  const handleNext = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const ok = await trigger(["firstName", "lastName", "email", "phoneNumber"]);
    if (ok) setStep(2);
    else toast.error("Please fix errors in the first step.");
  };

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setStep(1);
  };

  // Submit
  const onSubmit = async (data: FormData) => {
    const ok = await trigger(["position","brandName","category","website","sellingInUS","goals"]);
    if (!ok) {
      toast.error("Please complete required fields in step 2.");
      return;
    }
    try {
      setLoading(true);
          const csrfRes = await fetch("/api/csrf-token", {
      method: "GET",
      credentials: "include",
    });
    const { csrfToken } = await csrfRes.json();
    console.log(csrfToken , "csrfToken")
      const res = await fetch("/api/auth/register/brand", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json" ,
           "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ ...data, userId: user.id, brandId: brandProfile.id }),
      });
      const result = await res.json().catch(() => null);

      if (!res.ok) throw new Error(result?.error || "Update failed");
      toast.success(result?.message || "Profile updated successfully");
      router.push(`/profile/${user.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-center items-center md:min-h-[calc(100vh-180px)] relative overflow-hidden">
      <div className="w-full max-w-[720px] mx-auto mt-[50px] max-tab-lg:px-4">
        <Heading level={1} className="text-[32px] font-semibold mb-[4px] text-center">
          Edit Brand Profile - CONSOOMERS
        </Heading>
        <p className="text-base font-medium text-[#15151580] text-center">
          Update your brand details below
        </p>

        <Stepper currentStep={step} steps={[{ label: "You" }, { label: "Your Brand" }]} />
        <Form.Root className="p-[40px] border border-gray-200 mt-6 bg-white" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-[40px]">
            {step === 1 && (
              <>
                <InputField label="First Name" required {...register("firstName")} placeholder="Enter your first name" errorMessage={errors.firstName?.message} />
                <InputField label="Last Name" required {...register("lastName")} placeholder="Enter your last name" errorMessage={errors.lastName?.message} />
                <InputField label="Email" {...register("email")} placeholder="Email" disabled errorMessage={errors.email?.message} className="cursor-not-allowed"/>
                <InputField label="Phone Number" required {...register("phoneNumber")} placeholder="Enter your phone number" errorMessage={errors.phoneNumber?.message} />
              </>
            )}

            {step === 2 && (
              <>
                <InputField label="Position" required {...register("position")} placeholder="Enter your position" errorMessage={errors.position?.message} />
                <InputField label="Brand Name" required {...register("brandName")} placeholder="Enter your brand name" errorMessage={errors.brandName?.message} />
                <SelectField name="category" options={categories} value={getValues("category")} onChange={(val) => setValue("category", val as string, { shouldValidate: true })} label="Your Category" placeholder="Select an option" error={errors.category?.message} required />
                <InputField label="Website URL" {...register("website")} placeholder="Enter your website URL" required errorMessage={errors.website?.message} />
                <div className="col-span-2">
                  <SelectField name="sellingInUS" options={yesNo} value={getValues("sellingInUS")} onChange={(val) => setValue("sellingInUS", val as string, { shouldValidate: true })} placeholder="Select an option" label="Is your brand already selling in the US?" error={errors.sellingInUS?.message} required />
                </div>
                <div className="col-span-2">
                  <CheckboxGroup name="goals" options={goalsList} value={watchedGoals || []} onChange={(val) => setValue("goals", val, { shouldValidate: true })} label="What are your main goals for working with us?" error={errors.goals?.message} required />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between mt-10">
            {step === 2 && <Button type="button" onClick={handleBack} className="text-white bg-gray-600">Back</Button>}
            {step === 1 ? (
              <Button type="button" onClick={handleNext} className="text-white bg-blue-600">Next</Button>
            ) : (
              <Button type="submit" className="text-[#000] !bg-[#ffd400]">{loading ? "Submitting..." : "Save Changes"}</Button>
            )}
          </div>
        </Form.Root>
      </div>
    </div>
  );
};

export default EditBrandProfileStepForm;
