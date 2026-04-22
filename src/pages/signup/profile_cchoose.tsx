import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  DEFAULT_PROFILE_ICON,
  getProfileIconById,
  PROFILE_ICON_OPTIONS,
  ProfileIconId,
} from "@/constants/profileIcons";
import { getSignupDraft, patchSignupDraft } from "@/lib/signupDraft";

export default function IrisProfileIcon() {
  const draft = useMemo(() => getSignupDraft(), []);
  const [selected, setSelected] = useState<ProfileIconId>(
    (getProfileIconById(draft.profile_icon).id as ProfileIconId) ?? DEFAULT_PROFILE_ICON
  );
  const [, navigate] = useLocation();
  const selectedAvatar = getProfileIconById(selected);

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 bg-white px-14 py-10 flex flex-col">
        <button onClick={() => navigate("/begin")} className="text-sm text-gray-500 hover:text-gray-700 w-fit">
          ← Retour
        </button>
        <div className="my-auto max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Choose Your Profile Icon</h1>
          <p className="text-gray-500 mb-8">Select an icon to represent your profile in Iris</p>
          <div className="flex gap-4 mb-8 flex-wrap">
            {PROFILE_ICON_OPTIONS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setSelected(avatar.id)}
                className="rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
                style={{
                  background: avatar.bg,
                  width: selected === avatar.id ? 72 : 64,
                  height: selected === avatar.id ? 72 : 64,
                  boxShadow:
                    selected === avatar.id
                      ? "0 0 0 3px white, 0 0 0 5px #FF5722"
                      : "none",
                  transform: selected === avatar.id ? "scale(1.08)" : "scale(1)",
                }}
              >
                {avatar.icon}
              </button>
            ))}
          </div>

          <div className="rounded-xl bg-gray-50 px-4 py-4 mb-8">
            <p className="text-xs text-gray-400 mb-3">Preview:</p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: selectedAvatar.bg }}>
                {selectedAvatar.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{draft.name || "User"}</p>
                <p className="text-xs text-gray-400">{draft.email || "user@example.com"}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              patchSignupDraft({ profile_icon: selected });
              navigate("/ConnectApp");
            }}
            className="w-full py-4 rounded-xl text-white font-semibold text-base transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(90deg, #FF5722 0%, #FF8C42 100%)" }}
          >
            Continue
          </button>
        </div>
        <div className="mt-auto">
          <div className="text-xs font-bold text-gray-700">iris</div>
          <div className="text-[10px] text-gray-400">Beta v0.1.0</div>
        </div>
      </div>
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-orange-300 via-orange-500 to-orange-600">
        <div className="text-center text-white">
          <h2 className="text-5xl font-bold mb-2">Welcome to Iris!</h2>
          <p className="text-white/80">Lets personalize your experience</p>
        </div>
      </div>
    </div>
  );
}
