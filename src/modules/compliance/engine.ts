/**
 * Compliance Rules Engine
 *
 * Evaluates CompanyProfile data against ComplianceRules to generate ComplianceTasks.
 * Data-driven: all rule logic is expressed as JSON conditions in the database.
 */

import { prisma } from "@/lib/prisma";
import type { Prisma, ComplianceRule } from "@prisma/client";

// ── Types ──────────────────────────────────────────────────────────────

export interface ProfileInput {
  employeeCount: number;
  state: string;
  industry: string;
  hasRemoteWorkers: boolean;
  hasUnionEmployees: boolean;
  isFederalContractor: boolean;
  isNonprofit: boolean;
  locationCount: number;
}

export type FieldOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin";

export interface ConditionLeaf {
  field: string;
  operator: FieldOperator;
  value: unknown;
}

export interface ConditionGroup {
  operator: "AND" | "OR";
  conditions: (ConditionLeaf | ConditionGroup)[];
}

export type ConditionNode = ConditionLeaf | ConditionGroup;

export interface RuleTaskDef {
  title: string;
  description: string;
  category: string;
  priority: string;
  deadlineType?: string;
  deadlineOffset?: string | null;
  checklist?: string[];
  references?: { label: string; url: string }[];
}

export interface ComplianceCheckResult {
  tasks: Awaited<ReturnType<typeof prisma.complianceTask.findMany>>;
  applicableRules: ComplianceRule[];
  healthScore: number;
}

// ── Helpers ────────────────────────────────────────────────────────────

function isConditionGroup(node: ConditionNode): node is ConditionGroup {
  return (
    typeof node === "object" &&
    node !== null &&
    "operator" in node &&
    "conditions" in node &&
    Array.isArray((node as ConditionGroup).conditions)
  );
}

/**
 * Get a profile field value by name. Supports standard profile fields.
 */
function getProfileValue(profile: ProfileInput, field: string): unknown {
  const key = field as keyof ProfileInput;
  if (!(key in profile)) {
    throw new Error(`Unknown profile field: ${field}`);
  }
  return profile[key];
}

// ── Condition Evaluation ───────────────────────────────────────────────

/**
 * Evaluate a single leaf condition against a profile.
 */
export function evaluateCondition(condition: ConditionLeaf, profile: ProfileInput): boolean {
  const { field, operator, value } = condition;
  const actual = getProfileValue(profile, field);

  switch (operator) {
    case "eq":
      return actual === value;
    case "neq":
      return actual !== value;
    case "gt":
      return (actual as number) > (value as number);
    case "gte":
      return (actual as number) >= (value as number);
    case "lt":
      return (actual as number) < (value as number);
    case "lte":
      return (actual as number) <= (value as number);
    case "in": {
      const arr = value as unknown[];
      return arr.includes(actual);
    }
    case "nin": {
      const arr = value as unknown[];
      return !arr.includes(actual);
    }
    default:
      throw new Error(`Unknown field operator: ${operator}`);
  }
}

// ── Rule Evaluation ────────────────────────────────────────────────────

/**
 * Recursively evaluate a condition tree (leaf or group) against a profile.
 */
function evaluateNode(node: ConditionNode, profile: ProfileInput): boolean {
  if (isConditionGroup(node)) {
    const results = node.conditions.map((c) => evaluateNode(c, profile));

    if (node.operator === "AND") {
      return results.every(Boolean);
    }
    if (node.operator === "OR") {
      return results.some(Boolean);
    }
    throw new Error(`Unknown logical operator: ${node.operator}`);
  }

  // Leaf condition
  return evaluateCondition(node as ConditionLeaf, profile);
}

/**
 * Evaluate a full ComplianceRule's `conditions` JSON against a profile.
 * `conditions` is stored as Prisma.Json, which at runtime is a parsed object.
 */
export function evaluateRule(
  rule: Pick<ComplianceRule, "conditions">,
  profile: ProfileInput
): boolean {
  const conditions = rule.conditions as unknown as ConditionNode | null;

  // If no conditions configured, the rule always applies
  if (!conditions) return true;

  return evaluateNode(conditions, profile);
}

