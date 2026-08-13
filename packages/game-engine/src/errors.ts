import type { RuleError } from "@duelo/shared";

export class RuleViolation extends Error {
  readonly error: RuleError;

  constructor(code: string, message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = "RuleViolation";
    this.error = { code, message, context };
  }
}

export function fail(code: string, message: string, context?: Record<string, unknown>): never {
  throw new RuleViolation(code, message, context);
}
