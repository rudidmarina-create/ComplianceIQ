import { z } from "zod";

export const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Retail",
  "Manufacturing",
  "Construction",
  "Financial Services",
  "Professional Services",
  "Hospitality",
  "Education",
  "Nonprofit",
  "Other",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
] as const;

// ── Step 1: Company Basics ─────────────────────────────────────────

export const companyBasicsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Please select an industry").refine(
    (val) => INDUSTRIES.includes(val as Industry),
    { message: "Please select a valid industry" }
  ),
  employeeCount: z
    .number({ invalid_type_error: "Employee count is required" })
    .int("Must be a whole number")
    .min(1, "Must have at least 1 employee"),
});

export type CompanyBasicsInput = z.infer<typeof companyBasicsSchema>;

// ── Step 2: Location ──────────────────────────────────────────────

export const locationSchema = z.object({
  state: z
    .string()
    .length(2, "State must be a 2-letter code")
    .refine(
      (val) => US_STATES.some((s) => s.code === val),
      "Please select a valid state",
    ),
  city: z.string().optional(),
  locationCount: z
    .number({ invalid_type_error: "Location count is required" })
    .int("Must be a whole number")
    .min(1, "Must have at least 1 location"),
});

export type LocationInput = z.infer<typeof locationSchema>;

// ── Step 3: Workplace Details ─────────────────────────────────────

export const workplaceDetailsSchema = z.object({
  hasRemoteWorkers: z.boolean(),
  hasUnionEmployees: z.boolean(),
  isFederalContractor: z.boolean(),
  isNonprofit: z.boolean(),
});

export type WorkplaceDetailsInput = z.infer<typeof workplaceDetailsSchema>;

// ── Full wizard data ──────────────────────────────────────────────

export const wizardDataSchema = companyBasicsSchema
  .merge(locationSchema)
  .merge(workplaceDetailsSchema);

export type WizardData = z.infer<typeof wizardDataSchema>;
