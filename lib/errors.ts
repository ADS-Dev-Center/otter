import type { ZodError } from "zod";

export class DomainError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string = "Validation failed",
    details?: unknown,
    code: string = "VALIDATION_ERROR",
  ) {
    super(message, code, 400, details);
  }
}

export class MalformedJsonError extends DomainError {
  constructor(message: string = "Invalid JSON in request body") {
    super(message, "MALFORMED_JSON", 400);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string = "Not found") {
    super(message, "NOT_FOUND", 404);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string = "Conflict") {
    super(message, "CONFLICT", 409);
  }
}

export class GoneError extends DomainError {
  constructor(
    message: string = "Resource is no longer available",
    code: string = "GONE",
  ) {
    super(message, code, 410);
  }
}

export class UnprocessableEntityError extends DomainError {
  constructor(
    message: string = "Unprocessable entity",
    code: string = "UNPROCESSABLE_ENTITY",
  ) {
    super(message, code, 422);
  }
}

export class InternalError extends DomainError {
  constructor(message: string = "Internal server error") {
    super(message, "INTERNAL_ERROR", 500);
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}

export function toFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    fieldErrors[key] = fieldErrors[key] || [];
    fieldErrors[key].push(issue.message);
  }

  return fieldErrors;
}
