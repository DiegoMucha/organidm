import { CalendarDays, Edit3, Folder, Plus, Trash2 } from "lucide-react";
import type { DateFilter, TaskGroup } from "../types";
import { GroupIcon } from "../utils/groupIcons";

type SidebarProps = {
  groups: TaskGroup[];
  selectedGroupId: string;
  dateFilter: DateFilter;
  customDate: string;
  onSelectGroup: (groupId: string) => void;
  onDateFilterChange: (filter: DateFilter) => void;
  onCustomDateChange: (date: string) => void;
  onCreateGroup: () => void;
  onEditGroup: (group: TaskGroup) => void;
  onDeleteGroup: (groupId: string) => void;
};

export function Sidebar({
  groups,
  selectedGroupId,
  dateFilter,
  customDate,
  onSelectGroup,
  onDateFilterChange,
  onCustomDateChange,
  onCreateGroup,
  onEditGroup,
  onDeleteGroup,
}: SidebarProps) {
  return (
    <aside className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4 overflow-hidden lg:sticky lg:top-24">
      <section className="rounded-2xl border border-theme-border bg-theme-surface p-4 shadow-card">
        <div className="mb-3 flex items-center gap-2 text-theme-text">
          <CalendarDays size={18} className="text-theme-accent" />
          <h2 className="text-sm font-semibold uppercase text-theme-text-muted">Date filters</h2>
        </div>
        <div className="grid gap-2">
          {[
            ["all", "All dates"],
            ["today", "Today"],
            ["tomorrow", "Tomorrow"],
            ["custom", "Custom date"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onDateFilterChange(value as DateFilter)}
              className={`rounded-xl px-3 py-2 text-left text-sm transition ${
                dateFilter === value
                  ? "border border-theme-border-strong bg-gradient-to-r from-theme-accent to-theme-accent-strong text-theme-background"
                  : "border border-transparent text-theme-text-muted hover:border-theme-border hover:bg-theme-surface-raised hover:text-theme-text"
              }`}
            >
              {label}
            </button>
          ))}
          {dateFilter === "custom" ? (
            <input
              type="date"
              value={customDate}
              onChange={(event) => onCustomDateChange(event.target.value)}
              className="rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-sm text-theme-text outline-none focus:border-theme-border-strong"
            />
          ) : null}
        </div>
      </section>

      <section className="flex min-h-0 flex-col rounded-2xl border border-theme-border bg-theme-surface p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between gap-3 text-theme-text">
          <div className="flex items-center gap-2">
            <Folder size={18} className="text-theme-accent" />
            <h2 className="text-sm font-semibold uppercase text-theme-text-muted">Task lists</h2>
          </div>
          <button
            type="button"
            onClick={onCreateGroup}
            className="rounded-full border border-theme-border bg-theme-background p-2 text-theme-text-muted hover:border-theme-border-strong hover:bg-theme-accent-muted hover:text-theme-accent-strong"
            aria-label="Create task list"
          >
            <Plus size={15} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 content-start gap-2 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => onSelectGroup("all")}
            className={`rounded-xl px-3 py-2 text-left text-sm transition ${
              selectedGroupId === "all"
                ? "border border-theme-border-strong bg-gradient-to-r from-theme-accent to-theme-accent-strong text-theme-background"
                : "border border-transparent text-theme-text-muted hover:border-theme-border hover:bg-theme-surface-raised hover:text-theme-text"
            }`}
          >
            All tasks
          </button>

          {groups.map((group) => (
            <div key={group.id} className="group flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectGroup(group.id)}
                className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                  selectedGroupId === group.id
                    ? "border border-theme-border-strong bg-gradient-to-r from-theme-accent to-theme-accent-strong text-theme-background"
                    : "border border-transparent text-theme-text-muted hover:border-theme-border hover:bg-theme-surface-raised hover:text-theme-text"
                }`}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-theme-border bg-theme-background text-xs font-bold text-theme-text-muted">
                  <GroupIcon value={group.iconPlaceholder} />
                </span>
                <span className="truncate">{group.name}</span>
              </button>
              <button
                type="button"
                onClick={() => onEditGroup(group)}
                className="rounded-full p-2 text-theme-text-dim hover:bg-theme-surface-raised hover:text-theme-accent-strong"
                aria-label={`Edit ${group.name}`}
              >
                <Edit3 size={15} />
              </button>
              <button
                type="button"
                onClick={() => onDeleteGroup(group.id)}
                className="rounded-full p-2 text-theme-text-dim hover:bg-theme-surface-raised hover:text-theme-danger"
                aria-label={`Delete ${group.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

      </section>
    </aside>
  );
}
