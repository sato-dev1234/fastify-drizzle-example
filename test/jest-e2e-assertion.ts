import { ZodIssueBase } from "zod";

import { ValidationError } from "./domain/error/validation.error";

export const assertValidationError = (
  validationError: ValidationError,
  issues: ZodIssueBase[],
) => {
  expect(validationError.statusCode).toStrictEqual(400);
  expect(validationError.code).toStrictEqual("FST_ERR_VALIDATION");
  expect(validationError.error).toStrictEqual("Bad Request");
  expect(validationError.issues.length).toStrictEqual(issues.length);
  validationError.issues.forEach((issue: ZodIssueBase, index: number) => {
    expect(issue.message).toStrictEqual(issues[index].message);
    issue.path.forEach((path: string | number, pathIndex: number) => {
      expect(path).toStrictEqual(issues[index].path[pathIndex]);
    });
  });
};

export const assertNotFoundError = (notFoundError: any) => {
  expect(notFoundError.statusCode).toStrictEqual(404);
  expect(notFoundError.code).toStrictEqual("FST_ERR_NOT_FOUND");
  expect(notFoundError.error).toStrictEqual("Not Found");
  expect(notFoundError.message).toStrictEqual("Not Found");
};
