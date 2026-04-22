import { DEFAULT_PROFILE_ICON, ProfileIconId } from "@/constants/profileIcons";

const SIGNUP_DRAFT_KEY = "iris_signup_draft";

export interface SignupDraft {
  email: string;
  password: string;
  name: string;
  profile_icon: ProfileIconId;
  acceptedTerms: boolean;
}

const DEFAULT_DRAFT: SignupDraft = {
  email: "",
  password: "",
  name: "",
  profile_icon: DEFAULT_PROFILE_ICON,
  acceptedTerms: false,
};

export function getSignupDraft(): SignupDraft {
  const raw = sessionStorage.getItem(SIGNUP_DRAFT_KEY);
  if (!raw) return DEFAULT_DRAFT;

  try {
    const parsed = JSON.parse(raw) as Partial<SignupDraft>;
    return {
      ...DEFAULT_DRAFT,
      ...parsed,
    };
  } catch {
    return DEFAULT_DRAFT;
  }
}

export function patchSignupDraft(patch: Partial<SignupDraft>): SignupDraft {
  const merged = { ...getSignupDraft(), ...patch };
  sessionStorage.setItem(SIGNUP_DRAFT_KEY, JSON.stringify(merged));
  return merged;
}

export function clearSignupDraft() {
  sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
}
