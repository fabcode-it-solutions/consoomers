"use client";
import React, { useState } from "react";
import Image from "next/image";
import { z } from "zod";
import { useRouter } from "next/navigation";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import { motion } from "framer-motion";

const contactSchema = z.object({
  name: z.string().min(1, "Name is Required"),
  email: z.string().min(1, "Email is Required"),
  topic: z.string().min(1, "Topic is Required"),
  message: z.string().min(1, "Message is Required"),
  consent: z
    .boolean()
    .refine((val) => val === true, "You must agree to the terms & Conditions"),
});

const ContactUs = () => {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    message: "",
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = contactSchema.safeParse({
      name: formData.name,
      email: formData.email,
      topic: selectedTopic,
      message: formData.message,
      consent,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setStatus("Sending...");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          organization: formData.organization,
          topic: selectedTopic,
          message: formData.message,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Email sent successfully!");
        setFormData({ name: "", email: "", organization: "", message: "" });
        setSelectedTopic("");
        setConsent(false);
      } else {
        setStatus("❌ Failed to send email. Try again.");
      }
    } catch (err) {
      if (process.env.NODE_ENV != "production") {
        console.error(err);
      }
      setStatus("❌ Error sending email.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row max-w-[1300px] mx-auto my-16 gap-10 px-4">
      {/* Left Form */}
      <motion.div
        className="flex-1 bg-white shadow-sm p-8 md:p-12 flex flex-col"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Heading
          level={1}
          className="text-3xl md:text-4xl mb-4 text-gray-900 text-center md:text-center"
        >
          Contact Us
        </Heading>
        <p className="text-gray-600 mb-6 text-center md:text-center">
          The fastest way to reach the right team is to use the dedicated forms:
        </p>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 justify-center md:justify-center">
          <div className="flex flex-col items-center gap-2">
            <Button
              className="bg-[#FFD700] text-black hover:bg-yellow-400 px-6 py-2"
              onClick={() => router.push("/accounts/register/brand")}
            >
              BRANDS
            </Button>
            <p className="text-gray-700 text-center md:text-left text-sm">
              Projects - Plans - Partnerships
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={() => router.push("/accounts/register/tester")}
              className="bg-[#0066FF] text-white hover:opacity-90 px-6 py-2"
            >
              TESTERS
            </Button>
            <p className="text-gray-700 text-center md:text-left text-sm">
              Account - Profile - Opportunities
            </p>
          </div>
        </div>

        <hr className="border-t-2 border-blue-500 mb-6" />

        <p className="text-gray-800 mb-6 text-md font-sans text-center  ">
          Not a brand or a tester? Use the form below and we&apos;ll route your
          message.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name & Email */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <InputField
                label="Full Name"
                name="name"
                required
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <InputField
                label="Email"
                name="email"
                required
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Organization */}
          <InputField
            label="Organization"
            name="organization"
            placeholder="Enter your organization"
            value={formData.organization}
            onChange={handleChange}
          />

          {/* Topic */}
          <SelectField
            name="topic"
            label="Topic"
            required
            placeholder="Choose your option"
            value={selectedTopic}
            onChange={(val) => setSelectedTopic(val as string)}
            options={[
              "Media / Press",
              "Creator / Influencer",
              "Vendor / Service Partner",
              "Careers / Job applicant",
              "Others",
            ]}
            error={errors.topic}
          />
          {errors.topic && (
            <p className="text-red-500 text-sm">{errors.topic}</p>
          )}

          {/* Message */}
          <InputField
            label="Message"
            name="message"
            required
            placeholder="Message"
            type="textarea"
            value={formData.message}
            onChange={handleChange}
            error={!!errors.message}
          />
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message}</p>
          )}

          {/* Consent */}
          <div>
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="w-5 h-5 accent-blue-600 mt-1"
              />
              <label htmlFor="consent" className="text-gray-700 text-sm">
                I agree to the{" "}
                <a
                  href="/terms"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Privacy Policy
                </a>
                .
              </label>
            </span>
            <span>
              {errors.consent && (
                <p className="text-red-500 text-sm mt-3">{errors.consent}</p>
              )}
            </span>
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <motion.button
              type="submit"
              className="bg-black text-white hover:bg-gray-800 px-8 py-3 font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit
            </motion.button>
          </div>

          {/* Status */}
          {status && (
            <p className="text-center mt-4 text-gray-800 font-medium">
              {status}
            </p>
          )}
        </form>
      </motion.div>

      {/* Right Image */}
      <motion.div
        className="hidden md:flex flex-1 justify-center items-center"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative w-full max-w-[500px]">
          <Image
            src="/assets/images/contactusimage.jpg"
            alt="Contact Illustration"
            width={500}
            height={700}
            className="object-cover"
          />
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-blue-300 to-blue-500 opacity-30 rounded-full blur-3xl animate-pulse"></div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactUs;
