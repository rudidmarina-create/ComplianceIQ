"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

// ── Zod schema for company profile ──────────────────────────────────

export const companyProfileSchema = z.object({
  industry: z.string().min(1, "Industry is required"),
  state: z.string().length(2, "State must be a 2-letter code"),
  city: z.string().optional(),
  employeeCount: z.number().int().min(1, "Must have at least 1 employee"),
  hasRemoteWorkers: z.boolean().default(false),
  hasUnionEmployees: z.boolean().default(false),
  isFederalContractor: z.boolean().default(false),
  isNonprofit: z.boolean().default(false),
  locationCount: z.number().int().min(1).default(1),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;

// ── Create Company Profile ──────────────────────────────────────────

/**
 * Creates or updates a CompanyProfile for the given company.
 * Uses upsert so the wizard can be re-run.
 */
export async function createCompanyProfile(
  companyId: string,
  data: CompanyProfileInput,
) {
  const parsed = companyProfileSchema.parse(data);

  const profile = await prisma.companyProfile.upsert({
    where: { companyId },
    create: {
      companyId,
      ...parsed,
    },
    update: {
      ...parsed,
    },
  });

  return profile;
}

// ── Get Company Profile ─────────────────────────────────────────────

export async function getCompanyProfile(companyId: string) {
  const profile = await prisma.companyProfile.findUnique({
    where: { companyId },
  });
  return profile;
}
