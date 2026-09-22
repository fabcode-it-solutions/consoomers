"use client";
import React from "react";
import Heading from "@/components/ui/Heading";

interface PrivacySection {
  title?: string;
  description?: string;
  points?: string[];
}

interface PrivacyContent {
  heading?: string;
  sections?: PrivacySection[];
}

const privacyContent: PrivacyContent[] = [
  {
    heading: "Your Data Dashboard",
    sections: [
      {
        description:
          "We believe you should have full control over your personal information. From this page, you can manage how your data is collected, stored, and used on Consoomers.",
      },
    ],
  },
  {
    heading: "What You Can Control",
    sections: [
      {
        title: "Profile & Account Information",
        points: [
          "Update or edit your personal profile details such as name, email, demographics, and preferences.",
          "Change password or enable additional security controls.",
          "Deactivate or permanently delete your account at any time."
        ],
      },
      {
        title: "Testing Participation & Feedback Data",
        points: [
          "Manage the feedback you submit during product testing activities.",
          "Choose which categories or types of brands you wish to test for.",
          "Withdraw participation from active surveys or testing programs."
        ],
      },
      {
        title: "Email & Communication Preferences",
        points: [
          "Opt in or out of marketing and community newsletters.",
          "Control alerts related to testing opportunities or platform updates.",
        ],
      },
      {
        title: "Consent & Personalization",
        points: [
          "Manage cookie and tracking preferences used to improve your experience.",
          "Enable or disable personalized content recommendations.",
        ],
      },
    ],
  },
  {
    heading: "How We Protect Your Data",
    sections: [
      {
        points: [
          "We use industry-standard security practices to prevent unauthorized access, misuse, or disclosure.",
          "Your testing responses are shared with brands in anonymized or aggregated form unless you explicitly consent to identification.",
          "Payment information is processed securely by trusted third-party providers.",
        ],
      },
    ],
  },
  {
    heading: "Requesting, Downloading, or Deleting Your Data",
    sections: [
      {
        points: [
          "Request a copy of your personal information stored with us.",
          "Ask for correction of inaccurate or outdated information.",
          "Request permanent deletion of your data, subject to legal requirements.",
        ],
        description:
          "To submit a request, email us or use in-app account management controls.",
      },
    ],
  },
  {
    heading: "Transparency & Control",
    sections: [
      {
        description:
          "We believe transparency builds trust. You can review the full Privacy Policy to learn more about our data practices, retention periods, and legal compliance.",
      },
    ],
  },
  {
    heading: "Contact & Support",
    sections: [
      {
        description:
          "If you have questions about how your data is used or need support with privacy-related requests, contact us below.",
      },
    ],
  },
];


const formatPoint = (text: string) => {
    const [title, ...rest] = text.split(":");
    if (!rest.length) return text; // no colon found → return as is
    return (
      <span>
        <span className="font-semibold">{title}:</span>
        {rest.join(":")}
      </span>
    );
  };

const DataPrivacyControls = () => {
  return (
    <section className="max-w-[900px] mx-auto space-y-10">
      {/* Header */}
      <div className="space-y-4 text-center">
        <Heading>
          Data and Privacy Controls
        </Heading>
        <p className="text-gray-700 text-md">
          Effective Date: <strong>8/1/2025</strong>
        </p>
        <p className="text-gray-600">
          Consoomers (“Consoomers,” “we,” “our,” or “us”), operated by{" "}
          <span className="font-semibold">Cyrna Corp, a New York corporation</span>, values your
          privacy. This Privacy Policy explains how we collect, use, and protect personal and
          business information when you use our website, participate in our consumer community,
          or engage with our brand services.
        </p>
      </div>

      {/* Content */}
      {privacyContent.map((section, idx) => (
        <div key={idx} className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {idx + 1}. {section.heading}
          </h2>
          {section.sections?.map((sub, i) => (
            <div
              key={i}
              className="bg-white rounded-md p-6 border border-gray-200 space-y-3"
            >
              {sub.title && <h3 className="font-semibold text-gray-900">{sub.title}</h3>}
              {sub.description && <p className="text-gray-700">{sub.description}</p>}
              {sub.points && (
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {sub.points.map((point, index) => (
                   <li key={index}>{formatPoint(point)}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Contact Info */}
      <div className="mt-8 text-gray-800 space-y-1">
        <h3 className="font-semibold">Contact Information:</h3>
        <p>
          Cyrna Corp (d/b/a Consoomers)
          <br />
          Email:{" "}
          <a href="mailto:hello@consoomers.com" className="text-blue-600 hover:underline">
            hello@consoomers.com
          </a>
        </p>
      </div>
    </section>
  );
};

export default DataPrivacyControls;
