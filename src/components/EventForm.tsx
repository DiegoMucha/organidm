import { Check, Plus } from "lucide-react";
import type { FormEvent } from "react";
import type { CalendarEvent, TaskGroup } from "../types";

export type EventFormValues = {
  name: string;
  description: string;
  taskGroupId: string;
  date: string;
  startTime: string;
  endTime: string;
};

type EventFormProps = {
  groups: TaskGroup[];
  editingEvent?: CalendarEvent | null;
  initialValues?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void;
};

export function EventForm({ groups, editingEvent, initialValues, onSubmit }: EventFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const values: EventFormValues = {
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      taskGroupId: String(formData.get("taskGroupId") ?? ""),
      date: String(formData.get("date") ?? ""),
      startTime: String(formData.get("startTime") ?? ""),
      endTime: String(formData.get("endTime") ?? ""),
    };

    if (!values.name || !values.date || !values.startTime || !values.endTime || values.endTime <= values.startTime) {
      return;
    }

    onSubmit(values);
    event.currentTarget.reset();
  }

  return (
    <form key={editingEvent?.id ?? "new-event"} onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-1 text-sm font-medium text-theme-text-muted">
        Event name
        <input
          name="name"
          defaultValue={editingEvent?.name ?? initialValues?.name}
          placeholder="What is happening?"
          required
          className="rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-theme-text outline-none transition focus:border-theme-border-strong"
        />
      </label>

      <label className="grid gap-1 text-sm font-medium text-theme-text-muted">
        Description
        <textarea
          name="description"
          defaultValue={editingEvent?.description ?? initialValues?.description}
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
            defaultValue={editingEvent?.taskGroupId ?? initialValues?.taskGroupId ?? ""}
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
          Date
          <input
            name="date"
            type="date"
            defaultValue={editingEvent?.date ?? initialValues?.date}
            required
            className="rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-theme-text outline-none transition focus:border-theme-border-strong"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-theme-text-muted">
          Start time
          <input
            name="startTime"
            type="time"
            defaultValue={editingEvent?.startTime ?? initialValues?.startTime}
            required
            className="rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-theme-text outline-none transition focus:border-theme-border-strong"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-theme-text-muted">
          End time
          <input
            name="endTime"
            type="time"
            defaultValue={editingEvent?.endTime ?? initialValues?.endTime}
            required
            className="rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-theme-text outline-none transition focus:border-theme-border-strong"
          />
        </label>
      </div>

      <button
        type="submit"
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl border border-theme-border-strong bg-gradient-to-r from-theme-accent to-theme-accent-strong px-4 py-2 font-semibold text-theme-background shadow-subtle transition hover:brightness-110"
      >
        {editingEvent ? <Check size={18} /> : <Plus size={18} />}
        {editingEvent ? "Save event" : "New event"}
      </button>
    </form>
  );
}
