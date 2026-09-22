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
    heading: "Information We Collect",
    sections: [
      {
        title: "From Testers/Consumers",
        description:
          "When you join the Consoomers tester community, we may collect:",
        points: [
          "Personal details: name, email, age group, income range, household information, demographic and other personal data you choose to provide.",
          "Feedback and survey responses: your opinions, product reviews, and testing participation data.",
          "Account data: preferences, login details, and activity on our platform.",
          "Technical data: IP address, browser type, device information, and website usage data.",
        ],
      },
      {
        title: "From Brands",
        description:
          "When you engage with Consoomers as a brand client, we may collect:",
        points: [
          "Business details: company name, contact information, and business representative details.",
          "Transactional data: billing information, payment records, subscription details.",
          "Business content: product samples, marketing materials, and proprietary brand data shared with us for listing, evaluation, and testing.",
          "Technical data: IP address, browser type, device information, and website usage data.",
        ],
      },
    ],
  },
  {
    heading: "How We Use Information",
    sections: [
      {
        title: "From Testers/Consumers",
        points: [
          "To match you with relevant product testing opportunities.",
          "To manage your participation in surveys and feedback programs.",
          "To provide brands with aggregated, anonymized insights from your feedback.",
          "To communicate with you about opportunities, updates, or community news.",
        ],
      },
      {
        title: "From Brands",
        points: [
          "To deliver consumer insights, reports, and testing results.",
          "To process payments, manage accounts, and fulfill contractual obligations.",
          "To communicate about services, updates, and opportunities.",
          "To maintain confidentiality of proprietary information shared with us.",
        ],
      },
    ],
  },
  {
    heading: "How We Share Information",
    sections: [
      {
        title: "From Testers/Consumers",
        points: [
          "With Brands: Your feedback is shared in aggregated and anonymized form, unless you explicitly consent to be identified.",
          "With Service Providers: We may use trusted third parties (hosting, analytics, email, payment processing) to operate our platform.",
        ],
      },
      {
        title: "Brands",
        points: [
          "With Testers/Consumers: Brand information (e.g., product packaging, brand name) may be shared as part of testing activities, but only to the extent necessary.",
          "With Service Providers: Third-party vendors may process business information on our behalf (e.g., billing, hosting).",
        ],
      },
      {
        title: "Legal & Business Transfers (Both)",
        description:
          "We may disclose information if required by law or in the event of a merger, acquisition, or sale of assets.",
      },
    ],
  },
  {
    heading: " Your Choices and Rights",
    sections: [
      {
        points: [
          "You may update or correct your information at any time by contacting us.",
          "You may request deletion of your personal data, subject to legal and contractual requirements.",
          "Consumers may opt out of receiving marketing communications via the unsubscribe link in our emails.",
        ],
      },
    ],
  },
   {
    heading: "Data Retention",
    sections: [
      {
        points: [
          "Consumers: We keep personal data for as long as you are active in our community. Feedback may remain in aggregated, anonymized form even after account deletion.",
          "Brands: We retain business and billing records as long as necessary for legal, accounting, or contractual purposes.",
        ],
      },
    ],
  },
  {
    heading: "Security",
    sections: [
      {
        description:
          "We use reasonable technical and organizational measures to protect information. However, no method of storage or transmission online is 100% secure.",
      },
    ],
  },
  {
    heading: "Cookies & Tracking",
    sections: [
      {
        description:
          "We use cookies and similar technologies to improve your browsing experience, analyze site traffic, and understand how our platform is used. Cookies may also help us remember your preferences and tailor content to you.",
      },
      {
        description:
          "You can control or disable cookies through your browser settings. Please note that disabling cookies may affect the functionality of certain features on our website.",
      },
    ],
    
  },
  {
    heading: "Children's Privacy",
    sections: [
      {
        description:
          "Consoomers is not intended for individuals under 18. We do not knowingly collect personal data from children.",
      },
    ],
  },
  {
    heading: " International Users",
    sections: [
      {
        description:
          "If you access our services outside the U.S., your information will be processed and stored in the U.S., where privacy laws may differ from those in your country.",
      },
    ],
  },
  {
    heading: " Updates to This Policy",
    sections: [
      {
        description:
          "We may update this Privacy Policy occasionally. Any changes will be posted here with a new effective date.",
      },
    ],
  },
  {
    heading: " Contact Us",
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
    <section className="max-w-[900px] mx-auto px-4 md:px-0 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-4 text-center">
        <Heading>
          Privacy Policy
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
