"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  type CreateOrganisationFormState,
  createOrganisationAction,
} from "./actions";

function fieldError(
  state: CreateOrganisationFormState,
  field: keyof CreateOrganisationFormState["fieldErrors"],
) {
  const errors = state.fieldErrors[field];

  if (!errors || errors.length === 0) {
    return null;
  }

  return errors[0];
}

const initialState: CreateOrganisationFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

const INDUSTRIES = [
  "SaaS & B2B Software",
  "Fintech & Payments",
  "E-commerce & Marketplaces",
  "Healthtech & Digital Health",
  "EdTech",
  "AI & Machine Learning",
  "Developer Tools & Platforms",
  "Cloud & DevOps",
  "Data & Analytics / BI",
  "Cybersecurity",
  "Productivity & Collaboration",
  "Marketing Tech & AdTech",
  "Customer Support & CX Platforms",
  "HR Tech & Recruiting",
  "Design & Creative Tools",
  "Media, Streaming & Entertainment",
  "Gaming & Esports",
  "Logistics & Supply Chain Tech",
  "PropTech & Real Estate Platforms",
  "Climate & Sustainability Tech",
];

const ORGANISATION_SIZES = [
  "1–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–500 employees",
  "501–1,000 employees",
  "1,001–5,000 employees",
  "5,001+ employees",
];

interface CountryOption {
  code: string;
  name: string;
}

export function CreateOrganisationForm() {
  const router = useRouter();

  const [industryValue, setIndustryValue] = useState<string>("");
  const [locationValue, setLocationValue] = useState<string>("");
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [sizeValue, setSizeValue] = useState<string>("");
  const [countries, setCountries] = useState<CountryOption[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadCountries() {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2",
        );

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as Array<{
          cca2?: string;
          name?: { common?: string };
        }>;

        if (cancelled) {
          return;
        }

        const mapped: CountryOption[] = data
          .map((country) => {
            const code = country.cca2 ?? "";
            const name = country.name?.common ?? "";

            if (!code || !name) {
              return null;
            }

            return { code, name };
          })
          .filter((country): country is CountryOption => country !== null)
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(mapped);
      } catch {
        return;
      }
    }

    void loadCountries();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCountries = countries.filter((country) => {
    const term = locationSearch.trim().toLowerCase();

    if (!term) {
      return true;
    }

    return country.name.toLowerCase().includes(term);
  });

  const [state, formAction, isPending] = useActionState(
    async (prevState: CreateOrganisationFormState, formData: FormData) => {
      const result = await createOrganisationAction(prevState, formData);

      if (result.status === "success") {
        router.refresh();
      }

      return result;
    },
    initialState,
  );

  const nameError = fieldError(state, "name");
  const descriptionError = fieldError(state, "description");
  const industryError = fieldError(state, "industry");
  const locationError = fieldError(state, "location");
  const sizeError = fieldError(state, "size");
  const websiteError = fieldError(state, "website");
  const hiringFocusError = fieldError(state, "hiringFocus");

  const isError = state.status === "error" && state.message;
  const isSuccess = state.status === "success" && state.message;

  return (
    <form
      action={formAction}
      className="space-y-6"
      aria-describedby={
        state.message ? "create-organisation-form-message" : undefined
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Organisation name</Label>
          <Input
            id="name"
            name="name"
            aria-invalid={!!nameError}
            aria-describedby={
              nameError ? "create-organisation-name-error" : undefined
            }
          />
          {nameError ? (
            <Typography.Body
              id="create-organisation-name-error"
              className="text-sm text-destructive"
            >
              {nameError}
            </Typography.Body>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            aria-invalid={!!descriptionError}
            aria-describedby={
              descriptionError
                ? "create-organisation-description-error"
                : undefined
            }
          />
          {descriptionError ? (
            <Typography.Body
              id="create-organisation-description-error"
              className="text-sm text-destructive"
            >
              {descriptionError}
            </Typography.Body>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="industry">Industry domain (optional)</Label>
            <Select
              aria-label="Industry"
              value={industryValue || undefined}
              onValueChange={(next) => setIndustryValue(next)}
            >
              <SelectTrigger
                id="industry"
                aria-invalid={!!industryError}
                aria-describedby={
                  industryError
                    ? "create-organisation-industry-error"
                    : undefined
                }
              >
                <SelectValue placeholder="Select an industry domain" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="hidden" name="industry" value={industryValue} />
            {industryError ? (
              <Typography.Body
                id="create-organisation-industry-error"
                className="text-sm text-destructive"
              >
                {industryError}
              </Typography.Body>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Select
              aria-label="Location"
              value={locationValue || undefined}
              onValueChange={(next) => setLocationValue(next)}
            >
              <SelectTrigger
                id="location"
                aria-invalid={!!locationError}
                aria-describedby={
                  locationError
                    ? "create-organisation-location-error"
                    : undefined
                }
              >
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-1">
                  <Input
                    type="text"
                    placeholder="Search country..."
                    value={locationSearch}
                    onChange={(event) => setLocationSearch(event.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                {filteredCountries.map((country) => (
                  <SelectItem key={country.code} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="hidden" name="location" value={locationValue} />
            {locationError ? (
              <Typography.Body
                id="create-organisation-location-error"
                className="text-sm text-destructive"
              >
                {locationError}
              </Typography.Body>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="size">Organisation size (optional)</Label>
            <Select
              aria-label="Organisation size"
              value={sizeValue || undefined}
              onValueChange={(next) => setSizeValue(next)}
            >
              <SelectTrigger
                id="size"
                aria-invalid={!!sizeError}
                aria-describedby={
                  sizeError ? "create-organisation-size-error" : undefined
                }
              >
                <SelectValue placeholder="Select organisation size" />
              </SelectTrigger>
              <SelectContent>
                {ORGANISATION_SIZES.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="hidden" name="size" value={sizeValue} />
            {sizeError ? (
              <Typography.Body
                id="create-organisation-size-error"
                className="text-sm text-destructive"
              >
                {sizeError}
              </Typography.Body>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input
              id="website"
              name="website"
              aria-invalid={!!websiteError}
              aria-describedby={
                websiteError ? "create-organisation-website-error" : undefined
              }
              placeholder="https://example.com"
            />
            {websiteError ? (
              <Typography.Body
                id="create-organisation-website-error"
                className="text-sm text-destructive"
              >
                {websiteError}
              </Typography.Body>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hiringFocus">Hiring focus (optional)</Label>
          <Input
            id="hiringFocus"
            name="hiringFocus"
            aria-invalid={!!hiringFocusError}
            aria-describedby={
              hiringFocusError
                ? "create-organisation-hiring-focus-error"
                : undefined
            }
            placeholder="e.g. Engineering & Product"
          />
          {hiringFocusError ? (
            <Typography.Body
              id="create-organisation-hiring-focus-error"
              className="text-sm text-destructive"
            >
              {hiringFocusError}
            </Typography.Body>
          ) : null}
        </div>
      </div>

      {isError ? (
        <Typography.Body
          id="create-organisation-form-message"
          className="text-sm text-destructive"
          aria-live="polite"
        >
          {state.message}
        </Typography.Body>
      ) : null}

      {isSuccess ? (
        <Typography.Body
          id="create-organisation-form-message"
          className="text-sm text-emerald-600 dark:text-emerald-400"
          aria-live="polite"
        >
          {state.message}
        </Typography.Body>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating organisation..." : "Create organisation"}
      </Button>
    </form>
  );
}

export default CreateOrganisationForm;
