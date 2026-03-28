export function pricePageQueryKey(citySlug: string) {
  return ["price-page", citySlug] as const;
}

export const pricePageQueryRoot = ["price-page"] as const;

export const trainingPageQueryKey = ["training-page"] as const;

export const trainingPageQueryRoot = ["training-page"] as const;
