/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import * as Form from "@radix-ui/react-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import Button from "@/components/ui/Button";
import CountryDropdown from "@/components/ui/CountryDropDown";
import toast from "react-hot-toast";
import Stepper from "@/components/ui/Stepper";
import CheckboxGroup from "@/components/ui/CheckboxGroup";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "@/libs/redux/store";
import { setProfile } from "@/libs/redux/slices/profileSlice";
import Image from "next/image";
import { TextArea } from "../ui/TextArea";
import StateDropdown from "@/components/ui/StateDropDown";
import { Country, State } from "react-country-state-city/dist/esm/types";

import { useRouter } from "next/navigation";
import DialogPopup from "../ui/DialogPopup";
import TagInput from "../ui/dashboard/TagInput";
import { useSession } from "next-auth/react";
import { MediaInput } from "../global/media/upload/MediaInput";
import { TesterProfile } from "@/db/type";

// Schema - Same as TesterForm but without password fields
const schema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z
      .string()
      .min(1, "Email Address is required")
      .email("Invalid Email Address"),
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    locationType: z.string().min(1, "Location type is required"),
    household: z.string().min(1, "Household type is required"),
    income: z.string().min(1, "Income is required"),
    gender: z.string().min(1, "Gender is required"),
    ageGroup: z.string().min(1, "Age group is required"),
    categoryInterested: z
      .array(z.string())
      .min(1, "Select at least one category")
      .max(5, "You can select up to 5 categories only."),
    // optional beauty & personal care
    mainInterest: z.array(z.string()).optional(),
    specificIntrest: z.array(z.string()).optional(),
    beautySkinType: z.string().optional(),
    beautySkinTone: z.string().optional(),
    hairColor: z.string().optional(),
    hairType: z.string().optional(),
    avgMonthlySpend: z.string().optional(),

    fitnessWellness: z.array(z.string()).optional(),
    primaryFocus: z.array(z.string()).optional(),
    foodBeverage: z.array(z.string()).optional(),
    foodAllergies: z.string().optional(),
    hobbies: z.array(z.string().min(1)).optional(),
    pets: z.array(z.string()).optional(),
    kids: z.array(z.string()).optional(),
    avatarUrl: z.string().optional(),
    agreement: z
      .array(z.string())
      .min(5, "Please select all agreement options"),
    aboutYou: z.string().optional(),
    testerTier: z.string().optional(),
    criteria: z.string().optional(),
    score: z.string().optional(),
    profileImage: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.categoryInterested.includes("Beauty & Personal Care")) {
      const requiredFields = ["beautySkinTone", "hairColor", "hairType"];
      requiredFields.forEach((field) => {
        const value = data[field as keyof typeof data];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          ctx.addIssue({
            path: [field],
            message: `${field} is required for Beauty & Personal Care`,
            code: "custom",
          });
        }
      });
    }
  })
  .superRefine((data, ctx) => {
    if (data.categoryInterested.includes("Food & Beverage")) {
      if (!data.foodBeverage || data.foodBeverage.length === 0) {
        ctx.addIssue({
          path: ["foodBeverage"],
          message: "Please select at least one dietary preference",
          code: "custom",
        });
      }
      if (!data.foodAllergies) {
        ctx.addIssue({
          path: ["foodAllergies"],
          message: "Please specify if you have food allergies or intolerances",
          code: "custom",
        });
      }
    }
  })
  .superRefine((data, ctx) => {
    if (data.categoryInterested.includes("Pet Products")) {
      if (!data.pets || data.pets.length === 0) {
        ctx.addIssue({
          path: ["pets"],
          message: "Please select at least one pet options",
          code: "custom",
        });
      }
    }
  })
  .superRefine((data, ctx) => {
    if (data.categoryInterested.includes("Kids & Baby Products")) {
      if (!data.kids || data.kids.length === 0) {
        ctx.addIssue({
          path: ["kids"],
          message: "Please select at least one kids options",
          code: "custom",
        });
      }
    }
  })
  .superRefine((data, ctx) => {
    if (data.categoryInterested.includes("Fitness & Wellness")) {
      if (!data.fitnessWellness || data.fitnessWellness.length === 0) {
        ctx.addIssue({
          path: ["fitnessWellness"],
          message: "Please select at least one primary activity options",
          code: "custom",
        });
      }
      if (!data.primaryFocus || data.primaryFocus.length === 0) {
        ctx.addIssue({
          path: ["primaryFocus"],
          message: "Please select at least one primary focus options",
          code: "custom",
        });
      }
    }
  });

