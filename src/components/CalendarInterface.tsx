import { CalendarDays, ChevronLeft, ChevronRight, Circle, Clock, Edit3, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CalendarEvent, Task, TaskGroup } from "../types";
import { datePart } from "../utils/date";
import { GroupIcon } from "../utils/groupIcons";

type CalendarMode = "day" | "week" | "month";

type CalendarInterfaceProps = {
  tasks: Task[];
  events: CalendarEvent[];
  groups: TaskGroup[];
  onCreateTaskAt: (dueDate: string) => void;
  onCreateEvent: (date: string, startTime: string, endTime: string) => void;
  onEditTask: (task: Task) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteEvent: (eventId: string) => void;
};

export function CalendarInterface({
  tasks,
  events,
  groups,
  onCreateTaskAt,
  onCreateEvent,
  onEditTask,
  onEditEvent,
  onDeleteTask,
  onDeleteEvent,
}: CalendarInterfaceProps) {
  const [mode, setMode] = useState<CalendarMode>("week");
  const [anchorDate, setAnchorDate] = useState(() => startOfDay(new Date()));
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(() => groups.map((group) => group.id));
  const [includeNoGroup, setIncludeNoGroup] = useState(true);
  const [taskMenu, setTaskMenu] = useState<{
    x: number;
    y: number;
    task: Task;
  } | null>(null);
  const [eventMenu, setEventMenu] = useState<{
    x: number;
    y: number;
    event: CalendarEvent;
  } | null>(null);

  const visibleTasks = useMemo(() => {
    return tasks
      .filter((task) => Boolean(task.dueDate))
      .filter((task) => {
        if (!task.taskGroupId) {
          return includeNoGroup;
        }

        return selectedGroupIds.includes(task.taskGroupId);
      });
  }, [includeNoGroup, selectedGroupIds, tasks]);

  const visibleEvents = useMemo(() => {
    return events.filter((event) => {
      if (!event.taskGroupId) {
        return includeNoGroup;
      }

      return selectedGroupIds.includes(event.taskGroupId);
    });
  }, [events, includeNoGroup, selectedGroupIds]);

  function toggleGroup(groupId: string) {
    setSelectedGroupIds((currentIds) =>
      currentIds.includes(groupId)
        ? currentIds.filter((id) => id !== groupId)
        : [...currentIds, groupId],
    );
  }

  function selectAllGroups() {
    setSelectedGroupIds(groups.map((group) => group.id));
    setIncludeNoGroup(true);
  }

  function clearGroups() {
    setSelectedGroupIds([]);
    setIncludeNoGroup(false);
  }

  function moveAnchor(direction: -1 | 1) {
    setAnchorDate((currentDate) => {
      const nextDate = new Date(currentDate);

      if (mode === "day") {
        nextDate.setDate(nextDate.getDate() + direction);
      }

      if (mode === "week") {
        nextDate.setDate(nextDate.getDate() + direction * 7);
      }

      if (mode === "month") {
        nextDate.setMonth(nextDate.getMonth() + direction);
      }

      return startOfDay(nextDate);
    });
  }

  function openTaskMenu(task: Task, x: number, y: number) {
    setTaskMenu({ task, x, y });
    setEventMenu(null);
  }

  function openEventMenu(event: CalendarEvent, x: number, y: number) {
    setEventMenu({ event, x, y });
    setTaskMenu(null);
  }

  return (
    <div
      className="grid h-[calc(100vh-89px)] w-full items-stretch gap-5 overflow-hidden px-4 py-6 sm:px-6 md:h-[calc(100vh-73px)] lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8"
      onClick={() => {
        setTaskMenu(null);
        setEventMenu(null);
      }}
    >
      <aside className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4 overflow-hidden">
        <section className="rounded-2xl border border-theme-border bg-theme-surface p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays size={18} className="text-theme-accent-strong" />
            <h2 className="text-sm font-semibold uppercase text-theme-text-muted">Calendar view</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["day", "Daily"],
              ["week", "Weekly"],
              ["month", "Monthly"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value as CalendarMode)}
                className={`rounded-xl border px-3 py-2 text-sm transition ${
                  mode === value
                    ? "border-theme-border-strong bg-gradient-to-r from-theme-accent to-theme-accent-strong text-theme-background"
                    : "border-theme-border bg-theme-background text-theme-text-muted hover:bg-theme-surface-raised hover:text-theme-text"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="flex min-h-0 flex-col rounded-2xl border border-theme-border bg-theme-surface p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase text-theme-text-muted">Visible task lists</h2>
            <div className="flex gap-2">
              <button type="button" onClick={selectAllGroups} className="text-xs text-theme-accent-strong">
                All
              </button>
              <button type="button" onClick={clearGroups} className="text-xs text-theme-text-muted">
                None
              </button>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 content-start gap-2 overflow-y-auto pr-1">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-sm text-theme-text-muted hover:bg-theme-surface-raised">
              <input
                type="checkbox"
                checked={includeNoGroup}
                onChange={() => setIncludeNoGroup((current) => !current)}
                className="accent-theme-accent"
              />
              No group
            </label>

            {groups.map((group) => (
              <label
                key={group.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-sm text-theme-text-muted hover:bg-theme-surface-raised"
              >
                <input
                  type="checkbox"
                  checked={selectedGroupIds.includes(group.id)}
                  onChange={() => toggleGroup(group.id)}
                  className="accent-theme-accent"
                />
                <span className="grid h-6 w-6 place-items-center rounded-full border border-theme-border text-xs font-semibold">
                  <GroupIcon value={group.iconPlaceholder} />
                </span>
                <span className="truncate">{group.name}</span>
              </label>
            ))}
          </div>
        </section>
      </aside>

      <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-theme-border bg-theme-surface p-4 shadow-card sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-theme-text">Calendar</h2>
            <p className="text-sm text-theme-text-muted">{calendarTitle(anchorDate, mode)}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => moveAnchor(-1)}
              className="rounded-full border border-theme-border bg-theme-background p-2 text-theme-text-muted hover:border-theme-border-strong hover:text-theme-accent-strong"
              aria-label="Previous calendar period"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setAnchorDate(startOfDay(new Date()))}
              className="rounded-full border border-theme-border bg-theme-background px-4 py-2 text-sm text-theme-text-muted hover:border-theme-border-strong hover:text-theme-accent-strong"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => moveAnchor(1)}
              className="rounded-full border border-theme-border bg-theme-background p-2 text-theme-text-muted hover:border-theme-border-strong hover:text-theme-accent-strong"
              aria-label="Next calendar period"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto pr-1">
          {mode === "day" ? (
            <DailyCalendar
              date={anchorDate}
              tasks={visibleTasks}
              events={visibleEvents}
              groups={groups}
              onCreateTaskAt={onCreateTaskAt}
              onCreateEvent={onCreateEvent}
              onTaskMenu={openTaskMenu}
              onEventMenu={openEventMenu}
            />
          ) : null}
          {mode === "week" ? (
            <WeeklyCalendar
              date={anchorDate}
              tasks={visibleTasks}
              events={visibleEvents}
              groups={groups}
              onCreateTaskAt={onCreateTaskAt}
              onCreateEvent={onCreateEvent}
              onTaskMenu={openTaskMenu}
              onEventMenu={openEventMenu}
            />
          ) : null}
          {mode === "month" ? (
            <MonthlyCalendar date={anchorDate} tasks={visibleTasks} groups={groups} onTaskMenu={openTaskMenu} />
          ) : null}
        </div>
      </section>

      {taskMenu ? (
        <div
          className="fixed z-30 min-w-40 rounded-xl border border-theme-border bg-theme-surface-raised p-1 shadow-card"
          style={{ left: taskMenu.x, top: taskMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              onEditTask(taskMenu.task);
              setTaskMenu(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-theme-text hover:bg-theme-surface hover:text-theme-accent-strong"
          >
            <Edit3 size={16} />
            Edit task
          </button>
          <button
            type="button"
            onClick={() => {
              onDeleteTask(taskMenu.task.id);
              setTaskMenu(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-theme-danger hover:bg-theme-surface"
          >
            <Trash2 size={16} />
            Delete task
          </button>
        </div>
      ) : null}

      {eventMenu ? (
        <div
          className="fixed z-30 min-w-40 rounded-xl border border-theme-border bg-theme-surface-raised p-1 shadow-card"
          style={{ left: eventMenu.x, top: eventMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              onEditEvent(eventMenu.event);
              setEventMenu(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-theme-text hover:bg-theme-surface hover:text-theme-accent-strong"
          >
            <Edit3 size={16} />
            Edit event
          </button>
          <button
            type="button"
            onClick={() => {
              onDeleteEvent(eventMenu.event.id);
              setEventMenu(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-theme-danger hover:bg-theme-surface"
          >
            <Trash2 size={16} />
            Delete event
          </button>
        </div>
      ) : null}
    </div>
  );
}

function DailyCalendar({
  date,
  tasks,
  events,
  groups,
  onCreateTaskAt,
  onCreateEvent,
  onTaskMenu,
  onEventMenu,
}: {
  date: Date;
  tasks: Task[];
  events: CalendarEvent[];
  groups: TaskGroup[];
  onCreateTaskAt: (dueDate: string) => void;
  onCreateEvent: (date: string, startTime: string, endTime: string) => void;
  onTaskMenu: (task: Task, x: number, y: number) => void;
  onEventMenu: (event: CalendarEvent, x: number, y: number) => void;
}) {
  const dayKey = toDateKey(date);
  const hours = Array.from({ length: 24 }, (_, index) => index);
  const eightAmRef = useRef<HTMLDivElement | null>(null);
  const [selection, setSelection] = useState<{
    dayKey: string;
    startHour: number;
    endHour: number;
  } | null>(null);
  const [createChoice, setCreateChoice] = useState<{
    x: number;
    y: number;
    dayKey: string;
    startHour: number;
    endHour: number;
  } | null>(null);

  useEffect(() => {
    eightAmRef.current?.scrollIntoView({ block: "start" });
  }, [date]);

  function startSelection(hour: number) {
    setCreateChoice(null);
    setSelection({
      dayKey,
      startHour: hour,
      endHour: hour,
    });
  }

  function extendSelection(hour: number) {
    setSelection((currentSelection) => {
      if (!currentSelection || currentSelection.dayKey !== dayKey) {
        return currentSelection;
      }

      return {
        ...currentSelection,
        endHour: hour,
      };
    });
  }

  function finishSelection(hour: number, x: number, y: number) {
    if (!selection) {
      return;
    }

    const startHour = Math.min(selection.startHour, hour);
    const endHour = Math.max(selection.startHour, hour) + 1;

    if (endHour - startHour >= 2) {
      onCreateEvent(dayKey, toTimeValue(startHour), toTimeValue(endHour));
    } else {
      setCreateChoice({ x, y, dayKey, startHour, endHour });
    }

    setSelection(null);
  }

  function isSelected(hour: number) {
    if (!selection || selection.dayKey !== dayKey) {
      return false;
    }

    const start = Math.min(selection.startHour, selection.endHour);
    const end = Math.max(selection.startHour, selection.endHour);
    return hour >= start && hour <= end;
  }

  return (
    <div
      className="min-w-[720px] select-none rounded-2xl border border-theme-border bg-theme-background"
      onMouseLeave={() => setSelection(null)}
    >
      {hours.map((hour) => {
        const hourTasks = tasks.filter((task) => datePart(task.dueDate) === dayKey && dueHour(task.dueDate) === hour);
        const startingEvents = events.filter((event) => event.date === dayKey && eventHour(event.startTime) === hour);
        const selected = isSelected(hour);

        return (
          <div key={hour} className="grid min-h-20 grid-cols-[92px_minmax(0,1fr)] border-b border-theme-border last:border-b-0">
            <div
              ref={hour === 8 ? eightAmRef : undefined}
              className="border-r border-theme-border px-3 py-3 text-xs text-theme-text-dim"
            >
              {formatHour(hour)}
            </div>
            <div
              onMouseDown={() => startSelection(hour)}
              onMouseEnter={(event) => {
                if (event.buttons === 1) {
                  extendSelection(hour);
                }
              }}
              onMouseUp={(event) => finishSelection(hour, event.clientX, event.clientY)}
              className={`relative min-h-20 cursor-crosshair overflow-visible p-2 transition ${
                selected ? "bg-theme-accent-muted" : "hover:bg-theme-surface-raised"
              }`}
            >
              {startingEvents.map((event) => (
                <CalendarEventPill
                  key={event.id}
                  event={event}
                  groups={groups}
                  durationHours={eventDurationHours(event)}
                  hourHeightRem={5}
                  onEventMenu={onEventMenu}
                />
              ))}
              <div className="relative z-20 grid content-start gap-2">
                {hourTasks.map((task) => (
                  <CalendarTaskPill key={task.id} task={task} groups={groups} onTaskMenu={onTaskMenu} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
      {createChoice ? (
        <CreateSelectionMenu
          choice={createChoice}
          onCreateTask={() => {
            onCreateTaskAt(`${createChoice.dayKey}T${toTimeValue(createChoice.startHour)}`);
            setCreateChoice(null);
          }}
          onCreateEvent={() => {
            onCreateEvent(createChoice.dayKey, toTimeValue(createChoice.startHour), toTimeValue(createChoice.endHour));
            setCreateChoice(null);
          }}
          onClose={() => setCreateChoice(null)}
        />
      ) : null}
    </div>
  );
}

function WeeklyCalendar({
  date,
  tasks,
  events,
  groups,
  onCreateTaskAt,
  onCreateEvent,
  onTaskMenu,
  onEventMenu,
}: {
  date: Date;
  tasks: Task[];
  events: CalendarEvent[];
  groups: TaskGroup[];
  onCreateTaskAt: (dueDate: string) => void;
  onCreateEvent: (date: string, startTime: string, endTime: string) => void;
  onTaskMenu: (task: Task, x: number, y: number) => void;
  onEventMenu: (event: CalendarEvent, x: number, y: number) => void;
}) {
  const days = daysForWeek(date);
  const hours = Array.from({ length: 24 }, (_, index) => index);
  const eightAmRef = useRef<HTMLDivElement | null>(null);
  const [selection, setSelection] = useState<{
    dayKey: string;
    startHour: number;
    endHour: number;
  } | null>(null);
  const [createChoice, setCreateChoice] = useState<{
    x: number;
    y: number;
    dayKey: string;
    startHour: number;
    endHour: number;
  } | null>(null);

  useEffect(() => {
    eightAmRef.current?.scrollIntoView({ block: "start" });
  }, [date]);

  function startSelection(day: Date, hour: number) {
    setCreateChoice(null);
    setSelection({
      dayKey: toDateKey(day),
      startHour: hour,
      endHour: hour,
    });
  }

  function extendSelection(day: Date, hour: number) {
    setSelection((currentSelection) => {
      if (!currentSelection || currentSelection.dayKey !== toDateKey(day)) {
        return currentSelection;
      }

      return {
        ...currentSelection,
        endHour: hour,
      };
    });
  }

  function finishSelection(day: Date, hour: number, x: number, y: number) {
    if (!selection) {
      return;
    }

    const dayKey = toDateKey(day);
    const startHour = Math.min(selection.startHour, hour);
    const endHour = Math.max(selection.startHour, hour) + 1;

    if (endHour - startHour >= 2) {
      onCreateEvent(dayKey, toTimeValue(startHour), toTimeValue(endHour));
    } else {
      setCreateChoice({ x, y, dayKey, startHour, endHour });
    }

    setSelection(null);
  }

  function isSelected(day: Date, hour: number) {
    if (!selection || selection.dayKey !== toDateKey(day)) {
      return false;
    }

    const start = Math.min(selection.startHour, selection.endHour);
    const end = Math.max(selection.startHour, selection.endHour);
    return hour >= start && hour <= end;
  }

  return (
    <div
      className="min-w-[980px] select-none rounded-2xl border border-theme-border bg-theme-background"
      onMouseLeave={() => setSelection(null)}
    >
      <div className="sticky top-0 z-30 grid grid-cols-[76px_repeat(7,minmax(128px,1fr))] border-b border-theme-border bg-theme-surface-muted shadow-subtle">
        <div className="border-r border-theme-border px-3 py-3 text-xs uppercase text-theme-text-dim">Hour</div>
        {days.map((day) => (
          <div key={toDateKey(day)} className="border-r border-theme-border px-3 py-3 last:border-r-0">
            <p className="text-xs uppercase text-theme-text-dim">{weekdayLabel(day)}</p>
            <p className="text-lg font-semibold text-theme-text">{day.getDate()}</p>
          </div>
        ))}
      </div>

      <div className="grid auto-rows-min grid-cols-[76px_repeat(7,minmax(128px,1fr))]">
        {hours.map((hour) => (
          <div key={hour} className="contents">
            <div
              ref={hour === 8 ? eightAmRef : undefined}
              className="h-full min-h-12 scroll-mt-20 border-b border-r border-theme-border px-3 py-2 text-xs text-theme-text-dim"
            >
              {formatHour(hour)}
            </div>
            {days.map((day) => {
              const dayKey = toDateKey(day);
              const hourTasks = tasks.filter((task) => datePart(task.dueDate) === dayKey && dueHour(task.dueDate) === hour);
              const startingEvents = events.filter((event) => event.date === dayKey && eventHour(event.startTime) === hour);
              const selected = isSelected(day, hour);

              return (
                <div
                  key={`${dayKey}-${hour}`}
                  onMouseDown={() => startSelection(day, hour)}
                  onMouseEnter={(event) => {
                    if (event.buttons === 1) {
                      extendSelection(day, hour);
                    }
                  }}
                  onMouseUp={(event) => finishSelection(day, hour, event.clientX, event.clientY)}
                  className={`relative h-full min-h-12 cursor-crosshair overflow-visible border-b border-r border-theme-border p-1 transition last:border-r-0 ${
                    selected ? "bg-theme-accent-muted" : "hover:bg-theme-surface-raised"
                  }`}
                >
                  {startingEvents.map((event) => (
                    <CalendarEventPill
                      key={event.id}
                      event={event}
                      groups={groups}
                      compact
                      durationHours={eventDurationHours(event)}
                      hourHeightRem={3}
                      onEventMenu={onEventMenu}
                    />
                  ))}
                  <div className="relative z-20 grid content-start gap-1.5 overflow-visible">
                    {hourTasks.map((task) => (
                      <CalendarTaskPill key={task.id} task={task} groups={groups} compact onTaskMenu={onTaskMenu} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {createChoice ? (
        <CreateSelectionMenu
          choice={createChoice}
          onCreateTask={() => {
            onCreateTaskAt(`${createChoice.dayKey}T${toTimeValue(createChoice.startHour)}`);
            setCreateChoice(null);
          }}
          onCreateEvent={() => {
            onCreateEvent(createChoice.dayKey, toTimeValue(createChoice.startHour), toTimeValue(createChoice.endHour));
            setCreateChoice(null);
          }}
          onClose={() => setCreateChoice(null)}
        />
      ) : null}
    </div>
  );
}

function MonthlyCalendar({
  date,
  tasks,
  groups,
  onTaskMenu,
}: {
  date: Date;
  tasks: Task[];
  groups: TaskGroup[];
  onTaskMenu: (task: Task, x: number, y: number) => void;
}) {
  const weeks = weeksForMonth(date);

  return (
    <div className="grid min-h-full min-w-[900px] grid-rows-6 overflow-hidden rounded-2xl border border-theme-border bg-theme-background">
      {weeks.map((week, index) => {
        const startKey = toDateKey(week[0]);
        const endKey = toDateKey(week[6]);
        const weekTasks = tasks.filter((task) => {
          const taskDate = datePart(task.dueDate);
          return taskDate >= startKey && taskDate <= endKey;
        });

        return (
          <div key={startKey} className="grid min-h-28 grid-cols-[130px_minmax(0,1fr)] border-b border-theme-border last:border-b-0">
            <div className="border-r border-theme-border bg-theme-surface-muted px-3 py-3">
              <p className="text-xs uppercase text-theme-text-dim">Week {index + 1}</p>
              <p className="mt-1 text-sm font-semibold text-theme-text">
                {shortDate(week[0])} - {shortDate(week[6])}
              </p>
            </div>
            <div className="grid content-start gap-2 overflow-y-auto p-3">
              {weekTasks.length ? (
                weekTasks.map((task) => (
                  <CalendarTaskPill key={task.id} task={task} groups={groups} onTaskMenu={onTaskMenu} />
                ))
              ) : (
                <p className="text-sm text-theme-text-dim">No tasks this week</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalendarTaskPill({
  task,
  groups,
  compact = false,
  onTaskMenu,
}: {
  task: Task;
  groups: TaskGroup[];
  compact?: boolean;
  onTaskMenu: (task: Task, x: number, y: number) => void;
}) {
  const group = groups.find((item) => item.id === task.taskGroupId);

  return (
    <div className={`relative z-20 rounded-xl border border-theme-border bg-theme-surface shadow-subtle ${compact ? "px-2 py-1.5" : "px-3 py-2"}`}>
      <button
        type="button"
        onMouseDown={(event) => event.stopPropagation()}
        onMouseUp={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onTaskMenu(task, event.clientX, event.clientY);
        }}
        className="flex w-full items-start gap-2 text-left"
      >
        <Circle size={8} className="mt-1.5 fill-theme-accent text-theme-accent" />
        <div className="min-w-0 flex-1">
          <p className={`truncate font-semibold ${compact ? "text-xs" : "text-sm"} ${task.completed ? "text-theme-text-dim line-through" : "text-theme-text"}`}>
            {task.name}
          </p>
          {!compact ? (
            <p className="mt-0.5 text-xs text-theme-text-muted">
              {timeLabel(task.dueDate)} · {group?.name ?? "No group"}
            </p>
          ) : null}
        </div>
      </button>
    </div>
  );
}

function CalendarEventPill({
  event,
  groups,
  compact = false,
  durationHours,
  hourHeightRem,
  onEventMenu,
}: {
  event: CalendarEvent;
  groups: TaskGroup[];
  compact?: boolean;
  durationHours: number;
  hourHeightRem: number;
  onEventMenu: (event: CalendarEvent, x: number, y: number) => void;
}) {
  const group = groups.find((item) => item.id === event.taskGroupId);
  const name = event.name || "Event";

  return (
    <div
      className={`absolute inset-x-1 top-1 z-10 rounded-xl border border-theme-accent/40 bg-theme-accent-muted shadow-subtle ${
        compact ? "px-2 py-1.5" : "px-3 py-2"
      }`}
      style={{ height: `calc(${durationHours} * ${hourHeightRem}rem - 0.5rem)` }}
    >
      <button
        type="button"
        onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
        onMouseUp={(mouseEvent) => mouseEvent.stopPropagation()}
        onClick={(mouseEvent) => {
          mouseEvent.stopPropagation();
          onEventMenu(event, mouseEvent.clientX, mouseEvent.clientY);
        }}
        className="flex h-full w-full items-start gap-2 overflow-hidden text-left"
      >
        <Clock size={compact ? 13 : 15} className="mt-0.5 text-theme-accent-strong" />
        <div className="min-w-0 flex-1">
          <p className={`truncate font-semibold text-theme-text ${compact ? "text-xs" : "text-sm"}`}>{name}</p>
          {!compact ? (
            <p className="mt-0.5 text-xs text-theme-text-muted">
              {timeRangeLabel(event.startTime, event.endTime)} · {group?.name ?? "No group"}
            </p>
          ) : null}
        </div>
      </button>
    </div>
  );
}

function CreateSelectionMenu({
  choice,
  onCreateTask,
  onCreateEvent,
  onClose,
}: {
  choice: {
    x: number;
    y: number;
    dayKey: string;
    startHour: number;
    endHour: number;
  };
  onCreateTask: () => void;
  onCreateEvent: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed z-30 min-w-44 rounded-xl border border-theme-border bg-theme-surface-raised p-1 shadow-card"
      style={{ left: choice.x, top: choice.y }}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="px-3 py-2 text-xs text-theme-text-dim">
        {timeRangeLabel(toTimeValue(choice.startHour), toTimeValue(choice.endHour))}
      </div>
      <button
        type="button"
        onClick={onCreateTask}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-theme-text hover:bg-theme-surface hover:text-theme-accent-strong"
      >
        <Circle size={10} className="fill-theme-accent text-theme-accent" />
        Create task
      </button>
      <button
        type="button"
        onClick={onCreateEvent}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-theme-text hover:bg-theme-surface hover:text-theme-accent-strong"
      >
        <Clock size={16} />
        Create event
      </button>
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-lg px-3 py-2 text-left text-sm text-theme-text-muted hover:bg-theme-surface"
      >
        Cancel
      </button>
    </div>
  );
}

function calendarTitle(date: Date, mode: CalendarMode) {
  if (mode === "day") {
    return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(date);
  }

  if (mode === "week") {
    const days = daysForWeek(date);
    return `${shortDate(days[0])} - ${shortDate(days[6])}`;
  }

  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(date);
}

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function startOfWeek(date: Date) {
  const nextDate = startOfDay(date);
  const day = nextDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  nextDate.setDate(nextDate.getDate() + mondayOffset);
  return nextDate;
}

function daysForWeek(date: Date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function weeksForMonth(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = startOfWeek(first);

  return Array.from({ length: 6 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const day = new Date(start);
      day.setDate(start.getDate() + weekIndex * 7 + dayIndex);
      return day;
    }),
  );
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dueHour(value?: string) {
  if (!value || !value.includes("T")) {
    return 9;
  }

  return Number(value.slice(11, 13));
}

function formatHour(hour: number) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric" }).format(new Date(2026, 0, 1, hour));
}

function eventHour(value: string) {
  return Number(value.slice(0, 2));
}

function eventDurationHours(event: CalendarEvent) {
  return Math.max(1, timeToHour(event.endTime) - timeToHour(event.startTime));
}

function timeToHour(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour + minute / 60;
}

function toTimeValue(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function timeLabel(value?: string) {
  if (!value || !value.includes("T")) {
    return "No time";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function timeRangeLabel(startTime: string, endTime: string) {
  return `${timeOnlyLabel(startTime)} - ${timeOnlyLabel(endTime)}`;
}

function timeOnlyLabel(value: string) {
  const [hour, minute] = value.split(":").map(Number);

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2026, 0, 1, hour, minute));
}

function weekdayLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
}

function shortDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}
