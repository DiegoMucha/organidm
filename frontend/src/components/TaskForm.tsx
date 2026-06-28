import { Check, Plus } from "lucide-react";
import type { FormEvent } from "react";
import type { Task, TaskGroup } from "../types";
import { toDateTimeInputValue } from "../utils/date";

export type TaskFormValues = {
  name: string;
  description: string;
  taskGroupId: string;
  dueDate: string;
  priority: number;
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
    const values: TaskFormValues = {
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      taskGroupId: String(formData.get("taskGroupId") ?? ""),
      dueDate: String(formData.get("dueDate") ?? ""),
      priority: Number(formData.get("priority") ?? 3),
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
            <input
              name="dueDate"
              type="datetime-local"
              defaultValue={toDateTimeInputValue(editingTask?.dueDate) || initialDueDate}
              className="rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-theme-text outline-none transition focus:border-theme-border-strong"
            />
          </label>
        </div>

        <label className="grid gap-1 text-sm font-medium text-theme-text-muted">
          Priority
          <select
            name="priority"
            defaultValue={editingTask?.priority ?? 3}
            className="rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-theme-text outline-none transition focus:border-theme-border-strong"
          >
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
