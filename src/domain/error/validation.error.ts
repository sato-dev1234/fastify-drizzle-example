import { ZodIssueBase } from "zod";

import { BaseError } from "./base.error";

export class ValidationError extends BaseError {
  issues: ZodIssueBase[];

  constructor(
    code: string,
    error: string,
    issues: ZodIssueBase[],
    statusCode?: number,
  ) {
    super(code, error, statusCode);
    this.issues = issues;
  }
}
