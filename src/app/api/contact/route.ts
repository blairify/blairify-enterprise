import { type NextRequest, NextResponse } from "next/server";

interface ContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  teamSize: string;
  message: string;
}

const SALES_EMAIL = "blairify.team@gmail.com";

export async function POST(req: NextRequest) {
  const apiKey = process.env.MAILERSEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Email service is not configured" },
      { status: 500 },
    );
  }

  let payload: ContactPayload;

  try {
    payload = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { firstName, lastName, email, company, jobTitle, teamSize, message } =
    payload;

  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") || "Unknown name";
  const companyName = company || "Unknown company";

  const subject = `New enterprise request from ${fullName} (${companyName})`;

  const text = [
    `Name: ${fullName}`,
    `Email: ${email || "N/A"}`,
    `Company: ${companyName}`,
    `Job title: ${jobTitle || "N/A"}`,
    `Team size: ${teamSize || "N/A"}`,
    "",
    "Message:",
    message || "(no message provided)",
  ].join("\n");

  try {
    const fromEmail = process.env.MAILERSEND_FROM_EMAIL;

    if (!fromEmail) {
      return NextResponse.json(
        { error: "Email sender not configured" },
        { status: 500 },
      );
    }

    const response = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: {
          email: fromEmail,
          name: "Blairify",
        },
        to: [
          {
            email: SALES_EMAIL,
            name: "Blairify Sales",
          },
        ],
        subject,
        text,
      }),
    });

    if (!response.ok) {
      let detail: unknown = null;

      try {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          detail = await response.json();
        } else {
          detail = await response.text();
        }
      } catch {
        detail = null;
      }

      return NextResponse.json(
        { error: "Failed to send email", detail },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while sending email" },
      { status: 500 },
    );
  }
}
