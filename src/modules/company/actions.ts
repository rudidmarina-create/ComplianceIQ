"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { wizardDataSchema } from "./schemas";
import type { WizardData } from "./schemas";

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

// ── Save Wizard Data ────────────────────────────────────────────────

/**
 * Saves the full wizard submission: updates the company name and
 * creates/updates the company profile in a single transaction.
 */
export async function saveProfileWizard(
  companyId: string,
  data: WizardData,
) {
  const parsed = wizardDataSchema.parse(data);

  const result = await prisma.$transaction(async (tx) => {
    // Update company name
    await tx.company.update({
      where: { id: companyId },
      data: { name: parsed.companyName },
    });

    // Upsert company profile
    const profile = await tx.companyProfile.upsert({
      where: { companyId },
      create: {
        companyId,
        industry: parsed.industry,
        state: parsed.state,
        city: parsed.city || null,
        employeeCount: parsed.employeeCount,
        hasRemoteWorkers: parsed.hasRemoteWorkers,
        hasUnionEmployees: parsed.hasUnionEmployees,
        isFederalContractor: parsed.isFederalContractor,
        isNonprofit: parsed.isNonprofit,
        locationCount: parsed.locationCount,
      },
      update: {
        industry: parsed.industry,
        state: parsed.state,
        city: parsed.city || null,
        employeeCount: parsed.employeeCount,
        hasRemoteWorkers: parsed.hasRemoteWorkers,
        hasUnionEmployees: parsed.hasUnionEmployees,
        isFederalContractor: parsed.isFederalContractor,
        isNonprofit: parsed.isNonprofit,
        locationCount: parsed.locationCount,
      },
    });

    return profile;
  });

  return result;
}

// ── Get Company Profile ─────────────────────────────────────────────

export async function getCompanyProfile(companyId: string) {
  const profile = await prisma.companyProfile.findUnique({
    where: { companyId },
  });
  return profile;
}

// ── Get Company with Profile ────────────────────────────────────────

export async function getCompanyWithProfile(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { profile: true },
  });
  return company;
}