export type FormData = z.infer<typeof schema>;

// Options - Same as TesterForm
const genders = ["Male", "Female", "Non-binary"];
const ages = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const householdOptions = [
  "Live alone",
  "With partner",
  "With kids",
  "With roommates",
  "Multigenerational",
];
const incomeRanges = [
  "<$50K per year",
  "$50K-$100K per year",
  "$100K-$150K per year",
  "$150K-$300K per year",
  ">$300K per year",
];
const locationTypes = ["Urban", "Suburban", "Rural"];
const categories = [
  "Beauty & Personal Care",
  "Fitness & Wellness",
  "Food & Beverage",
  "Fashion & Accessories",
  "Home & Garden",
  "Tech & Electronics",
  "Kids & Baby Products",
  "Pet Products",
  "Others",
];
const specificIntrests = [
  "Luxury Beauty",
  "Clean Beauty",
  "Professional / Salon & Spa products",
  "K-Beauty/ J-Beauty",
];
const mainInterest = [
  "Skincare",
  "Makeup",
  "Haircare",
  "Fragrance",
  "Men's grooming",
  "Beauty Tech & Devices",
  "Personal Care",
];
const skinTypes = [
  "Normal",
  "Oily",
  "Dry",
  "Combination",
  "Sensitive",
  "Acne-prone",
  "Mature/Aging",
];
const skinTones = ["Fair/Light", "Light-Medium", "Medium/Olive", "Dark/Deep"];
const hairColors = [
  "Black",
  "Brown",
  "Blonde",
  "Red/Auburn",
  "Grey/White",
  "Dyed/Colored(non-natural)",
];
const hairTypes = ["Straight", "Wavy", "Curly", "Coily/Kinky"];
const monthlySpends = ["<50", "50-100", "100-200", ">200"];
const fitnessOptions = [
  "Yoga / Pilates",
  "Gym",
  "Running / Cycling",
  "Team Sports",
  "HIIT",
  "Other",
];
const focusOptions = [
  "Nutrition",
  "Supplements",
  "Mindfulness",
  "Weight Management",
  "Strength",
];
const foodOptions = [
  "No diet restictions",
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Gluten-free",
  "Dairy free",
  "Kosher",
  "Halal",
  "Other",
];
const petsOptions = ["Dog(s)", "Cat(s)", "Other animals"];
const hobbiesOptions = [
  "Reading / Writing",
  "Watching TV & Movies",
  "Music / Podcasts",
  "Fitness / Sports / Outdoors",
  "Travel / Exploring new places",
  "Cooking / Baking",
  "Gaming",
  "Fashion / Beauty / Shopping",
  "Arts & Crafts / Creative projects",
  "Gardening / Home projects",
  "Spending time with family & friends",
  "Other",
];
const kidsOptions = [
  "Infants & Toddlers (0-2 years)",
  "Pre-School (3-5 years)",
  "Elementary (6-8 years)",
  "Tweens (9-12 years)",
  "Young Teens (13-15)",
  "Older Teens (16-18)",
  "18+ living at home",
];
const foodAllergiesOption = ["Yes", "No"];
const AgreementOptions = [
  "LIKES program",
  "VOTES campaigns",
  "SURVEY campaigns",
  "TRY & TELL campaigns (Sampling, products)",
  "FOLLOW Consoomers on Instagram",
];
const enviorment = process.env.NODE_ENV !== "production";
interface User {
  id: string;
  email: string;
  role?: string;
  testerProfile: TesterProfile;
}
type MediaItem = {
  id: string;
  url: string;
  type: string;
  name: string;
};

