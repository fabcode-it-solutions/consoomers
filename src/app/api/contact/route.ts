
import { NextResponse } from "next/server";
import { sendContactEmail } from "@/actions/mailer";

export async function POST(req: Request) {
  try {
    const { name, email, organization, topic, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

   
    await sendContactEmail({ name, email, organization, topic, message });

    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully!",
    });
  } catch (error) {
    console.error("Error sending contact email:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}