/**
 * Filter a list of rules to those applicable to the given profile.
 */
export function evaluateAllRules(
  profile: ProfileInput,
  allRules: ComplianceRule[]
): ComplianceRule[] {
  return allRules.filter((rule) => evaluateRule(rule, profile));
}

// ── Task Generation ────────────────────────────────────────────────────

/**
 * Generate ComplianceTasks for a company from its matching rules.
 *
 * For each applicable rule, creates or updates a ComplianceTask per task
 * definition in the rule's `tasks` JSON array. Existing tasks (matched by
 * companyId + ruleId + title) are left unchanged — only new tasks are created.
 *
 * Returns the created count and all tasks for the company.
 */
export async function generateTasks(
  companyId: string,
  profile: ProfileInput
): Promise<{ created: number; tasks: Awaited<ReturnType<typeof prisma.complianceTask.findMany>> }> {
  // Fetch all rules
  const allRules = await prisma.complianceRule.findMany();

  // Evaluate which rules apply
  const applicableRules = evaluateAllRules(profile, allRules);

  // Fetch existing tasks for this company so we can skip duplicates
  const existingTasks = await prisma.complianceTask.findMany({
    where: { companyId },
  });

  const existingKeys = new Set(
    existingTasks.map((t) => `${t.companyId}|${t.ruleId}|${t.title}`)
  );

  let created = 0;

  for (const rule of applicableRules) {
    const taskDefs = (rule.tasks as unknown as RuleTaskDef[]) ?? [];

    for (const taskDef of taskDefs) {
      const key = `${companyId}|${rule.id}|${taskDef.title}`;

      if (existingKeys.has(key)) {
        // Task already exists — skip to avoid duplication
        continue;
      }

      await prisma.complianceTask.create({
        data: {
          companyId,
          ruleId: rule.id,
          title: taskDef.title,
          description: taskDef.description,
          category: taskDef.category,
          priority: taskDef.priority,
          status: "pending",
          checklist: taskDef.checklist ?? [],
        },
      });

      created++;
    }
  }

  // Return all tasks for the company
  const tasks = await prisma.complianceTask.findMany({
    where: { companyId },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });

  return { created, tasks };
}

// ── Health Score ───────────────────────────────────────────────────────

/**
 * Calculate compliance health score.
 *
 * healthScore = (completedTasks / totalTasks) * 100
 * Returns 0 if there are no tasks.
 */
export function calculateHealthScore(
  tasks: { status: string }[]
): number {
  if (tasks.length === 0) return 0;

  const completed = tasks.filter((t) => t.status === "completed").length;
  return Math.round((completed / tasks.length) * 100);
}

// ── End-to-end Pipeline ────────────────────────────────────────────────

/**
 * Run the full compliance check for a company.
 *
 * 1. Loads the company's profile
 * 2. Generates tasks from matching rules
 * 3. Calculates the health score
 *
 * Returns tasks, applicable rules, and health score.
 */
export async function runComplianceCheck(
  companyId: string
): Promise<ComplianceCheckResult> {
  // Load the company profile
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { profile: true },
  });

  if (!company) {
    throw new Error(`Company not found: ${companyId}`);
  }

  if (!company.profile) {
    throw new Error(
      `Company ${companyId} has no profile. Complete the profile wizard first.`
    );
  }

  const profile: ProfileInput = {
    employeeCount: company.profile.employeeCount,
    state: company.profile.state,
    industry: company.profile.industry,
    hasRemoteWorkers: company.profile.hasRemoteWorkers,
    hasUnionEmployees: company.profile.hasUnionEmployees,
    isFederalContractor: company.profile.isFederalContractor,
    isNonprofit: company.profile.isNonprofit,
    locationCount: company.profile.locationCount,
  };

  // Run the pipeline
  const { tasks } = await generateTasks(companyId, profile);

  // Determine which rules are applicable
  const allRules = await prisma.complianceRule.findMany();
  const applicableRules = evaluateAllRules(profile, allRules);

  // Calculate health score
  const healthScore = calculateHealthScore(tasks);

  return { tasks, applicableRules, healthScore };
}
