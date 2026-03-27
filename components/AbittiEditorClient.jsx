"use client";

import React from "react";
import RichTextEditor from "rich-text-editor";

/**
 * Authentic Digabi rich-text-editor binding.
 * Configured with the Abitti baseUrl so that equation images dynamically pull
 * from the official Abitti math-render backend seamlessly!
 */
export default function AbittiEditorClient({ value, onChange, placeholder, disabled = false }) {
  // RichTextEditor manages its own internal HTML representation.
  return (
    <div className={`border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent ${disabled ? 'opacity-75 pointer-events-none' : 'border-gray-300'}`}>
      <RichTextEditor
        baseUrl="https://math-demo.abitti.fi"
        language="FI"
        onValueChange={(newValue) => {
          if (onChange) onChange(newValue);
        }}
        textAreaProps={{
          placeholder: placeholder || "Vastaa napauttamalla kaavan nappeja... (Huom. Jos ylävalikko ei näy valmiina, klikkaa tekstikenttää tuodaksesi sen esiin!)",
          className: "min-h-[200px] w-full p-4 border-none focus:outline-none",
          disabled: disabled
        }}
      />
    </div>
  );
}
