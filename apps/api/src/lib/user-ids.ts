export const MASTER_USER_ID = "06CN9Z2T33E70TH22BSCQ3ZP";

const LEGACY_TO_CANONICAL_MAP = new Map<string, string>([
  ["06CMPYXAYCN0R78VV438VX37", MASTER_USER_ID],
]);

export function getCanonicalUserId(userId: string): string {
  if (!userId) return MASTER_USER_ID;
  if (userId === MASTER_USER_ID) return MASTER_USER_ID;
  const mapped = LEGACY_TO_CANONICAL_MAP.get(userId);
  if (mapped) return mapped;
  return MASTER_USER_ID;
}

export function isLegacyUserId(userId: string): boolean {
  return userId !== MASTER_USER_ID;
}

export function getUserIdVariants(userId: string): string[] {
  const canonical = getCanonicalUserId(userId);
  const variants = new Set<string>([canonical]);
  if (userId) variants.add(userId);
  for (const [legacy, target] of LEGACY_TO_CANONICAL_MAP.entries()) {
    if (target === canonical) {
      variants.add(legacy);
    }
  }
  return Array.from(variants);
}
