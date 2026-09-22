/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";

import { findUserByEmail, updateUser } from "@/models/user.model";
import { sendEmail } from "@/actions/mailer";
import { checkRateLimit } from "@/actions/rateLimiter";

export const POST = async (request: Request) => {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    // Rate limiting
    const result = await checkRateLimit(ip, {
      route: "/api/auth/forgot-password",
      limit: 10,
      windowMs: 5 * 60 * 1000, // 5 minutes
      blockMs: 10 * 60 * 1000, // 10 minutes
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 429 });
    }

    // Parse request
    const payload = await request.json();
    const { email } = payload;
    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    // Find user
    const user = await findUserByEmail({ email });
    if (!user) {
      return NextResponse.json(
        {
          error:
            "We’re sorry — we couldn’t find an account linked to this email.​Please make sure you’re using the same email address you signed up with, or create an account.​",
        },
        { status: 404 }
      );
    }

    const resetToken = uuidv4();
    const resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

    await updateUser(
      { id: user.id },
      { resetPasswordToken: resetToken, resetPasswordExpires }
    );
    const isProd = process.env.NODE_ENV === "production";
   const resetLink = `${isProd? "https://consoomers-site.vercel.app": "http://localhost:3000"}/accounts/forgot-password?authO=${resetToken}`;
    console.log(resetLink,isProd, "resetLink");
    await sendEmail({
      to: user.email,
      subject: "Reset Password |Consoomers",
      html: `
        <table role="presentation" width="100%" style="padding: 20px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" style="max-width:600px; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <tr>
  <td style="background:#f4f4f4; padding:20px; text-align:center;">
    <table role="presentation" width="100%">
      <tr>
        <td align="left" style="width:20%;">
          <a href="https://consoomers-site.vercel.app" target="_blank">
            <img
              src="https://consoomers-site.vercel.app/assets/images/Logo.png"
              alt="Consoomers Logo"
              width="121"
              height="70"
              style="display:block;"
            />
          </a>
        </td>
        <td align="left" style="width:50%;">
          <h1 style="margin:0; font-size:24px; font-weight:600; color:#333;">
            Reset your password
          </h1>
        </td>
      </tr>
    </table>
  </td>
</tr>

                <tr>
                  <td style="padding:40px 30px;">
                    <p style="font-size:18px; color:#2c3e50;">Hello ${
                      user.firstName || "User"
                    },</p>
                    <p style="font-size:16px; color:#555;">We received a request to reset your password. Click the button below to reset it.</p>
                    <table role="presentation" width="100%">
                      <tr>
                        <td align="center" style="padding:30px 0;">
                          <a href="${resetLink}" style="display:inline-block; background:#0060FF; color:#fff; padding:15px 30px; text-decoration:none;  font-weight:600; font-size:16px;">Reset My Password</a>
                        </td>
                      </tr>
                    </table>
                    <p style="font-size:14px; color:#666; text-align:center; margin-top:20px;">If the button doesn't work, copy and paste this link:</p>
                    <p style="font-size:14px; color:#0060FF; word-break:break-all; text-align:center;  cursor: pointer;">${resetLink}</p>
                    <table role="presentation" width="100%" style="margin:25px 0;">
                      <tr>
                        <td style="background-color:#fff3cd; border-left:4px solid #ffc107; padding:15px; border-radius:4px;">
                          <p style="margin:0; font-size:14px; color:#856404;">
                            <strong>🔒 Security Note:</strong> This link will expire in 10 minutes. If you didn't request this, ignore this email or contact support.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `,
    });

    return NextResponse.json({
      message:
        "We have sent you a password reset email. Please check your inbox or spam folder.",
    });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
};
