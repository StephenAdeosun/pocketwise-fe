export function getUserInitials(fullName: string): string {
  const names = fullName.trim().split(/\s+/).filter(Boolean);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0][0].toUpperCase();
  return names
    .filter((_, index) => index === 0 || index === names.length - 1)
    .map((name) => name[0].toUpperCase())
    .join("");
}
