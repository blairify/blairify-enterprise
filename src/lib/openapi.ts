import type {
  SigninRequest,
  SignupRequest,
} from "@/lib/validation/blairify-auth";
import {
  signinRequestExample,
  signupRequestExample,
} from "@/lib/validation/blairify-auth";

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
  },
  components: {},
};
