export const defaultGroupColor = "#2563eb";

export const groupColors = [
  { value: "#2563eb", label: "Blue" },
  { value: "#4f46e5", label: "Indigo" },
  { value: "#7c3aed", label: "Violet" },
  { value: "#9333ea", label: "Purple" },
  { value: "#c026d3", label: "Fuchsia" },
  { value: "#db2777", label: "Pink" },
  { value: "#e11d48", label: "Rose" },
  { value: "#dc2626", label: "Red" },
  { value: "#ea580c", label: "Orange" },
  { value: "#ca8a04", label: "Amber" },
  { value: "#65a30d", label: "Lime" },
  { value: "#16a34a", label: "Green" },
  { value: "#0f766e", label: "Teal" },
  { value: "#0891b2", label: "Cyan" },
  { value: "#475569", label: "Slate" },
  { value: "#7c2d12", label: "Brown" },
];

export function normalizeGroupColor(color?: string): string {
  return color && groupColors.some((option) => option.value === color) ? color : defaultGroupColor;
}

export function readableTextColor(backgroundColor: string) {
  const red = Number.parseInt(backgroundColor.slice(1, 3), 16);
  const green = Number.parseInt(backgroundColor.slice(3, 5), 16);
  const blue = Number.parseInt(backgroundColor.slice(5, 7), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 145 ? "#111827" : "#ffffff";
}
