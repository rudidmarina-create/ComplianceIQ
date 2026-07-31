/**
 * Compliance engine module — data-driven rules engine for employment law compliance.
 *
 * Usage:
 * ```ts
 * import { runComplianceCheck } from "@/modules/compliance";
 *
 * const { tasks, applicableRules, healthScore } = await runComplianceCheck(companyId);
 * ```
 */

// Engine
export {
  evaluateCondition,
  evaluateRule,
  evaluateAllRules,
  generateTasks,
  calculateHealthScore,
  runComplianceCheck,
} from "./engine";

export type {
  ProfileInput,
  FieldOperator,
  ConditionLeaf,
  ConditionGroup,
  ConditionNode,
  RuleTaskDef,
  ComplianceCheckResult,
} from "./engine";

// Server actions
export { runComplianceCheckAction } from "./actions";
