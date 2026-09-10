import { Check, Plus } from "lucide-react";
import type { FormEvent } from "react";
import type { Task, TaskGroup } from "../types";
import { toDateInputValue, toTimeInputValue } from "../utils/date";

export type TaskFormValues = {
  name: string;
  description?: string;
  taskGroupId?: string;
  dueDate?: string;
  priority?: number;
};

type TaskFormProps = {
  groups: TaskGroup[];
  editingTask?: Task | null;
  initialGroupId?: string;
  initialDueDate?: string;
  onSubmit: (values: TaskFormValues) => void;
};

export function TaskForm({
  groups,
  editingTask,
  initialGroupId = "",
  initialDueDate = "",
  onSubmit,
}: TaskFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const description = String(formData.get("description") ?? "").trim();
    const taskGroupId = String(formData.get("taskGroupId") ?? "");
    const dueDate = String(formData.get("dueDate") ?? "");
    const dueTime = String(formData.get("dueTime") ?? "");
    const priority = String(formData.get("priority") ?? "");
    const values: TaskFormValues = {
      name: String(formData.get("name") ?? "").trim(),
      description: description || undefined,
      taskGroupId: taskGroupId || undefined,
      dueDate: dueDate ? `${dueDate}T${dueTime || "23:59"}:00` : undefined,
      priority: priority ? Number(priority) : undefined,
    };

    if (!values.name) {
      return;
    }

    onSubmit(values);
    event.currentTarget.reset();
  }

  return (
    <form
      key={editingTask?.id ?? "new-task"}
      onSubmit={handleSubmit}
      className="grid gap-4"
    >
      <div className="grid gap-4">
        <label className="grid gap-1 text-sm font-medium text-theme-text-muted">
          Task name
          <input
            name="name"
            defaultValue={editingTask?.name}
            placeholder="What needs attention?"
            required
            className="rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-theme-text outline-none transition focus:border-theme-border-strong"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-theme-text-muted">
          Description
          <textarea
            name="description"
            defaultValue={editingTask?.description}
            placeholder="Optional details"
            rows={3}
            className="resize-none rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-theme-text outline-none transition focus:border-theme-border-strong"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-theme-text-muted">
            Group
            <select
              name="taskGroupId"
              defaultValue={editingTask?.taskGroupId ?? initialGroupId}
              className="rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-theme-text outline-none transition focus:border-theme-border-strong"
            >
              <option value="">No group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-medium text-theme-text-muted">
            Due date
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(6.5rem,0.7fr)] overflow-hidden rounded-xl border border-theme-border bg-theme-background transition focus-within:border-theme-border-strong">
              <input
                name="dueDate"
                type="date"
                defaultValue={toDateInputValue(editingTask?.dueDate) || toDateInputValue(initialDueDate)}
                className="min-w-0 bg-transparent px-3 py-2 text-theme-text outline-none"
              />
              <input
                name="dueTime"
                type="time"
                defaultValue={toTimeInputValue(editingTask?.dueDate) || toTimeInputValue(initialDueDate)}
                aria-label="Due time (optional; defaults to 11:59 PM)"
                title="Optional; defaults to 11:59 PM"
                className="min-w-0 border-l border-theme-border bg-transparent px-3 py-2 text-theme-text outline-none"
              />
            </div>
          </label>
        </div>

        <label className="grid gap-1 text-sm font-medium text-theme-text-muted">
          Priority
          <select
            name="priority"
            defaultValue={editingTask?.priority ?? ""}
            className="rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-theme-text outline-none transition focus:border-theme-border-strong"
          >
            <option value="">No priority</option>
            {[1, 2, 3, 4, 5].map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl border border-theme-border-strong bg-gradient-to-r from-theme-accent to-theme-accent-strong px-4 py-2 font-semibold text-theme-background shadow-subtle transition hover:brightness-110"
        >
          {editingTask ? <Check size={18} /> : <Plus size={18} />}
          {editingTask ? "Save task" : "New task"}
        </button>
      </div>
    </form>
  );
}
