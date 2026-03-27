"use client";

import dynamic from "next/dynamic";

// Dynamically import the real editor to skip SSR, ensuring window/document are defined
// and protecting Next.js from Digabi's global variables and jquery initialization.
const AbittiEditorClient = dynamic(() => import("./AbittiEditorClient"), {
  ssr: false,
  loading: () => (
    <div className="p-4 border border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center min-h-[200px] text-gray-400">
      Ladataan alkuperäistä Abitti-editoria...
    </div>
  ),
});

export default function AbittiEditor(props) {
  return <AbittiEditorClient {...props} />;
}
