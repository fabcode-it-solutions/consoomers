/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import * as Form from "@radix-ui/react-form";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import Stepper from "@/components/ui/Stepper";
import toast from "react-hot-toast";
import { MediaInput } from "@/components/global/media/upload/MediaInput";
import { useAppSelector } from "@/libs/redux/hooks";
import { selectUser } from "@/libs/redux/selectors/selectors";
import { Upload, X, FileText } from "lucide-react";

const ownershipTypes = [
  "Sole Proprietorship",
  "Partnership",
  "Limited Liability Company (LLC)",
  "Corporation",
  "Veteran-Owned Business",
  "Other",
];

const sweepstakeOptions = [
  "Yes, happy to join",
  "Not interested in joining the sweepstake",
];

// ✅ Zod validation schema
const createBrandSchema = z.object({
  countryFounded: z
    .string()
    .min(2, "Please enter where and when the brand was founded"),
  currentOwnership: z.string().min(1, "Please select ownership type"),
  brandMedia: z.array(z.any()).min(1, "Please upload at least one brand photo or video"),
  logo: z.string().uuid("Invalid logo ID").optional().nullable(),
  products: z
    .array(
      z.object({
        url: z.string().url("Please enter a valid product URL"),
        media: z.array(z.any()).min(1, "Please upload product images"),
      })
    )
    .min(1, "Please add at least one product")
    .max(5),
  productsCsv: z.any().optional(),
  sweepstake: z.string().min(1, "Please select an option"),
});

type FormData = z.infer<typeof createBrandSchema>;

interface CreateBrandFormProps {
  userId: string;
}

