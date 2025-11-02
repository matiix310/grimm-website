import { NextResponse } from "next/server";
import z from "zod";
import { Permissions } from "./permissions";

class ApiResponse {
  // custom
  static customError = (
    status: number,
    message: string,
    ...rest: Record<string, unknown>[]
  ) => NextResponse.json({ message, ...rest }, { status, statusText: message });

  // default
  static json = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

  static badRequest = (
    message: string = "Bad Request",
    ...rest: Record<string, unknown>[]
  ) => this.customError(400, message, ...rest);

  static unauthorized = (
    message: string = "Unauthorized",
    ...rest: Record<string, unknown>[]
  ) => this.customError(401, message, ...rest);

  static forbidden = (
    message: string = "Forbidden",
    ...rest: Record<string, unknown>[]
  ) => this.customError(403, message, ...rest);

  static notFound = (message: string = "Not Found", ...rest: Record<string, unknown>[]) =>
    this.customError(404, message, ...rest);

  static internalServerError = (
    message: string = "Internal Server Error",
    ...rest: Record<string, unknown>[]
  ) => this.customError(500, message, ...rest);

  // bad request
  static badRequestBodyParsing = () => this.badRequest("Invalid body");

  static badRequestBodyValidation = (issues: z.core.$ZodIssue[]) =>
    this.badRequest("Malformed body", { issues });

  static badRequestQueryValidation = (issues: z.core.$ZodIssue[]) =>
    this.badRequest("Malformed query parameters", { issues });

  // unauthorized
  static unauthorizedPermission = (requiredPermissions: Permissions) =>
    this.unauthorized("You don't have the required permissions to use this endpoint", {
      requiredPermissions,
    });

  // not found
  static notFoundUser = () => this.notFound("User not found");
}

export default ApiResponse;
