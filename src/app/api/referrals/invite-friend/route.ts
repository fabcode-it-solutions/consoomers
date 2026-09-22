import { db } from "@/db/db";
import { testerProfiles, testerReferrals } from "@/db/schema/tester";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { sendEmail } from "@/actions/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("BODY RECEIVED:", body);

    const userId = body.referrerId;
    const email = body.friendEmail || body.email;


    if (!email) {
      return NextResponse.json(
        { error: "friendEmail or email is required" },
        { status: 400 }
      );
    }
    const profile = await db.query.testerProfiles.findFirst({
      where: eq(testerProfiles.userId, userId),
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Tester profile not found" },
        { status: 404 }
      );
    }
    const result = await db
      .insert(testerReferrals)
      .values({
        referrerId: profile.id,
        friendEmail: email,
        status: "pending",
      })
      .returning();
    const resetLink =
      "https://consoomers-site.vercel.app/accounts/register/tester";
    await sendEmail({
      to: email,
      subject: "You've been invited to Consoomers ",
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
                        Invitation to Join Consoomers
                      </h1>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:40px 30px;">
                <p style="font-size:18px; color:#2c3e50;">
                  Hello ${email},
                </p>

                <p style="font-size:16px; color:#555;">
                  You have been invited by <strong>${
                    profile.firstName || "A friend"
                  }</strong> to join Consoomers as a tester. Click the button below to complete your registration.
                </p>

                <table role="presentation" width="100%">
                  <tr>
                    <td align="center" style="padding:30px 0;">
                      <a href="${resetLink}"
                        style="display:inline-block; background:#0060FF; color:#fff; padding:15px 30px; text-decoration:none; font-weight:600; font-size:16px;">
                        Accept Invitation
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="font-size:14px; color:#666; text-align:center; margin-top:20px;">
                  If the button doesn't work, copy and paste this link:
                </p>

                <p style="font-size:14px; color:#0060FF; word-break:break-all; text-align:center;">
                  ${resetLink}
                </p>

              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  `,
    });

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong", details: error },
      { status: 500 }
    );
  }
}
