import type {
  CreateEnterpriseUserRequest,
  SigninRequest,
  SignupRequest,
} from "@/lib/validation/blairify-auth";
import {
  signinRequestExample,
  signupRequestExample,
} from "@/lib/validation/blairify-auth";
import type { CreateCandidateRequest } from "@/lib/validation/candidates";
import { createCandidateExample } from "@/lib/validation/candidates";
import type { CreateOrganisationRequest } from "@/lib/validation/organisations";

interface BlairifyAuthUserExample {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface BlairifyAuthEnterpriseExample {
  id: string;
  name: string;
  domain: string;
}

interface BlairifySignupResponseExample {
  enterprise: BlairifyAuthEnterpriseExample;
  user: BlairifyAuthUserExample;
}

interface BlairifySigninResponseExample {
  enterprise: BlairifyAuthEnterpriseExample;
  user: BlairifyAuthUserExample;
}

export const signupResponseExample: BlairifySignupResponseExample = {
  enterprise: {
    id: "00000000-0000-0000-0000-000000000000",
    name: signupRequestExample.companyName,
    domain: signupRequestExample.companyDomain,
  },
  user: {
    id: "00000000-0000-0000-0000-000000000001",
    fullName: signupRequestExample.fullName,
    email: signupRequestExample.email,
    role: "ENTERPRISE_ADMIN",
  },
};

export const signinResponseExample: BlairifySigninResponseExample = {
  enterprise: signupResponseExample.enterprise,
  user: signupResponseExample.user,
};

export const createUserRequestExample: CreateEnterpriseUserRequest = {
  fullName: "Jamie Lee",
  email: "jamie.lee@acme.com",
  password: "Blairify!2025",
  jobTitle: "Senior Recruiter",
  role: "RECRUITER",
};

export const createOrganisationRequestExample: CreateOrganisationRequest = {
  name: "Engineering",
  description: "Core product engineering organisation",
  industry: "Software & SaaS",
  location: "Remote-first (EU)",
  size: "50-200",
  website: "https://engineering.acme.com",
  hiringFocus: "Engineering & Product",
};

export type BlairifyOpenApiDocument = {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: { url: string; description: string }[];
  paths: Record<string, unknown>;
  components: Record<string, unknown>;
};

export const blairifyOpenApiDocument: BlairifyOpenApiDocument = {
  openapi: "3.0.0",
  info: {
    title: "Blairify Enterprise API",
    version: "1.0.0",
    description:
      "Blairify Enterprise API for managing multi-tenant interview workflows.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],
  paths: {
    "/api/blairify/v1/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Sign up enterprise admin",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: signupRequestExample satisfies SignupRequest,
            },
          },
        },
        responses: {
          201: {
            description: "Enterprise and admin user created.",
            content: {
              "application/json": {
                example: signupResponseExample,
              },
            },
          },
          400: {
            description: "Validation error.",
          },
          409: {
            description: "Enterprise domain already exists.",
          },
        },
      },
    },
    "/api/blairify/v1/candidates": {
      post: {
        tags: ["Candidates"],
        summary: "Create a candidate",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: createCandidateExample satisfies CreateCandidateRequest,
            },
          },
        },
        responses: {
          201: {
            description: "Candidate created.",
          },
          400: {
            description: "Validation error.",
          },
          401: {
            description: "Unauthenticated.",
          },
          403: {
            description: "Forbidden – missing manage_candidates permission.",
          },
          429: {
            description: "Rate limited.",
          },
        },
      },
    },
    "/api/blairify/v1/auth/signin": {
      post: {
        tags: ["Auth"],
        summary: "Sign in user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: signinRequestExample satisfies SigninRequest,
            },
          },
        },
        responses: {
          200: {
            description: "Signin successful.",
            content: {
              "application/json": {
                example: signinResponseExample,
              },
            },
          },
          400: {
            description: "Invalid email domain or validation error.",
          },
          401: {
            description: "Invalid credentials.",
          },
          403: {
            description: "User inactive.",
          },
        },
      },
    },
    "/api/blairify/v1/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout current session",
        responses: {
          200: {
            description: "Logout successful.",
            content: {
              "application/json": {
                example: { success: true },
              },
            },
          },
        },
      },
    },
    "/api/blairify/v1/users": {
      post: {
        tags: ["Users"],
        summary: "Create an enterprise user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example:
                createUserRequestExample satisfies CreateEnterpriseUserRequest,
            },
          },
        },
        responses: {
          201: {
            description: "User created.",
          },
          400: {
            description: "Validation error.",
          },
          401: {
            description: "Unauthenticated.",
          },
          403: {
            description: "Forbidden – missing manage_users permission.",
          },
          409: {
            description: "User with this email already exists.",
          },
        },
      },
    },
    "/api/blairify/v1/organisations": {
      post: {
        tags: ["Organisations"],
        summary: "Create an organisation",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example:
                createOrganisationRequestExample satisfies CreateOrganisationRequest,
            },
          },
        },
        responses: {
          201: {
            description: "Organisation created.",
          },
          400: {
            description: "Validation error.",
          },
          401: {
            description: "Unauthenticated.",
          },
          403: {
            description: "Forbidden – missing manage_organisations permission.",
          },
          409: {
            description:
              "Organisation name already exists for this enterprise.",
          },
        },
      },
    },
    "/api/contact": {
      post: {
        tags: ["Contact"],
        summary: "Submit enterprise contact request",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                firstName: "Alex",
                lastName: "Carter",
                email: "alex.carter@example.com",
                company: "Acme Talent",
                jobTitle: "Head of Talent",
                teamSize: "11-50",
                message:
                  "We'd like to explore Blairify Enterprise for our global hiring team.",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Contact request accepted.",
          },
          400: {
            description: "Invalid request body.",
          },
          500: {
            description: "Email service not configured or failed.",
          },
        },
      },
    },
  },
  components: {},
};
