import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z, { ZodDate, ZodIntersection, ZodObject } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fixApiDate = <
  T extends ZodObject<{ updatedAt: ZodDate; createdAt: ZodDate }>
>(
  zodeObject: T
) =>
  zodeObject
    .omit({ updatedAt: true, createdAt: true })
    .and(
      z.object({ updatedAt: z.coerce.date(), createdAt: z.coerce.date() })
    ) as unknown as T;
