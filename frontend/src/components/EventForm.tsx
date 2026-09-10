import { Check, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { CalendarEvent, EventRepeatType, TaskGroup } from "../types";

export type EventFormValues = {
  name: string;
  description: string;
  taskGroupId: string;
  date: string;
  startTime: string;
  endTime: string;
  repeatType: EventRepeatType;
  repeatDays: number[];
};

const weekdays = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

type EventFormProps = {
  groups: TaskGroup[];
  editingEvent?: CalendarEvent | null;
  initialValues?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void;
};

export function EventForm({ groups, editingEvent, initialValues, onSubmit }: EventFormProps) {
  const [repeatType, setRepeatType] = useState<EventRepeatType>(
    editingEvent?.repeatType ?? initialValues?.repeatType ?? "once",
  );

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
      repeatType,
      repeatDays: repeatType === "custom" ? formData.getAll("repeatDays").map(Number) : [],
    };

    if (
      !values.name ||
      !values.date ||
      !values.startTime ||
      !values.endTime ||
      values.endTime <= values.startTime ||
      (values.repeatType === "custom" && values.repeatDays.length === 0)
    ) {
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

      <label className="grid gap-1 text-sm font-medium text-theme-text-muted">
        Repetition
        <select
          name="repeatType"
          value={repeatType}
          onChange={(event) => setRepeatType(event.target.value as EventRepeatType)}
          className="rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-theme-text outline-none transition focus:border-theme-border-strong"
        >
          <option value="once">Once</option>
          <option value="daily">Daily</option>
          <option value="weekdays">Weekdays</option>
          <option value="custom">Custom</option>
        </select>
      </label>

      {repeatType === "custom" ? (
        <fieldset className="rounded-xl border border-theme-border bg-theme-background p-3">
          <legend className="px-1 text-sm font-medium text-theme-text-muted">Repeat on</legend>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {weekdays.map((weekday) => (
              <label
                key={weekday.value}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-theme-border bg-theme-surface px-2 py-2 text-xs text-theme-text-muted transition hover:border-theme-border-strong hover:text-theme-text"
              >
                <input
                  type="checkbox"
                  name="repeatDays"
                  value={weekday.value}
                  defaultChecked={editingEvent?.repeatDays.includes(weekday.value)}
                  className="accent-theme-accent"
                />
                {weekday.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

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