const CreateBrandForm: React.FC<CreateBrandFormProps> = ({ userId }) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const user = useAppSelector(selectUser);
  const [brandMedia, setBrandMedia] = useState<any[]>([]);
  const [logo, setLogo] = useState<any | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [brandName, setBrandName] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Initialize react-hook-form
  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createBrandSchema),
    mode: "onChange",
    defaultValues: {
      countryFounded: "",
      currentOwnership: "",
      brandMedia: [],
      logo: "",
      products: [{ url: "", media: [] }],
      productsCsv: null,
      sweepstake: "",
    },
  });

  // ✅ Manage dynamic product fields via useFieldArray
  const { fields: products, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  useEffect(() => setValue("brandMedia", brandMedia), [brandMedia, setValue]);
  useEffect(() => setValue("logo", logo ? logo.id : null), [logo, setValue]);
  useEffect(() => setValue("productsCsv", csvFile), [csvFile, setValue]);

  // ✅ Fetch existing brand name
  useEffect(() => {
    async function fetchBrand() {
      if (!userId) return;
      try {
        const res = await fetch(`/api/auth/register/brand?userId=${userId}`);
        const data = await res.json();
        if (res.ok && data.success && data.data?.brandName) {
          setBrandName(data.data.brandName);
        } else {
          setMessage(data.error || "No brand found for this user.");
        }
      } catch (error) {
        console.error("Error fetching brand:", error);
        setMessage("Error fetching brand name.");
      }
    }
    fetchBrand();
  }, [userId]);

  // ✅ Step navigation logic
  const nextStep = async () => {
    let fields: (keyof FormData)[] = [];
    if (step === 1) fields = ["countryFounded", "currentOwnership", "brandMedia", "logo"];
    else if (step === 2) fields = ["products"];

    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const addProduct = () => {
    if (products.length >= 5) return toast.error("Maximum 5 products allowed");
    append({ url: "", media: [] });
  };

  const removeProduct = (index: number) => {
    if (products.length === 1) return toast.error("At least one product required");
    remove(index);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("CSV file must be less than 10MB");
      return;
    }

    setCsvFile(file);
    toast.success("CSV file uploaded successfully");
  };

  const removeCsvFile = () => {
    setCsvFile(null);
    toast.success("CSV file removed");
  };

  // ✅ Submit handler
  const onSubmit = async (data: FormData) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: user.id,
        brandName,
        countryFounded: data.countryFounded ?? null,
        currentOwnership: data.currentOwnership,
        brandMedia: data.brandMedia ?? [],
        logo: data.logo ?? null,
        products: data.products ?? [],
        productsCsv: csvFile ? csvFile.name : null,
        sweepstake: data.sweepstake,
      };

      const response = await fetch("/api/create-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to create brand");
      toast.success(result.message || "Brand created successfully!");
      router.push("/brands");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="w-full max-w-[800px] mx-auto">
        <div className="text-center mb-8">
          <Heading
            level={1}
            className="text-[28px] md:text-[36px] font-bold mb-3 text-[#1d1d1f]"
          >
            Brand Information Form
          </Heading>
          <p className="text-base text-[#86868b]">
            Help us showcase your brand to our community
          </p>
        </div>

        <Stepper
          currentStep={step}
          steps={[{ label: "Basic Info" }, { label: "Products" }, { label: "Finalize" }]}
        />

        <Form.Root
          className="bg-white border-[1px] overflow-hidden mt-8"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="p-8 md:p-12 space-y-10">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <InputField
                  label="Brand Name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Enter your brand name"
                  required
                />

                <InputField
                  label="Where (country) and when (year) was it founded?"
                  {...register("countryFounded")}
                  placeholder="Country, Year"
                  errorMessage={errors.countryFounded?.message}
                  required
                />

                <div className="space-y-4">
                  <label className="block text-base font-semibold text-[#1d1d1f]">
                    Current ownership <span className="text-red-500">*</span>
                  </label>
                  {ownershipTypes.map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        value={type}
                        {...register("currentOwnership")}
                        className="w-5 h-5 text-[#0071e3]"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                  {errors.currentOwnership && (
                    <p className="text-sm text-red-500">{errors.currentOwnership.message}</p>
                  )}
                </div>

                {/* Brand Media */}
                {user?.id && (
                  <div className="space-y-2">
                    <Controller
                      name="brandMedia"
                      control={control}
                      render={({ field }) => (
                        <MediaInput
                          label="Brand Photos & Videos"
                          size="1930 * 330"
                          required
                          mode="multiple"
                          selectedMedia={field.value || []}
                          onChange={(media) => field.onChange(media)}
                          userId={user.id}
                          errorMessage={errors.brandMedia?.message}
                          config={{
                            allowedTypes: ["image", "video"],
                            maxFiles: 5,
                            minFiles: 2,
                            maxSize: 10,
                          }}
                        />
                      )}
                    />
                    <div className="text-sm text-[#86868b] space-y-1">
                      <p>Please upload 2 to 5 photos for your brand - you can include a video</p>
                      <p>Upload up to 5 supported files: image or video. Max 10 MB per file.</p>
                    </div>
                  </div>
                )}

                {/* Logo */}
                {user?.id && (
                  <MediaInput
                    label="Brand Logo"
                     size="1024 * 1024 / 1080 * 1080"
                    mode="single"
                    selectedMedia={logo ? [logo] : []}
                    onChange={(files) => {
                      const file = files[0] || null;
                      setLogo(file);
                      setValue("logo", file ? file.id : null, { shouldValidate: true });
                    }}
                    userId={user.id}
                    errorMessage={errors.logo?.message as string | undefined}
                    required
                    config={{
                      allowedTypes: ["image"],
                      maxFiles: 1,
                      maxSize: 10,
                    }}
                  />
                )}
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-8">
                {products.map((product, index) => (
                  <div key={product.id} className="border-2 border-gray-200 rounded-xl p-6 space-y-4">
                    <div className="flex justify-between">
                      <h4 className="font-semibold text-[#1d1d1f]">
                        Product #{index + 1} <span className="text-red-500">*</span>
                      </h4>
                      {products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="text-red-500 text-sm hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <Controller
                      name={`products.${index}.url`}
                      control={control}
                      render={({ field }) => (
                        <InputField
                          placeholder="https://yourbrand.com/product"
                          {...field}
                          errorMessage={errors.products?.[index]?.url?.message}
                        />
                      )}
                    />

                    {user?.id && (
                      <Controller
                        name={`products.${index}.media`}
                        control={control}
                        render={({ field }) => (
                          <MediaInput
                            label={`Upload 3 to 5 photos for product #${index + 1}`}
                            mode="multiple"
                            selectedMedia={field.value || []}
                            onChange={(newFiles) => field.onChange(newFiles)}
                            userId={user.id}
                            config={{
                              allowedTypes: ["image", "video"],
                              maxFiles: 5,
                              minFiles: 2,
                              maxSize: 10,
                            }}
                            errorMessage={errors.products?.[index]?.media?.message}
                          />
                        )}
                      />
                    )}
                  </div>
                ))}

                {/* Add Product Button */}
                {products.length < 5 && (
                  <button
                    type="button"
                    onClick={addProduct}
                    className="w-full py-3 border-2 border-dashed border-gray-200 text-[#1d1d1f] rounded-xl font-medium hover:bg-[#f5f5f7]"
                  >
                    + Add Another Product
                  </button>
                )}

                {/* CSV Upload */}
                <div className="space-y-4 mt-8 pt-8">
                  <label className="block text-base font-semibold text-[#1d1d1f] mb-1">
                    Upload CSV File (Optional)
                  </label>
                  <p className="text-sm text-[#86868b] mb-4">
                    Upload a CSV file of the product(s) you want to feature (Max 10 MB)
                  </p>

                  {csvFile ? (
                    <div className="flex items-center justify-between p-4 bg-[#f5f5f7] rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0071e3] rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1d1d1f]">{csvFile.name}</p>
                          <p className="text-xs text-[#86868b]">{(csvFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <button type="button" onClick={removeCsvFile} className="text-red-500 hover:text-red-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-[#f5f5f7]">
                      <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
                      <div className="text-center flex justify-center gap-2">
                        <Upload className="w-5 h-5 text-[#1d1d1f]" />
                        <p className="text-[15px] font-medium text-[#1d1d1f]">Add CSV file</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-4 bg-[#f5f5f7] p-6 rounded-xl">
                  <h3 className="text-base font-bold text-[#1d1d1f] mb-2">
                    Would you like to join our next sweepstake? <span className="text-red-500">*</span>
                  </h3>
                  <div className="space-y-3">
                    {sweepstakeOptions.map((opt) => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value={opt}
                          {...register("sweepstake")}
                          className="w-4 h-4 text-[#0071e3]"
                        />
                        <span className="text-[15px] text-[#1d1d1f]">
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.sweepstake && (
                    <p className="text-sm text-red-500 mt-2">
                      {errors.sweepstake.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="bg-[#f5f5f7] px-8 md:px-12 py-6 flex items-center justify-between border-t border-gray-200">
            <div>{step > 1 && <Button className="text-white" type="button" onClick={prevStep}>Back</Button>}</div>
            <div>
              {step < 3 ? (
                <Button className="text-white" type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button className="text-white" type="submit">{loading ? "Submitting..." : "Submit"}</Button>
              )}
            </div>
          </div>
        </Form.Root>
      </div>
    </div>
  );
};

export default CreateBrandForm;
