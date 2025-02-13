import React from "react";

interface TreeViewProps {
  data: any;
  level?: number;
}

export default function TreeView({ data, level = 0 }: TreeViewProps) {
  const treeStr = generateTreeString(data);
  return (
    <pre style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {treeStr}
    </pre>
  );
}

function generateTreeString(
  data: any,
  prefix: string = "",
  isLast: boolean = true,
): string {
  let output = "";

  // If this is not the root, determine the connector
  const connector = prefix ? (isLast ? "└── " : "├── ") : "";

  // If data is a primitive value or null, just print it
  if (typeof data !== "object" || data === null) {
    output += connector + String(data) + "\n";
    return output;
  }

  // If data is an array, handle each item
  if (Array.isArray(data)) {
    output += connector + "[\n";
    const newPrefix = prefix + (isLast ? "    " : "│   ");
    data.forEach((item, index) => {
      const last = index === data.length - 1;
      output += generateTreeString(item, newPrefix, last);
    });
    output += prefix + (isLast ? "    " : "│   ") + "]\n";
    return output;
  }

  // Data is an object. Iterate over its keys.
  const keys = Object.keys(data);
  keys.forEach((key, index) => {
    const last = index === keys.length - 1; // Use this for the connector
    const value = data[key];
    output += prefix + (last ? "└── " : "├── ") + key;
    if (typeof value !== "object" || value === null) {
      // For primitive values, print on the same line
      output += ": " + String(value) + "\n";
    } else {
      // For objects, print a colon and then a newline
      output += ":\n";
      // Increase the prefix: if this item is last, add spaces; otherwise, add a vertical pipe
      const newPrefix = prefix + (last ? "    " : "│   ");
      output += generateTreeString(value, newPrefix, true);
    }
  });
  return output;
}
