import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Build interview | Blairify Enterprise",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LegacyBuildInterviewRedirectPage() {
  redirect("/build-interview");
}
