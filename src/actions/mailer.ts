"use server";
import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from "@getbrevo/brevo";

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, html }: MailOptions) {
  try {
    const emailApi = new TransactionalEmailsApi();
    emailApi.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY!
    );

    const email = {
      to: [{ email: to }],
      subject,
      htmlContent: html,
      sender: { email: "thefabcodeuser9@gmail.com", name: "Consoomer" },
    };

    console.log(email, "email");

    const result = await emailApi.sendTransacEmail(email);

    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Email sending failed");
  }
}

// ==================== OTP EMAIL ====================
export async function sendOTPEmail(email: string, otp: string) {
  console.log(otp, "otp");
  const htmlContent = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #333; text-align: center;">Your Verification Code</h2>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
      </div>
      <p style="color: #666; text-align: center;">
        Enter this code to complete your verification. This code will expire in 5 minutes.
      </p>
      <p style="color: #999; font-size: 12px; text-align: center;">
        If you didn't request this code, please ignore this email.
      </p>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject: "Your Login OTP",
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw new Error("Failed to send verification email");
  }
}

// ==================== CONTACT US EMAIL ====================
interface ContactFormData {
  name: string;
  email: string;
  organization?: string;
  topic?: string;
  message: string;
}

export async function sendContactEmail({
  name,
  email,
  organization,
  topic,
  message,
}: ContactFormData) {
  const htmlContent = `
   <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
      <h2 style="margin: 0; font-size: 24px flex items-center;">✉️ New Contact Form Submission</h2>
    </div>

    <div style="padding: 20px; color: #1f2937; line-height: 1.5;">
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${organization ? `<p><strong>Organization:</strong> ${organization}</p>` : ""}
      <p><strong>Topic:</strong> ${topic || "N/A"}</p>
      <p><strong>Message:</strong></p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; margin-top: 5px;">
        ${message.replace(/\n/g, "<br>")}
      </div>
    </div>

    <div style="background-color: #f3f4f6; color: #6b7280; padding: 15px; text-align: center; font-size: 12px;">
      <p>This message was sent from your website contact form.</p>
    </div>
  </div>
  `;

  try {
    await sendEmail({
      to: process.env.EMAIL_USER!, 
      subject: `New Form Submitted in CONSOOMERS`,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send contact email:", error);
    throw new Error("Failed to send contact form email");
  }
}
