"use client";
import React from "react";
import Heading from "@/components/ui/Heading";

interface TermsSection {
  title?: string;
  description?: string;
  points?: string[];
  lists?: string[][];
}

interface TermsContent {
  heading?: string;
  sections?: TermsSection[];
}

const termsContent: TermsContent[] = [
  {
    heading: "Eligibility",
    sections: [
      {
        points: [
          "Testers/Consumers: You must be at least 18 years old and reside in the United States to participate in product testing. You agree to provide accurate information and honest feedback.",
          "Brands: You must be an authorized representative of your business to purchase or use Consoomers services.",
        ],
      },
    ],
  },
  {
    heading: "Accounts and Responsibilities",
    sections: [
      {
        points: [
          "You are responsible for maintaining the confidentiality of your account and login information.",
          "You agree not to create multiple or fraudulent accounts.",
        ],
      },
    ],
  },
  {
    heading: "Use of Services",
    sections: [
      {
        points: [
          "For Testers: Products received through Consoomers are for personal evaluation only and may not be resold. Feedback must reflect your genuine opinion.",
          "For Brands: By submitting products, content, or materials to Consoomers, you grant us the right to use that content to perform our services (e.g., testing, surveys, reporting).",
        ],
      },
    ],
  },
  {
    heading: "Payments and Subscriptions (Brands Only)",
    sections: [
      {
        points: [
          "Fees for services must be paid according to the terms displayed at checkout or in your invoice.",
          "Payments are non-refundable unless otherwise stated in writing.",
        ],
      },
    ],
  },
  {
    heading: "Intellectual Property",
    sections: [
      {
        points: [
          "All content, designs, logos, and materials on the Consoomers platform are owned by Cyrna Corp.",
          "You may not copy, distribute, or use our materials without prior written permission.",
        ],
      },
    ],
  },
  {
    heading: "User Content",
    sections: [
      {
        points: [
          "Testers retain ownership of their feedback but grant Consoomers and participating brands a non-exclusive, royalty-free license to use that feedback for research, product development, and marketing purposes.",
          "If testers voluntarily provide photos, videos, or other identifiable content, they grant Consoomers and participating brands the right to use, reproduce, and display such materials — with or without attribution — for marketing, promotional, and educational purposes across all media channels.",
          "You agree not to submit unlawful, offensive, or infringing content.",
        ],
      },
    ],
  },
  {
    heading: "Disclaimers and Limitation of Liability",
    sections: [
      {
        points: [
          "Consoomers provides access to product testing and consumer insights “as is” and does not guarantee specific results.",
          "To the fullest extent permitted by law, Consoomers disclaims liability for indirect, incidental, or consequential damages.",
        ],
        lists: [
          [
            "Consoomers is not liable if:",
            "A brand fails to ship products or provide promised materials.",
            "A tester fails to provide feedback or complete an evaluation.",
            "Issues arise from the use, testing, or consumption of products. Testers participate at their own risk.",
          ],
        ],
      },
    ],
  },
  {
    heading: "Termination",
    sections: [
      {
        description:
          "We may suspend or terminate your account at any time for violation of these Terms or misuse of the platform.",
      },
    ],
  },
  {
    heading: "Governing Law",
    sections: [
      {
        description:
          "These Terms are governed by the laws of the State of New York, without regard to conflict of law principles. Any disputes will be resolved in the courts of New York, NY.",
      },
    ],
  },
  {
    heading: "Changes to Terms",
    sections: [
      {
        description:
          "We may update these Terms from time to time. The revised version will be posted on our website with a new effective date. Continued use of our services means you accept the updated Terms.",
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

const TermsConditions = () => {
  return (
    <section className="max-w-[900px] mx-auto px-4 md:px-0 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-4 text-center">
        <Heading level={1} className="text-3xl md:text-4xl">
          General Terms & Conditions
        </Heading>
        <p className="text-gray-700 text-md">
          Effective Date: <strong>8/1/2025</strong>
        </p>
        <p className="text-gray-600">
          Welcome to Consoomers (“Consoomers,” “we,” “our,” or “us”), operated
          by <span className="font-semibold">Cyrna Corp, a New York corporation</span>. By
          accessing or using our website, creating an account, or engaging with our services, you agree to these Terms & Conditions.
        </p>
      </div>

      {/* Terms Sections */}
      {termsContent.map((section, idx) => (
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
              {sub.lists?.map((list, listIdx) => (
                <ul key={listIdx} className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                  <li className="font-semibold">{list[0]}</li>
                  <ul className="pl-6 list-disc list-inside space-y-1">
                    {list.slice(1).map((item, itemIdx) => (
                      <li key={itemIdx}>{item}</li>
                    ))}
                  </ul>
                </ul>
              ))}
            </div>
          ))}
        </div>
      ))}

      {/* Contact Info */}
      <div className="mt-8 text-gray-800 space-y-1">
        <h3 className="font-semibold">Contact Information:</h3>
        <p>
          For questions about these Terms, contact us at:{" "}
          <a href="mailto:hello@consoomers.com" className="text-blue-600 hover:underline">
            hello@consoomers.com
          </a>
        </p>
      </div>
    </section>
  );
};

export default TermsConditions;
