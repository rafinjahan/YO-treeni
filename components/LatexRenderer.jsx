"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import React from "react";

/**
 * LatexRenderer accepts a text prop and parses out content inside $...$ or $$...$$
 */
export default function LatexRenderer({ text = "" }) {
  // Very simplistic regex for splitting text by $$ or $
  // The first group (mathBlock) is block math $$, the second (mathInline) is inline math $.
  // We use [\s\S] to match across multiple lines instead of a dot.
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          return (
            <div key={index} className="my-4 text-center">
              <BlockMath math={part.slice(2, -2)} />
            </div>
          );
        } else if (part.startsWith("$") && part.endsWith("$")) {
          return <InlineMath key={index} math={part.slice(1, -1)} />;
        }
        // Split string into lines to keep standard paragraph formatting
        return (
          <span key={index}>
            {part.split("\n").map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < part.split("\n").length - 1 && <br />}
              </React.Fragment>
            ))}
          </span>
        );
      })}
    </span>
  );
}
