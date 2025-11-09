import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blairify - AI-Powered Career Acceleration Platform ",
  description:
    "Blairify is the new standard in job search. Curated jobs meet AI-powered interview prep. Browse opportunities, and land your dream role faster. Start today!",
  keywords: [
    "job search platform",
    "tech jobs",
    "software engineer jobs",
    "interview preparation",
    "job listings",
    "career opportunities",
    "job application tracking",
    "interview practice",
    "tech career",
    "remote jobs",
    "job search",
    "job search platform",
    "job search engine",
    "job search website",
    "job search app",
    "job search tools",
  ],
  authors: [{ name: "Blairify" }],
  creator: "Blairify",
  publisher: "Blairify",
  metadataBase: new URL("https://blairify.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://blairify.com/",
    siteName: "Blairify",
    title: "Blairify - AI-Powered Career Acceleration Platform",
    description:
      "Blairify is the new standard in job search. Curated jobs meet AI-powered interview prep. Browse opportunities, practice 1000+ questions, and land your dream role faster.",
    images: [
      {
        url: "https://blairify.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Blairify - AI powered Career Acceleration Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blairify - AI-powered Career Acceleration Platform",
    description:
      "Blairify is the new standard in job search. Curated jobs meet AI-powered interview prep. Land your dream role tomorrow.",
    images: ["https://blairify.com/og-image.png"],
    creator: "@blairify",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Business",
  other: {
    "fb:app_id": "your-facebook-app-id", // TODO replace
    "og:image:secure_url": "https://blairify.com/og-image.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://blairify.com/#website",
      url: "https://blairify.com",
      name: "Blairify",
      description:
        "Job search platform with interview preparation tools for tech professionals",
      publisher: {
        "@id": "https://blairify.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://blairify.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://blairify.com/#organization",
      name: "Blairify",
      url: "https://blairify.com",
      logo: {
        "@type": "ImageObject",
        url: "https://blairify.com/300.png",
      },
      sameAs: ["https://www.linkedin.com/company/blairify"],
    },
    {
      "@type": "WebPage",
      "@id": "https://blairify.com/#webpage",
      url: "https://blairify.com",
      name: "Blairify - Job Search & Interview Prep",
      description:
        "Find tech jobs and prepare for interviews with curated listings and practice questions",
      isPartOf: {
        "@id": "https://blairify.com/#website",
      },
      about: {
        "@id": "https://blairify.com/#organization",
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: "https://blairify.com/og-image.png",
      },
    },
    {
      "@type": "Service",
      serviceType: "Job Search and Interview Preparation Platform",
      provider: {
        "@id": "https://blairify.com/#organization",
      },
      areaServed: "Worldwide",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Job Search and Interview Preparation Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Practice Interview Questions",
              description: "Access to 1000+ curated interview questions",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Personalized Dashboard",
              description: "Track your progress and interview preparation",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Job Listings",
              description: "Browse and apply to relevant job opportunities",
            },
          },
        ],
      },
    },
  ],
};

export default async function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI-Powered Interview Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Streamline your hiring process with intelligent interview
              management, automated candidate screening, and data-driven
              insights.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Go to Dashboard
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Features Grid */}
          <div id="features" className="mt-24 grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-labelledby="multi-tenant-icon"
                >
                  <title id="multi-tenant-icon">
                    Multi-Tenant Architecture
                  </title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Multi-Tenant Architecture
              </h3>
              <p className="text-sm text-muted-foreground">
                Enterprise and organization-level isolation with row-level
                security for complete data privacy.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-labelledby="secure-invite-icon"
                >
                  <title id="secure-invite-icon">Secure Invite System</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Secure Invite System
              </h3>
              <p className="text-sm text-muted-foreground">
                Single-use invite tokens with expiration and race-condition
                protection for secure candidate access.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-labelledby="question-templates-icon"
                >
                  <title id="question-templates-icon">Question Templates</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Question Templates</h3>
              <p className="text-sm text-muted-foreground">
                Reusable interview question templates at enterprise or
                organization level for consistent evaluations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
