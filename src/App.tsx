import { BarChart3, CalendarDays, ClipboardList, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CalendarInterface } from "./components/CalendarInterface";
import { EventForm, type EventFormValues } from "./components/EventForm";
import { GroupForm } from "./components/GroupForm";
import { Modal } from "./components/Modal";
import { Sidebar } from "./components/Sidebar";
import { StatsInterface } from "./components/StatsInterface";
import { TaskForm, type TaskFormValues } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { loadEvents, loadTaskGroups, loadTasks, saveEvents, saveTaskGroups, saveTasks } from "./storage";
import type { CalendarEvent, DateFilter, Task, TaskGroup } from "./types";
import { todayInputValue, tomorrowInputValue } from "./utils/date";
import { datePart } from "./utils/date";

type MainInterface = "calendar" | "tasks" | "stats";

function isLateTask(task: Task) {
  return !task.completed && Boolean(task.dueDate) && new Date(task.dueDate as string).getTime() < Date.now();
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>(loadTaskGroups);
  const [events, setEvents] = useState<CalendarEvent[]>(loadEvents);
  const [activeInterface, setActiveInterface] = useState<MainInterface>("tasks");
  const [selectedGroupId, setSelectedGroupId] = useState("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customDate, setCustomDate] = useState(todayInputValue());
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [initialTaskDueDate, setInitialTaskDueDate] = useState("");
  const [initialEventValues, setInitialEventValues] = useState<Partial<EventFormValues> | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editingGroup, setEditingGroup] = useState<TaskGroup | null>(null);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveTaskGroups(taskGroups);
  }, [taskGroups]);

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (selectedGroupId === "all") {
          return true;
        }

        return task.taskGroupId === selectedGroupId;
      })
      .filter((task) => {
        if (dateFilter === "all") {
          return true;
        }

        if (isLateTask(task)) {
          return true;
        }

        if (dateFilter === "today") {
          return datePart(task.dueDate) === todayInputValue();
        }

        if (dateFilter === "tomorrow") {
          return datePart(task.dueDate) === tomorrowInputValue();
        }

        return datePart(task.dueDate) === customDate;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [customDate, dateFilter, selectedGroupId, tasks]);

  function handleTaskSubmit(values: TaskFormValues) {
    const now = new Date().toISOString();

    if (editingTask) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                name: values.name,
                description: values.description,
                taskGroupId: values.taskGroupId || undefined,
                dueDate: values.dueDate || undefined,
                priority: values.priority || 3,
                updatedAt: now,
              }
            : task,
        ),
      );
      closeTaskModal();
      return;
    }

    setTasks((currentTasks) => [
      {
        id: crypto.randomUUID(),
        name: values.name,
        description: values.description,
        taskGroupId: values.taskGroupId || undefined,
        dueDate: values.dueDate || undefined,
        priority: values.priority || 3,
        completed: false,
        completedAt: undefined,
        createdAt: now,
        updatedAt: now,
      },
      ...currentTasks,
    ]);
    closeTaskModal();
  }

  function openCreateTask(dueDate = "") {
    setEditingTask(null);
    setInitialTaskDueDate(dueDate);
    setIsCreatingTask(true);
  }

  function openEditTask(task: Task) {
    setIsCreatingTask(false);
    setInitialTaskDueDate("");
    setEditingTask(task);
  }

  function closeTaskModal() {
    setEditingTask(null);
    setInitialTaskDueDate("");
    setIsCreatingTask(false);
  }

  function openCreateGroup() {
    setEditingGroup(null);
    setIsCreatingGroup(true);
  }

  function openEditGroup(group: TaskGroup) {
    setIsCreatingGroup(false);
    setEditingGroup(group);
  }

  function closeGroupModal() {
    setEditingGroup(null);
    setIsCreatingGroup(false);
  }

  function handleGroupSubmit(name: string, iconPlaceholder: string) {
    if (editingGroup) {
      setTaskGroups((groups) =>
        groups.map((group) =>
          group.id === editingGroup.id
            ? {
                ...group,
                name,
                iconPlaceholder,
              }
            : group,
        ),
      );
      closeGroupModal();
      return;
    }

    setTaskGroups((groups) => [
      ...groups,
      {
        id: crypto.randomUUID(),
        name,
        iconPlaceholder,
        createdAt: new Date().toISOString(),
      },
    ]);
    closeGroupModal();
  }

  function deleteTask(taskId: string) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    if (editingTask?.id === taskId) {
      closeTaskModal();
    }
  }

  function handleEventSubmit(values: EventFormValues) {
    const now = new Date().toISOString();

    if (editingEvent) {
      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === editingEvent.id
            ? {
                ...event,
                name: values.name,
                description: values.description,
                taskGroupId: values.taskGroupId || undefined,
                date: values.date,
                startTime: values.startTime,
                endTime: values.endTime,
                updatedAt: now,
              }
            : event,
        ),
      );
      closeEventModal();
      return;
    }

    setEvents((currentEvents) => [
      {
        id: crypto.randomUUID(),
        name: values.name,
        description: values.description,
        taskGroupId: values.taskGroupId || undefined,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        createdAt: now,
        updatedAt: now,
      },
      ...currentEvents,
    ]);
    closeEventModal();
  }

  function openCreateEvent(date: string, startTime: string, endTime: string) {
    setEditingEvent(null);
    setInitialEventValues({
      date,
      startTime,
      endTime,
      taskGroupId: selectedGroupId === "all" ? "" : selectedGroupId,
    });
  }

  function openEditEvent(event: CalendarEvent) {
    setInitialEventValues(null);
    setEditingEvent(event);
  }

  function closeEventModal() {
    setInitialEventValues(null);
    setEditingEvent(null);
  }

  function deleteEvent(eventId: string) {
    setEvents((currentEvents) => currentEvents.filter((event) => event.id !== eventId));
    if (editingEvent?.id === eventId) {
      closeEventModal();
    }
  }

  function deleteGroup(groupId: string) {
    setTaskGroups((groups) => groups.filter((group) => group.id !== groupId));
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.taskGroupId === groupId
          ? {
              ...task,
              taskGroupId: undefined,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.taskGroupId === groupId
          ? {
              ...event,
              taskGroupId: undefined,
              updatedAt: new Date().toISOString(),
            }
          : event,
      ),
    );

    if (selectedGroupId === groupId) {
      setSelectedGroupId("all");
    }

    if (editingGroup?.id === groupId) {
      closeGroupModal();
    }
  }

  return (
    <main className="min-h-screen bg-theme-background text-theme-text">
      <header className="sticky top-0 z-10 border-b border-theme-border bg-theme-background/95 shadow-subtle backdrop-blur">
        <div className="flex w-full flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-theme-border bg-theme-surface text-theme-accent-strong">
              <ClipboardList size={22} />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-normal">Personal Manager</h1>
              <p className="text-sm text-theme-text-muted">Local, private, and focused.</p>
            </div>
          </div>
          <nav className="grid grid-cols-3 gap-1 rounded-2xl border border-theme-border bg-theme-surface p-1 sm:flex sm:items-center">
            <button
              type="button"
              onClick={() => setActiveInterface("calendar")}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                activeInterface === "calendar"
                  ? "border border-theme-border-strong bg-gradient-to-r from-theme-accent to-theme-accent-strong font-semibold text-theme-background shadow-subtle"
                  : "font-medium text-theme-text-muted hover:bg-theme-surface hover:text-theme-text"
              }`}
            >
              <CalendarDays size={17} />
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setActiveInterface("tasks")}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                activeInterface === "tasks"
                  ? "border border-theme-border-strong bg-gradient-to-r from-theme-accent to-theme-accent-strong font-semibold text-theme-background shadow-subtle"
                  : "font-medium text-theme-text-muted hover:bg-theme-surface hover:text-theme-text"
              }`}
            >
              <ClipboardList size={17} />
              Tasks
            </button>
            <button
              type="button"
              onClick={() => setActiveInterface("stats")}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                activeInterface === "stats"
                  ? "border border-theme-border-strong bg-gradient-to-r from-theme-accent to-theme-accent-strong font-semibold text-theme-background shadow-subtle"
                  : "font-medium text-theme-text-muted hover:bg-theme-surface hover:text-theme-text"
              }`}
            >
              <BarChart3 size={17} />
              Stats
            </button>
          </nav>
        </div>
      </header>

      {activeInterface === "tasks" ? (
        <div className="grid h-[calc(100vh-89px)] w-full items-stretch gap-5 overflow-hidden px-4 py-6 sm:px-6 md:h-[calc(100vh-73px)] lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
          <Sidebar
            groups={taskGroups}
            selectedGroupId={selectedGroupId}
            dateFilter={dateFilter}
            customDate={customDate}
            onSelectGroup={setSelectedGroupId}
            onDateFilterChange={setDateFilter}
            onCustomDateChange={setCustomDate}
            onCreateGroup={openCreateGroup}
            onEditGroup={openEditGroup}
            onDeleteGroup={deleteGroup}
          />

          <div className="grid min-h-0 gap-5 overflow-hidden">
            <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-theme-border bg-theme-surface p-4 shadow-card sm:p-5">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-theme-text">
                    {selectedGroupId === "all"
                      ? "All tasks"
                      : taskGroups.find((group) => group.id === selectedGroupId)?.name ?? "Task list"}
                  </h2>
                  <p className="text-sm text-theme-text-muted">
                    {filteredTasks.length} visible of {tasks.length} total
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-theme-border bg-theme-background px-3 py-1 text-sm text-theme-text-muted">
                    {dateFilter === "all" ? "All dates" : dateFilter}
                  </span>
                  <button
                    type="button"
                    onClick={() => openCreateTask()}
                    className="inline-flex items-center gap-2 rounded-full border border-theme-border-strong bg-gradient-to-r from-theme-accent to-theme-accent-strong px-4 py-2 text-sm font-semibold text-theme-background shadow-subtle transition hover:brightness-110"
                  >
                    <Plus size={18} />
                    Create task
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <TaskList
                  tasks={filteredTasks}
                  groups={taskGroups}
                  onToggleComplete={(taskId) =>
                    setTasks((currentTasks) =>
                      currentTasks.map((task) => {
                        if (task.id !== taskId) {
                          return task;
                        }

                        const completed = !task.completed;
                        const now = new Date().toISOString();

                        return {
                          ...task,
                          completed,
                          completedAt: completed ? now : undefined,
                          updatedAt: now,
                        };
                      }),
                    )
                  }
                  onEdit={openEditTask}
                  onDelete={deleteTask}
                />
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {activeInterface === "calendar" ? (
        <CalendarInterface
          tasks={tasks}
          events={events}
          groups={taskGroups}
          onCreateTaskAt={openCreateTask}
          onCreateEvent={openCreateEvent}
          onEditTask={openEditTask}
          onEditEvent={openEditEvent}
          onDeleteTask={deleteTask}
          onDeleteEvent={deleteEvent}
        />
      ) : null}

      {activeInterface === "stats" ? (
        <StatsInterface tasks={tasks} groups={taskGroups} />
      ) : null}

      {isCreatingTask || editingTask ? (
        <Modal title={editingTask ? "Edit task" : "Create task"} onClose={closeTaskModal}>
          <TaskForm
            groups={taskGroups}
            editingTask={editingTask}
            initialGroupId={selectedGroupId === "all" ? "" : selectedGroupId}
            initialDueDate={initialTaskDueDate}
            onSubmit={handleTaskSubmit}
          />
        </Modal>
      ) : null}

      {initialEventValues || editingEvent ? (
        <Modal title={editingEvent ? "Edit event" : "Create event"} onClose={closeEventModal}>
          <EventForm
            groups={taskGroups}
            editingEvent={editingEvent}
            initialValues={initialEventValues ?? undefined}
            onSubmit={handleEventSubmit}
          />
        </Modal>
      ) : null}

      {isCreatingGroup || editingGroup ? (
        <Modal title={editingGroup ? "Edit task list" : "Create task list"} onClose={closeGroupModal}>
          <GroupForm editingGroup={editingGroup} onSubmit={handleGroupSubmit} />
        </Modal>
      ) : null}
    </main>
  );
}

export default App;
