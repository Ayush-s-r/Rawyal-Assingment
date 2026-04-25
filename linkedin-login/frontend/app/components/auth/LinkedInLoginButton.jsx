"use client";

import { getLinkedInAuthURL } from "@/app/utils/linkedinAuth";

export default function LinkedInLoginButton() {
  return (
    <button
      onClick={() => (window.location.href = getLinkedInAuthURL())}
      className="w-full flex items-center justify-center gap-2 bg-[#0077b5] text-white py-2 rounded-lg hover:bg-[#005582] transition font-medium shadow-md"
    >
      Continue with LinkedIn
    </button>
  );
}