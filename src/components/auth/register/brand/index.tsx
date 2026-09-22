/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import * as Form from "@radix-ui/react-form";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import Stepper from "@/components/ui/Stepper";
import CheckboxGroup from "@/components/ui/CheckboxGroup";
import { useCategories } from "@/hooks/useCategories";

const yesNo = [
  "Yes",
  "Yes, Online + Wholesale",
  "Yes, Online only",
  "Not yet, but we are launching soon",
  "No",
];

const goals = [
  "Increase Brand Awareness",
  "Receive Targeted Brand & Product Feedback",
  "Drive Sales",
  "Improve Customer Engagement",
  "Refine Target Audience",
  "Receive Consumer Data & Insights",
  "All of the above",
];

const step1Schema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().min(5, "Phone number is required"),
});

const step2Schema = z.object({
  position: z.string().min(1, "Position is required"),
  brand: z.string().min(1, "Brand name is required"),
  category: z.string().min(1, "Category is required"),
  website: z.string().url("Enter a valid URL"),
  sellingInUS: z.string().min(1, "This is a required question"),
  goals: z.array(z.string()).min(1, "Select at least one goal"),
});

const fullSchema = step1Schema.merge(step2Schema);
type FormData = z.infer<typeof fullSchema>;

const SignUpAsBrand = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [isFinalSubmit, setIsFinalSubmit] = useState(false);
  const [emptyFields, setEmptyFields] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();

  // NEW: Fetch categories dynamically
  const { categories: dynamicCategories, loading: categoriesLoading } = useCategories();

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    formState: { errors, touchedFields },
  } = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
      position: "",
      brand: "",
      category: "",
      website: "",
      sellingInUS: "",
      goals: [],
    },
  });

  const nextStep = async () => {
    setFormError("");
    const step1Fields: (keyof FormData)[] = [
      "firstName",
      "lastName",
      "email",
      "password",
      "phoneNumber",
    ];
    const isValid = await trigger(step1Fields);
    if (isValid) {
      setStep(2);
    } else {
      step1Fields.forEach((field) => {
        setValue(field, getValues(field), {
          shouldValidate: true,
          shouldTouch: true,
        });
      });
    }
  };

  const prevStep = () => {
    setFormError("");
    setStep(1);
  };

  const onSubmit = async (data: FormData) => {
    setFormError("");
    setEmptyFields([]);

    const step2Fields: (keyof FormData)[] = [
      "position",
      "brand",
      "category",
      "website",
      "sellingInUS",
      "goals",
    ];

    const valid = await trigger(step2Fields, { shouldFocus: true });
    setIsFinalSubmit(true);
    if (!valid) {
      step2Fields.forEach((field) =>
        setValue(field, getValues(field), {
          shouldValidate: true,
          shouldTouch: true,
        })
      );

      const missing = step2Fields
        .filter((field) => !getValues(field))
        .map((field) => {
          const stepTwo = {
            position: "Position",
            brand: "Brand name",
            category: "Category",
            website: "Website URL",
            sellingInUS: "Selling in US",
            goals: "Goals",
            firstName: "First Name",
            lastName: "Last Name",
            email: "Email",
            password: "Password",
            phoneNumber: "Phone Number",
          }[field];
          return `${stepTwo} is required`;
        });

      setEmptyFields(missing);
      setFormError(
        "Please complete all fields before submitting your request."
      );
      return;
    }

    try {
      setLoading(true);
    
      const res = await fetch("/api/auth/register/brand", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
         
         },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(result.error || "Failed to register");

      await signIn("email-password", {
        email: watch("email"),
        password: watch("password"),
        redirect: false,
      });

      setShowSuccessMessage(true);
      setTimeout(() => {
        router.push("/create-brand");
      }, 3500);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
      setLoading(false);
    }
  };

  const showError = (field: keyof FormData) =>
    touchedFields[field] && errors[field]?.message
      ? errors[field]?.message
      : "";

  return (
    <div className="flex justify-center items-center md:min-h-[calc(100vh-180px)] relative overflow-hidden">
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-60">
          <div className="bg-white p-8 rounded-md text-center max-w-md mx-4 shadow-lg">
            <Heading className="text-green-600">Great!</Heading>
            <p className="text-lg text-black mt-2">
              We&rsquo;ll be in touch after we review your information.
            </p>
          </div>
        </div>
      )}
      <div className="w-full max-w-[720px] mx-auto mt-[50px] max-tab-sm:px-4">
        <Heading
          level={1}
          className="text-[32px] font-semibold mb-[4px] text-center text-[#151515]"
        >
          Brands Intake Form - CONSOOMERS
        </Heading>
        <p className="text-base font-medium text-[#15151580] text-center">
          Please fill in the details below
        </p>

        <Stepper
          currentStep={step}
          steps={[{ label: "You" }, { label: "Your brand​" }]}
        />
        <Form.Root
          className="p-[40px] border border-gray-200 mt-6 bg-white max-tab-sm:p-6"
          onSubmit={handleSubmit(onSubmit, () => {
            if (isFinalSubmit) {
              setFormError(
                "Please complete all fields before submitting your request."
              );
            }
          })}
        >
          <div className="grid grid-cols-2 gap-[40px] max-sm:grid-cols-1 max-sm:gap-5">
            {step === 1 && (
              <>
                <InputField
                  label="First Name"
                  required
                  {...register("firstName")}
                  placeholder="Enter Your First Name"
                  errorMessage={showError("firstName")}
                />
                <InputField
                  label="Last Name"
                  required
                  {...register("lastName")}
                  placeholder="Enter Your Last Name"
                  errorMessage={showError("lastName")}
                />
                <InputField
                  label="Email"
                  required
                  {...register("email")}
                  placeholder="Enter Your Email"
                  errorMessage={showError("email")}
                />
                <InputField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  required
                  {...register("password")}
                  rightIcon={
                    showPassword ? (
                      <EyeOff className="w-[20px] h-[20px]" />
                    ) : (
                      <Eye className="w-[20px] h-[20px]" />
                    )
                  }
                  onRightIconClick={() => setShowPassword(!showPassword)}
                  errorMessage={showError("password")}
                />
                <InputField
                  label="Phone Number"
                  required
                  {...register("phoneNumber")}
                  placeholder="Enter Your Phone Number"
                  errorMessage={showError("phoneNumber")}
                />
              </>
            )}

            {step === 2 && (
              <>
                <InputField
                  label="Position"
                  required
                  {...register("position")}
                  placeholder="Enter Your Position"
                  errorMessage={showError("position")}
                />
                <InputField
                  label="Brand Name"
                  required
                  {...register("brand")}
                  placeholder="Enter Your Brand Name"
                  errorMessage={showError("brand")}
                />
                
                {/* UPDATED: Dynamic categories dropdown */}
                <SelectField
                  name="category"
                  options={dynamicCategories.map((cat) => cat.name)}
                  value={getValues("category")}
                  onChange={(val) =>
                    setValue("category", val as string, {
                      shouldValidate: true,
                      shouldTouch: true,
                    })
                  }
                  label="Your Category"
                  placeholder={categoriesLoading ? "Loading categories..." : "Select An Option"}
                  error={errors.category?.message}
                  required
                  showError={!!isFinalSubmit}
                 
                />

                <InputField
                  label="Website URL"
                  {...register("website")}
                  placeholder="Enter Your Website URL"
                  required
                  errorMessage={showError("website")}
                />
                <div className="col-span-2">
                  <SelectField
                    name="sellingInUS"
                    options={yesNo}
                    value={getValues("sellingInUS")}
                    onChange={(val) =>
                      setValue("sellingInUS", val as string, {
                        shouldValidate: true,
                        shouldTouch: true,
                      })
                    }
                    placeholder="Select An Option"
                    label="Is your brand already selling in the US?"
                    error={errors.sellingInUS?.message}
                    showError={!!isFinalSubmit}
                    required
                  />
                </div>
                {step === 2 && (
                  <CheckboxGroup
                    name="goals"
                    options={goals}
                    value={getValues("goals")}
                    onChange={(val) =>
                      setValue("goals", val, { shouldValidate: true })
                    }
                    label="What are your main goals for working with us?"
                    error={
                      isFinalSubmit || touchedFields.goals
                        ? errors.goals?.message
                        : ""
                    }
                    required
                  />
                )}
              </>
            )}
          </div>

          {formError && (
            <div className="text-red-600 text-center mt-10 font-medium text-[20px]">
              <p>{formError}</p>
              {emptyFields.length > 0 && (
                <ul className="mt-2 text-sm text-red-500 list-none space-y-1">
                  {emptyFields.map((msg, i) => (
                    <li key={i}>• {msg}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex justify-between mt-10">
            {step === 2 && (
              <Button
                type="button"
                onClick={() => {
                  setIsFinalSubmit(false);
                  prevStep();
                }}
                className="text-white"
              >
                Back
              </Button>
            )}
            {step === 1 ? (
              <Button
                type="button"
                onClick={() => {
                  setIsFinalSubmit(false);
                  nextStep();
                }}
                className="text-white"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={() => setIsFinalSubmit(true)}
                className="text-[#000] !bg-[#ffd400]"
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>
        </Form.Root>
      </div>
    </div>
  );
};

export default SignUpAsBrand;