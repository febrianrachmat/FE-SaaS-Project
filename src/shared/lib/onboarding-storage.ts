/** Lightweight localStorage helpers for onboarding progress. */

export function onboardingDismissKey(slug: string) {
  return `flowpilot:onboarding-dismissed:${slug}`;
}

export function onboardingFlagKey(slug: string, flag: string) {
  return `flowpilot:onboarding:${slug}:${flag}`;
}

export function nextStepsDismissKey(slug: string, projectSlug: string) {
  return `flowpilot:next-steps-dismissed:${slug}:${projectSlug}`;
}

export function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function writeFlag(key: string): void {
  try {
    localStorage.setItem(key, "1");
  } catch {
    // ignore quota / private mode
  }
}
