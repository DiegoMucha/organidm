import {
  Archive,
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck,
  Car,
  CircleDollarSign,
  ClipboardList,
  Code2,
  Dumbbell,
  Folder,
  GraduationCap,
  HeartPulse,
  Home,
  Inbox,
  Laptop,
  Lightbulb,
  ListChecks,
  MapPinned,
  Music,
  Palette,
  Plane,
  ShoppingBag,
  Sparkles,
  Star,
  Target,
  Timer,
  Utensils,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type GroupIconKey =
  | "inbox"
  | "list"
  | "briefcase"
  | "home"
  | "calendar"
  | "target"
  | "timer"
  | "shopping"
  | "money"
  | "health"
  | "fitness"
  | "study"
  | "book"
  | "code"
  | "laptop"
  | "ideas"
  | "creative"
  | "music"
  | "travel"
  | "car"
  | "food"
  | "tools"
  | "archive"
  | "folder"
  | "star"
  | "sparkles"
  | "map";

export const groupIcons: Array<{ key: GroupIconKey; label: string; Icon: LucideIcon }> = [
  { key: "inbox", label: "Inbox", Icon: Inbox },
  { key: "list", label: "Tasks", Icon: ListChecks },
  { key: "briefcase", label: "Work", Icon: BriefcaseBusiness },
  { key: "home", label: "Home", Icon: Home },
  { key: "calendar", label: "Schedule", Icon: CalendarCheck },
  { key: "target", label: "Goals", Icon: Target },
  { key: "timer", label: "Time", Icon: Timer },
  { key: "shopping", label: "Shopping", Icon: ShoppingBag },
  { key: "money", label: "Money", Icon: CircleDollarSign },
  { key: "health", label: "Health", Icon: HeartPulse },
  { key: "fitness", label: "Fitness", Icon: Dumbbell },
  { key: "study", label: "Study", Icon: GraduationCap },
  { key: "book", label: "Reading", Icon: BookOpen },
  { key: "code", label: "Code", Icon: Code2 },
  { key: "laptop", label: "Computer", Icon: Laptop },
  { key: "ideas", label: "Ideas", Icon: Lightbulb },
  { key: "creative", label: "Creative", Icon: Palette },
  { key: "music", label: "Music", Icon: Music },
  { key: "travel", label: "Travel", Icon: Plane },
  { key: "car", label: "Car", Icon: Car },
  { key: "food", label: "Food", Icon: Utensils },
  { key: "tools", label: "Tools", Icon: Wrench },
  { key: "archive", label: "Archive", Icon: Archive },
  { key: "folder", label: "Folder", Icon: Folder },
  { key: "star", label: "Important", Icon: Star },
  { key: "sparkles", label: "Personal", Icon: Sparkles },
  { key: "map", label: "Places", Icon: MapPinned },
];

export function GroupIcon({ value, className = "h-4 w-4" }: { value: string; className?: string }) {
  const icon = groupIcons.find((item) => item.key === value);

  if (icon) {
    return <icon.Icon className={className} />;
  }

  return <span className="text-xs font-bold leading-none">{value.slice(0, 2).toUpperCase()}</span>;
}

export const defaultGroupIcon: GroupIconKey = "inbox";
