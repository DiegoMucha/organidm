import { Check, Circle, Edit3, Trash2 } from "lucide-react";
import { useEffect, useState, type MouseEvent, type ReactElement } from "react";
import type { Task, TaskGroup } from "../types";
import { formatDueDate } from "../utils/date";

type TaskListProps = {
  tasks: Task[];
  groups: TaskGroup[];
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

export function TaskList({ tasks, groups, onToggleComplete, onEdit, onDelete }: TaskListProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    task: Task;
  } | null>(null);

  useEffect(() => {
    function closeContextMenu() {
      setContextMenu(null);
    }

    window.addEventListener("click", closeContextMenu);
    window.addEventListener("keydown", closeContextMenu);
    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("keydown", closeContextMenu);
    };
  }, []);

  function groupNameFor(task: Task) {
    return groups.find((group) => group.id === task.taskGroupId)?.name ?? "No group";
  }

  function openContextMenu(event: MouseEvent<HTMLElement>, task: Task) {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      task,
    });
  }

  const lateTasks = tasks.filter((task) => isLateTask(task));
  const currentTasks = tasks.filter((task) => !task.completed && !isLateTask(task));
  const completedTasks = tasks.filter((task) => task.completed);

  if (tasks.length === 0) {
    return (
      <section className="grid min-h-full place-items-center rounded-2xl border border-dashed border-theme-border bg-theme-surface-muted p-8 text-center text-theme-text-muted">
        No tasks match the current filters.
      </section>
    );
  }

  return (
    <>
      <section className="grid gap-6">
        {lateTasks.length > 0 ? (
          <TaskSection
            title="Late"
            count={lateTasks.length}
            emptyText="No late tasks in this view."
            tasks={lateTasks}
            renderTask={renderTask}
          />
        ) : null}

        <TaskSection
          title="Current"
          count={currentTasks.length}
          emptyText="No current tasks in this view."
          tasks={currentTasks}
          renderTask={renderTask}
        />

        <TaskSection
          title="Completed"
          count={completedTasks.length}
          emptyText="No completed tasks in this view."
          tasks={completedTasks}
          renderTask={renderTask}
        />
      </section>

      {contextMenu ? (
        <div
          className="fixed z-30 min-w-44 rounded-xl border border-theme-border bg-theme-surface-raised p-1 shadow-card"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              onEdit(contextMenu.task);
              setContextMenu(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-theme-text hover:bg-theme-surface hover:text-theme-accent-strong"
          >
            <Edit3 size={16} />
            Edit task
          </button>
          <button
            type="button"
            onClick={() => {
              onToggleComplete(contextMenu.task.id);
              setContextMenu(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-theme-text hover:bg-theme-surface hover:text-theme-accent-strong"
          >
            <Check size={16} />
            {contextMenu.task.completed ? "Mark incomplete" : "Mark complete"}
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete(contextMenu.task.id);
              setContextMenu(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-theme-danger hover:bg-theme-surface"
          >
            <Trash2 size={16} />
            Delete task
          </button>
        </div>
      ) : null}
    </>
  );

  function renderTask(task: Task) {
    return (
      <article
        key={task.id}
        onContextMenu={(event) => openContextMenu(event, task)}
        className={`rounded-2xl border p-4 shadow-subtle transition ${
          task.completed
            ? "border-theme-border bg-theme-surface-muted opacity-75"
            : "border-theme-border bg-theme-background-soft hover:border-theme-border-strong"
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onToggleComplete(task.id)}
            className={`mt-1 rounded-full p-1 transition ${
              task.completed
                ? "border border-theme-border-strong bg-gradient-to-r from-theme-accent to-theme-accent-strong text-theme-background"
                : "text-theme-text-muted hover:bg-theme-surface-raised hover:text-theme-accent-strong"
            }`}
            aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          >
            {task.completed ? <Check size={18} /> : <Circle size={18} />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`text-base font-semibold ${
                  task.completed ? "text-theme-text-muted line-through" : "text-theme-text"
                }`}
              >
                {task.name}
              </h3>
              <span className="rounded-full border border-theme-border bg-theme-background px-2.5 py-1 text-xs font-medium text-theme-text-muted">
                {groupNameFor(task)}
              </span>
              <span className="rounded-full border border-theme-border px-2.5 py-1 text-xs text-theme-text-muted">
                {formatDueDate(task.dueDate)}
              </span>
              <span className="rounded-full border border-theme-border bg-theme-surface px-2.5 py-1 text-xs font-medium text-theme-text-muted">
                Priority {task.priority ?? 3}
              </span>
              {task.completed ? (
                <span className="rounded-full border border-theme-border-strong bg-theme-accent-muted px-2.5 py-1 text-xs font-medium text-theme-accent-strong">
                  Completed {formatCompletedAt(task.completedAt)}
                </span>
              ) : null}
            </div>

            <p
              className={`mt-2 text-sm leading-6 ${
                task.completed ? "text-theme-text-dim" : "text-theme-text-muted"
              }`}
            >
              {task.description || "No description"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1 self-start">
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="rounded-full p-2 text-theme-text-muted transition hover:bg-theme-surface-raised hover:text-theme-accent-strong"
              aria-label={`Edit ${task.name}`}
            >
              <Edit3 size={16} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="rounded-full p-2 text-theme-text-muted transition hover:bg-theme-surface-raised hover:text-theme-danger"
              aria-label={`Delete ${task.name}`}
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>
      </article>
    );
  }

  function formatCompletedAt(value?: string) {
    if (!value) {
      return "";
    }

    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  }
}

function TaskSection({
  title,
  count,
  emptyText,
  tasks,
  renderTask,
}: {
  title: string;
  count: number;
  emptyText: string;
  tasks: Task[];
  renderTask: (task: Task) => ReactElement;
}) {
  return (
    <div className="grid gap-3 border-t border-theme-border pt-5 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase text-theme-text-muted">{title}</h3>
        <span className="rounded-full border border-theme-border bg-theme-background px-2.5 py-1 text-xs text-theme-text-muted">
          {count}
        </span>
      </div>
      {tasks.length ? (
        tasks.map((task) => renderTask(task))
      ) : (
        <div className="rounded-2xl border border-dashed border-theme-border bg-theme-surface-muted p-6 text-sm text-theme-text-muted">
          {emptyText}
        </div>
      )}
    </div>
  );
}

function isLateTask(task: Task) {
  return !task.completed && Boolean(task.dueDate) && new Date(task.dueDate as string).getTime() < Date.now();
}
