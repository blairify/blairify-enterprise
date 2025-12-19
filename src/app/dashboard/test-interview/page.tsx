import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Test interview | Blairify Enterprise",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TestInterviewRedirectPage() {
  redirect("/test-interview");
}
