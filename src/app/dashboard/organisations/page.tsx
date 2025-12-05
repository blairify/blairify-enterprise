import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Organisation Management | Blairify Enterprise",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LegacyDashboardOrganisationsRedirectPage() {
  redirect("/organisations");
}
