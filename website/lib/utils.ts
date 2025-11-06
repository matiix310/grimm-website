import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fixApiDate = <T extends z.ZodObject>(
  zodeObject: T,
  keys = ["createdAt", "updatedAt"]
) =>
  zodeObject
    .omit(Object.fromEntries(keys.map((k) => [k, true])))
    .and(
      z.object(Object.fromEntries(keys.map((k) => [k, z.coerce.date(k)])))
    ) as unknown as T;
