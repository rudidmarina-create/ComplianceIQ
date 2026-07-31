"use server";

/**
 * Server actions for the compliance engine.
 *
 * These wrap the engine functions so they can be called from client components
 * via Next.js server actions.
 */

import { runComplianceCheck } from "./engine";
import type { ComplianceCheckResult } from "./engine";

/**
 * Server action to run a full compliance check for a company.
 *
 * Call from client components:
 *   const result = await runComplianceCheckAction(companyId);
 */
export async function runComplianceCheckAction(
  companyId: string
): Promise<ComplianceCheckResult> {
  return runComplianceCheck(companyId);
}
