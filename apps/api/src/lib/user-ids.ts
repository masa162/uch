const LEGACY_TO_CANONICAL_MAP = new Map<string, string>([
  ["06CMPYXAYCN0R78VV438VX37", "06CN9Z2T33E70TH22BSCQ3ZP"],
]);

export const CANONICAL_USER_IDS = new Set<string>([
  ...LEGACY_TO_CANONICAL_MAP.values(),
]);

export function getCanonicalUserId(userId: string): string {
  if (!userId) return userId;
  const mapped = LEGACY_TO_CANONICAL_MAP.get(userId);
  return mapped ?? userId;
}

export function isLegacyUserId(userId: string): boolean {
  return LEGACY_TO_CANONICAL_MAP.has(userId);
}

export function getUserIdVariants(userId: string): string[] {
  const canonical = getCanonicalUserId(userId);
  const variants = new Set<string>([canonical]);
  for (const [legacy, target] of LEGACY_TO_CANONICAL_MAP.entries()) {
    if (target === canonical) {
      variants.add(legacy);
    }
  }
  return Array.from(variants);
}