const EditTesterProfile = ({ user }: { user: User }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const profile = useSelector((state: RootState) => state.profile.profile);
  const dispatch = useDispatch();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [showTierModal, setShowTierModal] = useState(false);
  const { data: session } = useSession();
  const loginUser = session?.user?.role;
  console.log(loginUser);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      email: profile?.email || "",
      country: profile?.country || "",
      state: profile?.state || "",
      locationType: profile?.locationType || "",
      household: profile?.householdComposition || "",
      income: profile?.householdIncome || "",
      gender: profile?.gender || "",
      ageGroup: profile?.ageGroup || "",
      categoryInterested: profile?.categoryInterested || [],
      mainInterest: profile?.mainInterest || [],
      specificIntrest: profile?.specificIntrest || [],
      beautySkinType: profile?.beautySkinType || "",
      beautySkinTone: profile?.beautySkinTone || "",
      hairColor: profile?.hairColor || "",
      hairType: profile?.hairType || "",
      avgMonthlySpend: profile?.avgMonthlySpend || "",
      fitnessWellness: profile?.fitnessWellness || [],
      primaryFocus: profile?.primaryFocus || [],
      foodBeverage: profile?.foodBeverage || [],
      foodAllergies: profile?.foodAllergies || "",
      hobbies: profile?.hobbies || [],
      pets: profile?.pets || [],
      kids: profile?.kids || [],
      avatarUrl: profile?.imageUrl || "",
      aboutYou: profile?.aboutYou || "",
      agreement: profile?.generalAgreement ? AgreementOptions : [],
     profileImage: profile?.profileImage
  ? Array.isArray(profile.profileImage)
    ? (profile.profileImage as MediaItem[])
    : [
        {
          id: profile.id || "temp-id",
          url:
            typeof profile.profileImage === "string"
              ? profile.profileImage
              : (profile.profileImage as MediaItem).url,
          type: "image",
          name: "Profile Image",
        },
      ]
  : [] as MediaItem[],

    },
  });

  const watchedCategories = watch("categoryInterested");
  useEffect(() => {
    if (!watchedCategories.includes("Beauty & Personal Care")) {
      clearErrors([
        "mainInterest",
        "specificIntrest",
        "beautySkinType",
        "beautySkinTone",
        "hairColor",
        "hairType",
        "avgMonthlySpend",
      ]);
    }
    if (!watchedCategories.includes("Fitness & Wellness")) {
      clearErrors(["fitnessWellness", "primaryFocus"]);
    }
    if (!watchedCategories.includes("Food & Beverage")) {
      clearErrors(["foodBeverage", "foodAllergies"]);
    }
    if (!watchedCategories.includes("Pet Products")) {
      clearErrors(["pets"]);
    }
    if (!watchedCategories.includes("Kids & Baby Products")) {
      clearErrors(["kids"]);
    }
  }, [watchedCategories, clearErrors]);

  const nextStep = async () => {
    let fields: (keyof FormData)[] = [];
    if (step === 1) fields = ["firstName", "lastName", "email"];
    if (step === 2)
      fields = [
        "country",
        "state",
        "locationType",
        "household",
        "income",
        "gender",
        "ageGroup",
      ];
    if (step === 3) {
      fields = ["categoryInterested"];
      const categories = getValues("categoryInterested");

      if (categories.includes("Beauty & Personal Care")) {
        fields.push(
          "mainInterest",
          "specificIntrest",
          "beautySkinType",
          "beautySkinTone",
          "hairColor",
          "hairType",
          "avgMonthlySpend"
        );
      }
      if (categories.includes("Fitness & Wellness")) {
        fields.push("fitnessWellness", "primaryFocus");
      }
      if (categories.includes("Food & Beverage")) {
        fields.push("foodBeverage", "foodAllergies");
      }
      fields.push("pets", "hobbies", "kids");
    }
    if (step === 4) fields = ["agreement"];

    const valid = await trigger(fields);
    if (valid) setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const testerId = profile?.id;
      if (!testerId) {
        toast.error("Tester ID not found");
        setLoading(false);
        return;
      }
      const criteriaArray = criteriaList?.filter((v) => v.trim() !== "") || [];
      const profileRes = await fetch(`/api/auth/register/tester`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testerId,
          ...data,
          criteria: criteriaArray,
        }),
      });

      const profileResult = await profileRes.json();
      if (!profileRes.ok) {
        throw new Error(profileResult.error || "Profile update failed");
      }

      if (data.testerTier) {
        const tierRes = await fetch(`/api/dashboard/tester-tiers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            testerId,
            testerTier: data.testerTier,
            criteria: criteriaArray,
            score: data.score || "0",
          }),
        });

        const tierResult = await tierRes.json();
        if (!tierRes.ok) {
          throw new Error(tierResult.error || "Tier save failed");
        }

        console.log("Tier result:", tierResult);
      }
      const updatedProfile =
        profileResult.profile || profileResult.testerProfile;
      if (updatedProfile) {
        dispatch(setProfile(updatedProfile));
      }

      toast.success("Profile and tier updated successfully!");
      router.push(`/profile/${user.id}`);
    } catch (err: any) {
      console.error("Update error:", err);
      toast.error(err.message || "Failed to update profile or tier");
    } finally {
      setLoading(false);
    }
  };

  console.log("errors -->", errors);
  const [criteriaList, setCriteriaList] = useState<string[]>(
    profile?.criteria ? Object.values(profile.criteria).map(String) : []
  );
  useEffect(() => {
    const loadExistingTier = async () => {
      if (!profile?.id) return;

      try {
        const res = await fetch(
          `/api/dashboard/tester-tiers?testerId=${profile.id}`
        );
        const existingTier = await res.json();

        if (existingTier && existingTier.testerTier) {
          setValue("testerTier", existingTier.testerTier);
          setValue("score", existingTier.score || "0");

          if (existingTier.criteria) {
            const criteriaArray = Array.isArray(existingTier.criteria)
              ? existingTier.criteria
              : Object.values(existingTier.criteria);
            setCriteriaList(criteriaArray);
          }
        }
      } catch (error) {
        console.error("Failed to load existing tier:", error);
      }
    };

    loadExistingTier();
  }, [profile?.id, setValue]);

  return (
    <div className="flex justify-center items-center md:min-h-[calc(100vh-180px)] relative">
      <div className="w-full max-w-[720px] mx-auto mt-[50px] max-tab-lg:px-4">
        <h2 className="text-[32px] font-semibold mb-[4px] text-center text-[#151515]">
          Edit your profile
        </h2>
        <p className="text-base font-medium text-[#15151580] text-center">
          Update your information below
        </p>

        <Stepper
          currentStep={step}
          steps={[
            { label: "Your credentials" },
            { label: "About you" },
            { label: "Your Interests" },
            { label: "Agreement" },
          ]}
        />

        <Form.Root
          className="p-[40px] border border-gray-200 mt-6 bg-white"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Step 1 */}
          {step === 1 && (
            <>
              {/* Profile Image Upload */}
              {/* <div className="flex flex-col items-center mb-8 border border-gray-200 p-2">
                <div className="relative">
                  <Image
                    src={getValues("avatarUrl") || "/default-avatar.png"}
                    width={112}
                    height={112}
                    unoptimized
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover border border-gray-300 shadow-sm"
                  />

                  {getValues("avatarUrl") && (
                    <button
                      type="button"
                      onClick={() => {
                        setValue("avatarUrl", "");
                        toast("Profile image removed");
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <label
                  htmlFor="avatarUpload"
                  className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer text-sm font-medium text-gray-700"
                >
                  {getValues("avatarUrl") ? "Change photo" : "Upload photo"}
                </label>

                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () =>
                      setValue("avatarUrl", reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
              </div> */}
              {loginUser === "admin" && (
                <div className="  rounded flex flex-col gap-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Add Tier for Tester
                  </h3>

                  <SelectField
                    label="Select Tester Tier"
                    name="testerTier"
                    options={["explorer", "trendsetter", "insider"]}
                    value={getValues("testerTier") || "explorer"}
                    onChange={(val) => setValue("testerTier", val as string)}
                  />
                  <div className=" ">
                    <TagInput
                      label="Criteria"
                      tags={criteriaList}
                      onChange={(newTags) => setCriteriaList(newTags)}
                    />

                    <InputField
                      label="Score"
                      placeholder="0"
                      {...register("score")}
                    />
                  </div>
                </div>
              )}
              <MediaInput
                label="Profile Image"
                mode="single"
                userId={session?.user?.id ?? ""}
                selectedMedia={watch("profileImage") || []}
                onChange={(media) => {
                  console.log("Media selected:", media); // Debug log
                  setValue("profileImage", media);
                }}
              />

              <div className="grid grid-cols-2 gap-[40px] mt-[30px]">
                <InputField
                  label="First Name"
                  placeholder="Enter Your First Name"
                  required
                  {...register("firstName")}
                  errorMessage={errors.firstName?.message}
                />

                <InputField
                  label="Last Name"
                  required
                  placeholder="Enter Your Last Name"
                  {...register("lastName")}
                  errorMessage={errors.lastName?.message}
                />

                <div className="col-span-2">
                  <InputField
                    label="Email"
                    type="email"
                    placeholder="Enter Your Email"
                    className="cursor-not-allowed opacity-60"
                    disabled
                    required
                    {...register("email")}
                    errorMessage={errors.email?.message}
                  />
                </div>

                {/* <div className="col-span-2">
                  <TextArea
                    {...register("aboutYou")}
                    label="About you"
                    placeholder="Type something about you"
                    rows={4}
                    error={errors.aboutYou?.message}
                  />
                </div> */}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-[40px]">
                <CountryDropdown
                  onSelect={(country) => {
                    setSelectedCountry(country);
                    setSelectedState(null);
                    setValue("country", country?.name || "", {
                      shouldValidate: true,
                    });
                  }}
                  error={errors.country?.message}
                />

                <StateDropdown
                  onSelect={(state) => {
                    setSelectedState(state);
                    setValue("state", state?.name || "", {
                      shouldValidate: true,
                    });
                  }}
                  value={watch("state")}
                  disabled={!selectedCountry}
                  error={errors.state?.message}
                />

                <SelectField
                  label="Your gender"
                  name="gender"
                  required
                  placeholder="Select an option"
                  options={genders}
                  value={getValues("gender") || ""}
                  onChange={(val) =>
                    setValue("gender", val as string, { shouldValidate: true })
                  }
                  error={errors.gender?.message}
                />

                <SelectField
                  label="Your age group"
                  name="ageGroup"
                  required
                  placeholder="Select an option"
                  options={ages}
                  value={getValues("ageGroup") || ""}
                  onChange={(val) =>
                    setValue("ageGroup", val as string, {
                      shouldValidate: true,
                    })
                  }
                  error={errors.ageGroup?.message}
                />

                <SelectField
                  label="Your household composition"
                  name="household"
                  required
                  placeholder="Select an option"
                  options={householdOptions}
                  value={getValues("household") || ""}
                  onChange={(val) =>
                    setValue("household", val as string, {
                      shouldValidate: true,
                    })
                  }
                  error={errors.household?.message}
                />

                <SelectField
                  label="Household Income Range"
                  name="income"
                  required
                  placeholder="Select an option"
                  options={incomeRanges}
                  value={getValues("income") || ""}
                  onChange={(val) =>
                    setValue("income", val as string, { shouldValidate: true })
                  }
                  error={errors.income?.message}
                />

                <SelectField
                  label="Your location type"
                  name="locationType"
                  required
                  placeholder="Select an option"
                  options={locationTypes}
                  value={getValues("locationType") || ""}
                  onChange={(val) =>
                    setValue("locationType", val as string, {
                      shouldValidate: true,
                    })
                  }
                  error={errors.locationType?.message}
                />
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="mb-5">
                <CheckboxGroup
                  label="Which categories are you interested in?"
                  required
                  name="categoryInterested"
                  options={categories}
                  value={getValues("categoryInterested") || []}
                  onChange={(val) => {
                    const selected = getValues("categoryInterested") || [];
                    if (val.length > 5) {
                      setError("categoryInterested", {
                        type: "manual",
                        message: "You can't select more than 5 categories",
                      });
                      return;
                    }
                    clearErrors("categoryInterested");
                    setValue("categoryInterested", val, {
                      shouldValidate: true,
                    });
                  }}
                  error={errors.categoryInterested?.message}
                />
              </div>

              <AnimatePresence>
                {watch("categoryInterested")?.includes(
                  "Beauty & Personal Care"
                ) && (
                  <motion.div
                    key="beauty-section"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden border border-gray-200 p-5 mb-5"
                  >
                    <div className="mb-5">
                      <label className="font-bold text-xl">
                        Beauty & Personal Care
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-[40px] mb-4">
                      <CheckboxGroup
                        label="What are your main interest areas?"
                        name="Main Interests"
                        options={mainInterest}
                        value={getValues("mainInterest") || []}
                        onChange={(val) =>
                          setValue("mainInterest", val, {
                            shouldValidate: true,
                          })
                        }
                        error={errors.mainInterest?.message}
                      />
                      <CheckboxGroup
                        label="Specific interests"
                        name="Specific Intrests"
                        options={specificIntrests}
                        value={getValues("specificIntrest") || []}
                        onChange={(val) =>
                          setValue("specificIntrest", val, {
                            shouldValidate: true,
                          })
                        }
                        error={errors.specificIntrest?.message}
                      />
                      <SelectField
                        label="What is your skin tone?"
                        name="beautySkinTone"
                        required
                        placeholder="Select an option"
                        options={skinTones}
                        value={getValues("beautySkinTone") || ""}
                        onChange={(val) =>
                          setValue("beautySkinTone", val as string, {
                            shouldValidate: true,
                          })
                        }
                        error={errors.beautySkinTone?.message}
                      />
                      <SelectField
                        label="What is your skin type?"
                        name="beautySkinType"
                        placeholder="Select an option"
                        options={skinTypes}
                        value={getValues("beautySkinType") || ""}
                        onChange={(val) =>
                          setValue("beautySkinType", val as string, {
                            shouldValidate: true,
                          })
                        }
                        error={errors.beautySkinType?.message}
                      />

                      <SelectField
                        label="What is your hair color?"
                        name="hairColor"
                        required
                        placeholder="Select an option"
                        options={hairColors}
                        value={getValues("hairColor") || ""}
                        onChange={(val) =>
                          setValue("hairColor", val as string, {
                            shouldValidate: true,
                          })
                        }
                        error={errors.hairColor?.message}
                      />

                      <SelectField
                        label="What is your hair type?"
                        name="hairType"
                        required
                        placeholder="Select an option"
                        options={hairTypes}
                        value={getValues("hairType") || ""}
                        onChange={(val) =>
                          setValue("hairType", val as string, {
                            shouldValidate: true,
                          })
                        }
                        error={errors.hairType?.message}
                      />
                    </div>
                    <SelectField
                      label="What is your average monthly spend in beauty?"
                      name="avgMonthlySpend"
                      placeholder="Select an option"
                      options={monthlySpends}
                      value={getValues("avgMonthlySpend") || ""}
                      onChange={(val) =>
                        setValue("avgMonthlySpend", val as string, {
                          shouldValidate: true,
                        })
                      }
                      error={errors.avgMonthlySpend?.message}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fitness & Wellness */}
              <AnimatePresence>
                {watch("categoryInterested")?.includes(
                  "Fitness & Wellness"
                ) && (
                  <motion.div
                    key="fitness-section"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden border border-gray-200 p-5 mb-5"
                  >
                    <div className="mb-5">
                      <label className="font-bold text-xl">
                        Fitness & Wellness
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-[40px] mb-4">
                      <CheckboxGroup
                        label="Your primary fitness activities"
                        required
                        name="Primary Fitness Activities"
                        options={fitnessOptions}
                        value={getValues("fitnessWellness") || []}
                        onChange={(val) =>
                          setValue("fitnessWellness", val, {
                            shouldValidate: true,
                          })
                        }
                        error={errors.fitnessWellness?.message}
                      />
                      <CheckboxGroup
                        label="What is your primary focus ?"
                        required
                        name="primaryFocus"
                        options={focusOptions}
                        value={getValues("primaryFocus") || []}
                        onChange={(val) =>
                          setValue("primaryFocus", val, {
                            shouldValidate: true,
                          })
                        }
                        error={errors.primaryFocus?.message}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Food & Beverage */}
              <AnimatePresence>
                {watch("categoryInterested")?.includes("Food & Beverage") && (
                  <motion.div
                    key="food-section"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden border border-gray-200 p-5 mb-5"
                  >
                    <div className="mb-5">
                      <label className="font-bold text-xl">
                        Food & Beverage
                      </label>
                    </div>

                    <CheckboxGroup
                      label="What are your dietary preferences ?"
                      name="foodBeverage"
                      required
                      options={foodOptions}
                      value={getValues("foodBeverage") || []}
                      onChange={(val) =>
                        setValue("foodBeverage", val, { shouldValidate: true })
                      }
                      error={errors.foodBeverage?.message}
                    />
                    <div className="mt-3">
                      <SelectField
                        label="Do you have food allergies or intolerances?"
                        required
                        placeholder="Select an Option"
                        name="foodAllergies"
                        options={foodAllergiesOption}
                        value={getValues("foodAllergies")}
                        onChange={(val) =>
                          setValue("foodAllergies", val as string, {
                            shouldValidate: true,
                          })
                        }
                        error={errors.foodAllergies?.message}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {watch("categoryInterested")?.includes("Pet Products") && (
                  <motion.div
                    key="pet-section"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden border border-gray-200 p-5 mb-5"
                  >
                    <div className="mb-5">
                      <label className="font-bold text-xl">Pets</label>
                    </div>
                    <CheckboxGroup
                      label="What type of pets do you have?"
                      required
                      name="pets"
                      options={petsOptions}
                      value={getValues("pets") || []}
                      onChange={(val) =>
                        setValue("pets", val, { shouldValidate: true })
                      }
                      error={errors.pets?.message}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Kids */}
              <AnimatePresence>
                {watch("categoryInterested")?.includes(
                  "Kids & Baby Products"
                ) && (
                  <motion.div
                    key="kids-section"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden border border-gray-200 p-5 mb-5"
                  >
                    <div className="mb-5">
                      <label className="font-bold text-xl"> Kids</label>
                    </div>
                    <CheckboxGroup
                      label=" How old are the kids living with you?"
                      required
                      name="kids"
                      options={kidsOptions}
                      value={getValues("kids") || []}
                      onChange={(val) =>
                        setValue("kids", val, { shouldValidate: true })
                      }
                      error={errors.kids?.message}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hobbies */}
              <div className="border border-gray-200 p-5 mb-5">
                <div className="mb-5">
                  <label className="font-bold text-xl">Your hobbies</label>
                </div>
                <CheckboxGroup
                  label="How do you like to spend your free time?"
                  name="hobbies"
                  options={hobbiesOptions}
                  value={getValues("hobbies") || []}
                  onChange={(val) =>
                    setValue("hobbies", val, { shouldValidate: true })
                  }
                  error={errors.hobbies?.message}
                />
              </div>
            </>
          )}

          {step === 4 && (
            <fieldset
              disabled
              className="opacity-60 select-none cursor-not-allowed"
            >
              <div className="pointer-events-none">
                <CheckboxGroup
                  label="By signing up, I agree to actively participate in the Consoomers program as part of the community experience (please manually select all 5 boxes)"
                  name="agreement"
                  options={AgreementOptions}
                  value={getValues("agreement") || []}
                  onChange={() => {}}
                  error={errors.agreement?.message}
                  className="cursor-not-allowed"
                />
              </div>
            </fieldset>
          )}

          <div className="mt-[60px] flex justify-center gap-4">
            {step > 1 && (
              <Button type="button" onClick={prevStep} className="text-white">
                Back
              </Button>
            )}
            {step < 4 && (
              <Button type="button" onClick={nextStep} className="text-white ">
                Next
              </Button>
            )}
            {step === 4 && (
              <Button type="submit" className="text-[#000] !bg-[#ffd400]">
                {loading ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-4 border border-red-500 bg-red-100 text-red-700 rounded">
    <ul className="list-disc list-inside">
      {Object.entries(errors).map(([key, value]) => {
        const message = (value?.message as string) || "Invalid value";  
        return (
          <li key={key}>
            {key}: {message}
          </li>
        );
      })}
    </ul>
  </div>
          )}
        </Form.Root>
      </div>
    </div>
  );
};

export default EditTesterProfile;
