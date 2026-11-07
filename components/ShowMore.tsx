"use client";

import { useState } from "react";

interface ShowMoreProps {
  text: string;
  maxLength?: number;
}

export function ShowMore({
  text,
  maxLength = 180,
}: ShowMoreProps) {
  const [expanded, setExpanded] = useState(false);

  const shouldTruncate = text.length > maxLength;

  const displayedText =
    expanded || !shouldTruncate
      ? text
      : `${text.slice(0, maxLength)}...`;

  return (
    <div>
      <p className="font-light md:text-md">{displayedText}</p>

      {shouldTruncate && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm font-medium text-primary hover:underline"
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}