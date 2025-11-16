import { describe, expect, it } from "@jest/globals";
import {
  signinRequestExample,
  signupRequestExample,
} from "@/lib/validation/blairify-auth";
import { signinUser, signupEnterpriseAdmin } from "../blairify-auth-service";

function uniqueEmail(base: string): string {
  const [local, domain] = base.split("@");
  return `${local}+test-${Date.now()}@${domain}`;
}

function uniqueDomain(base: string): string {
  const timestamp = Date.now();
  if (!base.includes(".")) return `${base}-${timestamp}.com`;
  const [name, ...rest] = base.split(".");
  return `${name}-${timestamp}.${rest.join(".")}`;
}

describe("blairify-auth-service", () => {
  it("signupEnterpriseAdmin returns ok for new enterprise domain", async () => {
    const input = {
      ...signupRequestExample,
      email: uniqueEmail(signupRequestExample.email),
      companyDomain: uniqueDomain(signupRequestExample.companyDomain),
    };

    const result = await signupEnterpriseAdmin(input);

    expect(result.ok).toBe(true);
  });

  it("signinUser returns ok for valid credentials", async () => {
    const domain = uniqueDomain(signupRequestExample.companyDomain);
    const email = uniqueEmail(
      signupRequestExample.email.replace("@acme.com", `@${domain}`),
    );

    const signupInput = {
      ...signupRequestExample,
      email,
      companyDomain: domain,
    };

    const signupResult = await signupEnterpriseAdmin(signupInput);

    if (!signupResult.ok) {
      throw new Error(`Signup failed in signin test: ${signupResult.error}`);
    }

    const signinInput = {
      ...signinRequestExample,
      email,
    };

    const signinResult = await signinUser(signinInput);

    expect(signinResult.ok).toBe(true);
  });
});
