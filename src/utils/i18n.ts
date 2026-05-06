/**
 * Polish pluralization rules for vue-i18n
 * Forms: 1 (singular) | 2-4 (few) | 5+ (many)
 *
 * Examples:
 *   1 → form 0: "1 węzeł"
 *   2-4 → form 1: "2 węzły", "3 węzły", "4 węzły"
 *   5+ → form 2: "5 węzłów", "21 węzeł" (21 ends in 1 but 21 mod 100 is 21, so handled correctly)
 */
export const polishPluralRules = (choice: number): number => {
  if (choice === 1) return 0
  if (choice % 10 >= 2 && choice % 10 <= 4 && (choice % 100 < 10 || choice % 100 >= 20)) return 1
  return 2
}
