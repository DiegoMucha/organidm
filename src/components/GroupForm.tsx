import { Check, Plus } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import type { TaskGroup } from "../types";
import { defaultGroupIcon, groupIcons, type GroupIconKey } from "../utils/groupIcons";

type GroupFormProps = {
  editingGroup?: TaskGroup | null;
  onSubmit: (name: string, iconPlaceholder: string) => void;
};

export function GroupForm({ editingGroup, onSubmit }: GroupFormProps) {
  const initialIcon = groupIcons.some((icon) => icon.key === editingGroup?.iconPlaceholder)
    ? (editingGroup?.iconPlaceholder as GroupIconKey)
    : defaultGroupIcon;
  const [selectedIcon, setSelectedIcon] = useState<GroupIconKey>(initialIcon);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();

    if (!name) {
      return;
    }

    onSubmit(name, selectedIcon);
  }

  return (
    <form key={editingGroup?.id ?? "new-group"} onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-1 text-sm font-medium text-theme-text-muted">
        List name
        <input
          name="name"
          defaultValue={editingGroup?.name}
          placeholder="Personal, Work, Errands"
          className="rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-theme-text outline-none focus:border-theme-border-strong"
        />
      </label>

      <section className="grid gap-2">
        <div>
          <h3 className="text-sm font-medium text-theme-text-muted">Icon</h3>
          <p className="text-xs text-theme-text-dim">Choose a symbol for this task list.</p>
        </div>

        <div className="grid max-h-56 grid-cols-6 gap-2 overflow-y-auto rounded-2xl border border-theme-border bg-theme-background p-2 sm:grid-cols-9">
          {groupIcons.map(({ key, label, Icon }) => {
            const selected = selectedIcon === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedIcon(key)}
                className={`grid aspect-square place-items-center rounded-xl border transition ${
                  selected
                    ? "border-theme-border-strong bg-gradient-to-r from-theme-accent to-theme-accent-strong text-theme-background"
                    : "border-theme-border bg-theme-surface text-theme-text-muted hover:border-theme-border-strong hover:text-theme-accent-strong"
                }`}
                aria-label={label}
                title={label}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>
      </section>

      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-theme-border-strong bg-gradient-to-r from-theme-accent to-theme-accent-strong px-4 py-2 font-semibold text-theme-background shadow-subtle transition hover:brightness-110"
      >
        {editingGroup ? <Check size={18} /> : <Plus size={18} />}
        {editingGroup ? "Save list" : "Create list"}
      </button>
    </form>
  );
}
