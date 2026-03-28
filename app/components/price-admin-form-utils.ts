"use client";

import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export type ApiFieldErrors = Record<string, string[] | undefined>;

export const drawerCloseDelayMs = 220;

export class ApiMutationError extends Error {
  fieldErrors?: ApiFieldErrors;

  constructor(message: string, fieldErrors?: ApiFieldErrors) {
    super(message);
    this.name = "ApiMutationError";
    this.fieldErrors = fieldErrors;
  }
}

export async function requestJson(
  input: string,
  init: RequestInit & { body?: BodyInit | null },
) {
  const response = await fetch(input, init);
  const payload = (await response.json().catch(() => null)) as
    | { message?: string; fieldErrors?: ApiFieldErrors; slug?: string }
    | null;

  if (!response.ok) {
    throw new ApiMutationError(
      payload?.message ?? "Не удалось обработать запрос.",
      payload?.fieldErrors,
    );
  }

  return payload;
}

export function applyFieldErrors<TFieldValues extends FieldValues>(
  fieldErrors: ApiFieldErrors | undefined,
  setError: UseFormSetError<TFieldValues>,
) {
  if (!fieldErrors) return;

  for (const [fieldName, errors] of Object.entries(fieldErrors)) {
    if (!errors?.length) continue;

    setError(fieldName as Path<TFieldValues>, {
      message: errors[0],
    });
  }
}

export function normalizeNullableNumber(value: string) {
  if (!value.trim()) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
