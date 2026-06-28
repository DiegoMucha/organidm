import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  FileText,
  FolderKanban,
  GraduationCap,
  Landmark,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { CalendarInterface } from "./components/CalendarInterface";
import { EventForm, type EventFormValues } from "./components/EventForm";
import { GroupForm } from "./components/GroupForm";
import { Modal } from "./components/Modal";
import { Sidebar } from "./components/Sidebar";
import { StatsInterface } from "./components/StatsInterface";
import { TaskForm, type TaskFormValues } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import {
  createRemoteEvent,
  createRemoteTask,
  createRemoteTaskGroup,
  deleteRemoteEvent,
  deleteRemoteTask,
  deleteRemoteTaskGroup,
  loadLocalData,
  loadRemoteData,
  saveLocalData,
  updateRemoteEvent,
  updateRemoteTask,
  updateRemoteTaskGroup,
} from "./storage";
import type { CalendarEvent, DateFilter, ResearchPaper, Task, TaskGroup } from "./types";
import { todayInputValue, tomorrowInputValue } from "./utils/date";
import { datePart } from "./utils/date";

type MainInterface = "calendar" | "tasks" | "stats";
type StudyInterface = "research" | "interface1" | "interface";
type SubprogramId = "calendar" | "studies" | "projects" | "finances";

type Subprogram = {
  id: SubprogramId;
  name: string;
  description: string;
  Icon: LucideIcon;
  accent: string;
  accentStrong: string;
  accentMuted: string;
};

const subprograms: Subprogram[] = [
  {
    id: "calendar",
    name: "Calendar",
    description: "Tasks, lists, calendar, and stats.",
    Icon: CalendarDays,
    accent: "#1687e8",
    accentStrong: "#48adff",
    accentMuted: "#0f2a45",
  },
  {
    id: "studies",
    name: "Studies",
    description: "Courses, sessions, notes, and review cycles.",
    Icon: GraduationCap,
    accent: "#24b86f",
    accentStrong: "#65d896",
    accentMuted: "#103923",
  },
  {
    id: "projects",
    name: "Projects",
    description: "Active builds, milestones, tasks, and decisions.",
    Icon: FolderKanban,
    accent: "#9b5cff",
    accentStrong: "#c19bff",
    accentMuted: "#2e1d4b",
  },
  {
    id: "finances",
    name: "Finances",
    description: "Budgets, spending, savings, and money planning.",
    Icon: Landmark,
    accent: "#f08a24",
    accentStrong: "#ffb15f",
    accentMuted: "#44270f",
  },
];

const subprogramById = new Map(subprograms.map((subprogram) => [subprogram.id, subprogram]));

const placeholderPanels: Record<Exclude<SubprogramId, "calendar" | "studies">, { title: string; value: string; detail: string }[]> = {
  projects: [
    { title: "Active builds", value: "4", detail: "Across personal workspaces" },
    { title: "Milestones", value: "9", detail: "Open checkpoints" },
    { title: "Blocked items", value: "2", detail: "Need a decision" },
  ],
  finances: [
    { title: "Monthly budget", value: "$2.4k", detail: "Tracked target" },
    { title: "Savings rate", value: "22%", detail: "Current estimate" },
    { title: "Upcoming bills", value: "6", detail: "Due this month" },
  ],
};

function isLateTask(task: Task) {
  return !task.completed && Boolean(task.dueDate) && new Date(task.dueDate as string).getTime() < Date.now();
}

function getSubprogramThemeStyle(subprogram: Subprogram) {
  return {
    "--program-accent": subprogram.accent,
    "--program-accent-strong": subprogram.accentStrong,
    "--program-accent-muted": subprogram.accentMuted,
  } as CSSProperties;
}

function PlaceholderSubprogramInterface({ subprogram }: { subprogram: Subprogram }) {
  if (subprogram.id === "calendar" || subprogram.id === "studies") {
    return null;
  }

  const panels = placeholderPanels[subprogram.id];
  const SubprogramIcon = subprogram.Icon;

  return (
    <section className="min-h-[calc(100vh-89px)] bg-theme-background px-4 py-6 sm:px-6 md:min-h-[calc(100vh-73px)] lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--program-accent)] bg-theme-surface p-5 shadow-card">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[var(--program-accent)] bg-[var(--program-accent-muted)] text-[var(--program-accent-strong)]">
              <SubprogramIcon size={28} />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold text-theme-text">{subprogram.name}</h2>
              <p className="mt-1 text-sm text-theme-text-muted">{subprogram.description}</p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--program-accent)] bg-gradient-to-r from-[var(--program-accent)] to-[var(--program-accent-strong)] px-4 py-2 text-sm font-semibold text-theme-background shadow-subtle transition hover:brightness-110"
          >
            <Plus size={18} />
            New item
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {panels.map((panel) => (
            <article
              key={panel.title}
              className="rounded-2xl border border-theme-border bg-theme-surface p-5 shadow-card transition hover:border-[var(--program-accent)]"
            >
              <p className="text-sm font-medium text-theme-text-muted">{panel.title}</p>
              <p className="mt-3 text-3xl font-semibold text-[var(--program-accent-strong)]">{panel.value}</p>
              <p className="mt-2 text-sm text-theme-text-muted">{panel.detail}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border border-theme-border bg-theme-surface p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-theme-text">Recent activity</h3>
              <span className="rounded-full border border-[var(--program-accent)] bg-[var(--program-accent-muted)] px-3 py-1 text-sm text-[var(--program-accent-strong)]">
                Preview
              </span>
            </div>
            <div className="grid gap-3">
              {["Plan weekly priorities", "Update tracked progress", "Review next actions"].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center justify-between gap-3 rounded-xl border border-theme-border bg-theme-background px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--program-accent-muted)] text-sm font-semibold text-[var(--program-accent-strong)]">
                      {index + 1}
                    </span>
                    <span className="truncate text-sm text-theme-text">{item}</span>
                  </div>
                  <span className="text-sm text-theme-text-muted">Draft</span>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-2xl border border-theme-border bg-theme-surface p-5 shadow-card">
            <h3 className="text-lg font-semibold text-theme-text">Quick controls</h3>
            <div className="mt-4 grid gap-2">
              {["Overview", "Schedule", "Archive"].map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    index === 0
                      ? "border-[var(--program-accent)] bg-[var(--program-accent-muted)] text-[var(--program-accent-strong)]"
                      : "border-transparent text-theme-text-muted hover:border-[var(--program-accent)] hover:bg-theme-surface-raised hover:text-theme-text"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

type ResearchPaperFormValues = {
  title: string;
  authors: string;
  venue: string;
  year: string;
  abstract: string;
  paperUrl: string;
  reviewUrl: string;
  implementationUrl: string;
  trainingRepoUrl: string;
  conclusion: string;
};

type ResearchInterfaceProps = {
  papers: ResearchPaper[];
  selectedPaper: ResearchPaper | null;
  onSelectPaper: (paperId: string) => void;
  onCreatePaper: () => void;
  onEditPaper: (paper: ResearchPaper) => void;
  onDeletePaper: (paperId: string) => void;
};

function ResearchInterface({
  papers,
  selectedPaper,
  onSelectPaper,
  onCreatePaper,
  onEditPaper,
  onDeletePaper,
}: ResearchInterfaceProps) {
  const sortedPapers = [...papers].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const linkButtons = selectedPaper
    ? [
        { label: "Paper", url: selectedPaper.paperUrl },
        { label: "Review", url: selectedPaper.reviewUrl },
        { label: "Implementation", url: selectedPaper.implementationUrl },
        { label: "Training repo", url: selectedPaper.trainingRepoUrl },
      ].filter((link) => link.url.trim())
    : [];

  return (
    <div className="grid min-h-[calc(100vh-137px)] gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
      <section className="flex min-h-0 flex-col rounded-2xl border border-theme-border bg-theme-surface p-4 shadow-card">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-theme-text">Papers</h2>
            <p className="text-sm text-theme-text-muted">{papers.length} saved papers</p>
          </div>
          <button
            type="button"
            onClick={onCreatePaper}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--program-accent)] bg-gradient-to-r from-[var(--program-accent)] to-[var(--program-accent-strong)] px-4 py-2 text-sm font-semibold text-theme-background shadow-subtle transition hover:brightness-110"
          >
            <Plus size={18} />
            Add
          </button>
        </div>

        <div className="grid min-h-0 flex-1 content-start gap-2 overflow-y-auto pr-1">
          {sortedPapers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-theme-border bg-theme-background p-5 text-sm text-theme-text-muted">
              Add your first research paper to start building the list.
            </div>
          ) : null}

          {sortedPapers.map((paper) => (
            <button
              key={paper.id}
              type="button"
              onClick={() => onSelectPaper(paper.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedPaper?.id === paper.id
                  ? "border-[var(--program-accent)] bg-[var(--program-accent-muted)]"
                  : "border-theme-border bg-theme-background hover:border-[var(--program-accent)] hover:bg-theme-surface-raised"
              }`}
            >
              <span className="block truncate text-sm font-semibold text-theme-text">{paper.title}</span>
              <span className="mt-1 block truncate text-xs text-theme-text-muted">{paper.authors || "No authors yet"}</span>
              <span className="mt-3 inline-flex max-w-full items-center rounded-full border border-theme-border px-2 py-1 text-xs text-theme-text-muted">
                <span className="truncate">{[paper.venue, paper.year].filter(Boolean).join(" - ") || "Unlabeled"}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="min-h-[460px] rounded-2xl border border-theme-border bg-theme-surface p-5 shadow-card">
        {selectedPaper ? (
          <div className="grid h-full content-start gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-theme-border pb-5">
              <div className="min-w-0">
                <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--program-accent)] bg-[var(--program-accent-muted)] px-3 py-1 text-sm text-[var(--program-accent-strong)]">
                  <FileText size={15} />
                  Paper
                </p>
                <h2 className="text-2xl font-semibold text-theme-text">{selectedPaper.title}</h2>
                <p className="mt-2 text-sm text-theme-text-muted">{selectedPaper.authors || "No authors added"}</p>
                <p className="mt-1 text-sm text-theme-text-muted">
                  {[selectedPaper.venue, selectedPaper.year].filter(Boolean).join(" - ") || "No venue or year added"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEditPaper(selectedPaper)}
                  className="inline-flex items-center gap-2 rounded-full border border-theme-border bg-theme-background px-3 py-2 text-sm text-theme-text-muted transition hover:border-[var(--program-accent)] hover:text-theme-text"
                >
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDeletePaper(selectedPaper.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-theme-border bg-theme-background px-3 py-2 text-sm text-theme-text-muted transition hover:border-theme-danger hover:text-theme-danger"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {linkButtons.length === 0 ? (
                <span className="text-sm text-theme-text-muted">No external links added yet.</span>
              ) : null}
              {linkButtons.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--program-accent)] bg-theme-background px-4 py-2 text-sm font-medium text-[var(--program-accent-strong)] transition hover:bg-[var(--program-accent-muted)]"
                >
                  {link.label}
                  <ExternalLink size={15} />
                </a>
              ))}
            </div>

            {selectedPaper.abstract ? (
              <section className="rounded-2xl border border-theme-border bg-theme-background p-4">
                <h3 className="text-sm font-semibold uppercase text-theme-text-muted">Abstract / notes</h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-theme-text">{selectedPaper.abstract}</p>
              </section>
            ) : null}

            <section className="rounded-2xl border border-[var(--program-accent)] bg-[var(--program-accent-muted)] p-4">
              <h3 className="text-sm font-semibold uppercase text-[var(--program-accent-strong)]">Conclusion</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-theme-text">
                {selectedPaper.conclusion || "No conclusion added yet."}
              </p>
            </section>
          </div>
        ) : (
          <div className="grid h-full min-h-[420px] place-items-center text-center">
            <div>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[var(--program-accent)] bg-[var(--program-accent-muted)] text-[var(--program-accent-strong)]">
                <FileText size={28} />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-theme-text">Select a paper</h2>
              <p className="mt-2 max-w-sm text-sm text-theme-text-muted">
                Pick a paper from the list or add one to open its research detail view.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ResearchPaperForm({
  editingPaper,
  onSubmit,
}: {
  editingPaper: ResearchPaper | null;
  onSubmit: (values: ResearchPaperFormValues) => void;
}) {
  const [values, setValues] = useState<ResearchPaperFormValues>({
    title: editingPaper?.title ?? "",
    authors: editingPaper?.authors ?? "",
    venue: editingPaper?.venue ?? "",
    year: editingPaper?.year ?? "",
    abstract: editingPaper?.abstract ?? "",
    paperUrl: editingPaper?.paperUrl ?? "",
    reviewUrl: editingPaper?.reviewUrl ?? "",
    implementationUrl: editingPaper?.implementationUrl ?? "",
    trainingRepoUrl: editingPaper?.trainingRepoUrl ?? "",
    conclusion: editingPaper?.conclusion ?? "",
  });

  function updateValue(field: keyof ResearchPaperFormValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.title.trim()) {
      return;
    }

    onSubmit({
      ...values,
      title: values.title.trim(),
      authors: values.authors.trim(),
      venue: values.venue.trim(),
      year: values.year.trim(),
      paperUrl: values.paperUrl.trim(),
      reviewUrl: values.reviewUrl.trim(),
      implementationUrl: values.implementationUrl.trim(),
      trainingRepoUrl: values.trainingRepoUrl.trim(),
    });
  }

  const inputClass =
    "rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-sm text-theme-text outline-none focus:border-[var(--program-accent)]";
  const textareaClass =
    "min-h-28 rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-sm text-theme-text outline-none focus:border-[var(--program-accent)]";

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm text-theme-text-muted">
        Title
        <input
          required
          value={values.title}
          onChange={(event) => updateValue("title", event.target.value)}
          className={inputClass}
          placeholder="Paper title"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-theme-text-muted">
          Authors
          <input
            value={values.authors}
            onChange={(event) => updateValue("authors", event.target.value)}
            className={inputClass}
            placeholder="Author names"
          />
        </label>
        <label className="grid gap-2 text-sm text-theme-text-muted">
          Year
          <input
            value={values.year}
            onChange={(event) => updateValue("year", event.target.value)}
            className={inputClass}
            placeholder="2026"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm text-theme-text-muted">
        Venue
        <input
          value={values.venue}
          onChange={(event) => updateValue("venue", event.target.value)}
          className={inputClass}
          placeholder="Conference, journal, arXiv, etc."
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-theme-text-muted">
          Paper link
          <input
            type="url"
            value={values.paperUrl}
            onChange={(event) => updateValue("paperUrl", event.target.value)}
            className={inputClass}
            placeholder="https://..."
          />
        </label>
        <label className="grid gap-2 text-sm text-theme-text-muted">
          Review link
          <input
            type="url"
            value={values.reviewUrl}
            onChange={(event) => updateValue("reviewUrl", event.target.value)}
            className={inputClass}
            placeholder="https://..."
          />
        </label>
        <label className="grid gap-2 text-sm text-theme-text-muted">
          Implementation link
          <input
            type="url"
            value={values.implementationUrl}
            onChange={(event) => updateValue("implementationUrl", event.target.value)}
            className={inputClass}
            placeholder="https://..."
          />
        </label>
        <label className="grid gap-2 text-sm text-theme-text-muted">
          Training repo link
          <input
            type="url"
            value={values.trainingRepoUrl}
            onChange={(event) => updateValue("trainingRepoUrl", event.target.value)}
            className={inputClass}
            placeholder="https://..."
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm text-theme-text-muted">
        Abstract / notes
        <textarea
          value={values.abstract}
          onChange={(event) => updateValue("abstract", event.target.value)}
          className={textareaClass}
          placeholder="What the paper is about"
        />
      </label>

      <label className="grid gap-2 text-sm text-theme-text-muted">
        Conclusion
        <textarea
          value={values.conclusion}
          onChange={(event) => updateValue("conclusion", event.target.value)}
          className={textareaClass}
          placeholder="Your conclusion from reading or implementing it"
        />
      </label>

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full border border-[var(--program-accent)] bg-gradient-to-r from-[var(--program-accent)] to-[var(--program-accent-strong)] px-4 py-2 text-sm font-semibold text-theme-background shadow-subtle transition hover:brightness-110"
      >
        {editingPaper ? "Save paper" : "Create paper"}
      </button>
    </form>
  );
}

function StudiesInterface({
  activeStudyInterface,
  papers,
  selectedPaper,
  onSelectPaper,
  onCreatePaper,
  onEditPaper,
  onDeletePaper,
}: {
  activeStudyInterface: StudyInterface;
  papers: ResearchPaper[];
  selectedPaper: ResearchPaper | null;
  onSelectPaper: (paperId: string) => void;
  onCreatePaper: () => void;
  onEditPaper: (paper: ResearchPaper) => void;
  onDeletePaper: (paperId: string) => void;
}) {
  return (
    <section className="min-h-[calc(100vh-89px)] bg-theme-background px-4 py-6 sm:px-6 md:min-h-[calc(100vh-73px)] lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-5">
        {activeStudyInterface === "research" ? (
          <ResearchInterface
            papers={papers}
            selectedPaper={selectedPaper}
            onSelectPaper={onSelectPaper}
            onCreatePaper={onCreatePaper}
            onEditPaper={onEditPaper}
            onDeletePaper={onDeletePaper}
          />
        ) : (
          <section className="min-h-[420px] rounded-2xl border border-theme-border bg-theme-surface shadow-card" />
        )}
      </div>
    </section>
  );
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadLocalData().tasks);
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>(() => loadLocalData().taskGroups);
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadLocalData().events);
  const [researchPapers, setResearchPapers] = useState<ResearchPaper[]>(() => loadLocalData().researchPapers);
  const [hasLoadedRemoteData, setHasLoadedRemoteData] = useState(false);
  const [storageStatus, setStorageStatus] = useState<"connecting" | "remote" | "local">("connecting");
  const [activeSubprogram, setActiveSubprogram] = useState<SubprogramId>("calendar");
  const [isSubprogramMenuOpen, setIsSubprogramMenuOpen] = useState(false);
  const [activeInterface, setActiveInterface] = useState<MainInterface>("tasks");
  const [activeStudyInterface, setActiveStudyInterface] = useState<StudyInterface>("research");
  const [selectedResearchPaperId, setSelectedResearchPaperId] = useState("");
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
  const [isCreatingResearchPaper, setIsCreatingResearchPaper] = useState(false);
  const [editingResearchPaper, setEditingResearchPaper] = useState<ResearchPaper | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function hydrateData() {
      const localData = loadLocalData();

      try {
        const data = await loadRemoteData();

        if (!isMounted) {
          return;
        }

        setTasks(data.tasks);
        setTaskGroups(data.taskGroups);
        setEvents(data.events);
        setResearchPapers(data.researchPapers);
        saveLocalData(data);
        setStorageStatus("remote");
      } catch (error) {
        console.error(error);
        setStorageStatus("local");
      } finally {
        if (isMounted) {
          setHasLoadedRemoteData(true);
        }
      }
    }

    hydrateData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedRemoteData) {
      return;
    }

    const data = { tasks, taskGroups, events, researchPapers };
    saveLocalData(data);
  }, [events, hasLoadedRemoteData, researchPapers, taskGroups, tasks]);

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

  const selectedResearchPaper =
    researchPapers.find((paper) => paper.id === selectedResearchPaperId) ?? researchPapers[0] ?? null;

  async function handleTaskSubmit(values: TaskFormValues) {
    const now = new Date().toISOString();

    if (editingTask) {
      const taskUpdate = {
        name: values.name,
        description: values.description,
        taskGroupId: values.taskGroupId || undefined,
        dueDate: values.dueDate || undefined,
        priority: values.priority || 3,
        updatedAt: now,
      };

      try {
        const updatedTask = await updateRemoteTask(editingTask.id, taskUpdate);
        setTasks((currentTasks) => currentTasks.map((task) => (task.id === editingTask.id ? updatedTask : task)));
        setStorageStatus("remote");
        closeTaskModal();
      } catch (error) {
        console.error(error);
        setStorageStatus("local");
      }
      return;
    }

    try {
      const createdTask = await createRemoteTask({
        name: values.name,
        description: values.description,
        taskGroupId: values.taskGroupId || undefined,
        dueDate: values.dueDate || undefined,
        priority: values.priority || 3,
      });
      setTasks((currentTasks) => [createdTask, ...currentTasks]);
      setStorageStatus("remote");
      closeTaskModal();
    } catch (error) {
      console.error(error);
      setStorageStatus("local");
    }
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

  async function handleGroupSubmit(name: string, iconPlaceholder: string) {
    if (editingGroup) {
      try {
        const updatedGroup = await updateRemoteTaskGroup(editingGroup.id, name, iconPlaceholder);
        setTaskGroups((groups) => groups.map((group) => (group.id === editingGroup.id ? updatedGroup : group)));
        setStorageStatus("remote");
        closeGroupModal();
      } catch (error) {
        console.error(error);
        setStorageStatus("local");
      }
      return;
    }

    try {
      const createdGroup = await createRemoteTaskGroup(name, iconPlaceholder);
      setTaskGroups((groups) => [...groups, createdGroup]);
      setStorageStatus("remote");
      closeGroupModal();
    } catch (error) {
      console.error(error);
      setStorageStatus("local");
    }
  }

  async function deleteTask(taskId: string) {
    try {
      await deleteRemoteTask(taskId);
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
      setStorageStatus("remote");
      if (editingTask?.id === taskId) {
        closeTaskModal();
      }
    } catch (error) {
      console.error(error);
      setStorageStatus("local");
    }
  }

  async function toggleTaskComplete(taskId: string) {
    const task = tasks.find((currentTask) => currentTask.id === taskId);

    if (!task) {
      return;
    }

    const completed = !task.completed;
    const now = new Date().toISOString();

    try {
      const updatedTask = await updateRemoteTask(taskId, {
        completed,
        completedAt: completed ? now : undefined,
      });
      setTasks((currentTasks) => currentTasks.map((currentTask) => (currentTask.id === taskId ? updatedTask : currentTask)));
      setStorageStatus("remote");
    } catch (error) {
      console.error(error);
      setStorageStatus("local");
    }
  }

  async function handleEventSubmit(values: EventFormValues) {
    const now = new Date().toISOString();

    if (editingEvent) {
      const eventUpdate = {
        name: values.name,
        description: values.description,
        taskGroupId: values.taskGroupId || undefined,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        updatedAt: now,
      };

      try {
        const updatedEvent = await updateRemoteEvent(editingEvent.id, eventUpdate);
        setEvents((currentEvents) => currentEvents.map((event) => (event.id === editingEvent.id ? updatedEvent : event)));
        setStorageStatus("remote");
        closeEventModal();
      } catch (error) {
        console.error(error);
        setStorageStatus("local");
      }
      return;
    }

    try {
      const createdEvent = await createRemoteEvent({
        name: values.name,
        description: values.description,
        taskGroupId: values.taskGroupId || undefined,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
      });
      setEvents((currentEvents) => [createdEvent, ...currentEvents]);
      setStorageStatus("remote");
      closeEventModal();
    } catch (error) {
      console.error(error);
      setStorageStatus("local");
    }
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

  async function deleteEvent(eventId: string) {
    try {
      await deleteRemoteEvent(eventId);
      setEvents((currentEvents) => currentEvents.filter((event) => event.id !== eventId));
      setStorageStatus("remote");
      if (editingEvent?.id === eventId) {
        closeEventModal();
      }
    } catch (error) {
      console.error(error);
      setStorageStatus("local");
    }
  }

  async function deleteGroup(groupId: string) {
    try {
      await Promise.all([
        ...tasks
          .filter((task) => task.taskGroupId === groupId)
          .map((task) => updateRemoteTask(task.id, { taskGroupId: undefined })),
        ...events
          .filter((event) => event.taskGroupId === groupId)
          .map((event) =>
            updateRemoteEvent(event.id, {
              name: event.name,
              description: event.description,
              taskGroupId: undefined,
              date: event.date,
              startTime: event.startTime,
              endTime: event.endTime,
            }),
          ),
      ]);
      await deleteRemoteTaskGroup(groupId);
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
      setStorageStatus("remote");
    } catch (error) {
      console.error(error);
      setStorageStatus("local");
      return;
    }

    if (selectedGroupId === groupId) {
      setSelectedGroupId("all");
    }

    if (editingGroup?.id === groupId) {
      closeGroupModal();
    }
  }

  function openCreateResearchPaper() {
    setEditingResearchPaper(null);
    setIsCreatingResearchPaper(true);
  }

  function openEditResearchPaper(paper: ResearchPaper) {
    setIsCreatingResearchPaper(false);
    setEditingResearchPaper(paper);
  }

  function closeResearchPaperModal() {
    setIsCreatingResearchPaper(false);
    setEditingResearchPaper(null);
  }

  function handleResearchPaperSubmit(values: ResearchPaperFormValues) {
    const now = new Date().toISOString();

    if (editingResearchPaper) {
      setResearchPapers((papers) =>
        papers.map((paper) =>
          paper.id === editingResearchPaper.id
            ? {
                ...paper,
                ...values,
                updatedAt: now,
              }
            : paper,
        ),
      );
      setSelectedResearchPaperId(editingResearchPaper.id);
      closeResearchPaperModal();
      return;
    }

    const paperId = crypto.randomUUID();
    setResearchPapers((papers) => [
      {
        id: paperId,
        ...values,
        createdAt: now,
        updatedAt: now,
      },
      ...papers,
    ]);
    setSelectedResearchPaperId(paperId);
    closeResearchPaperModal();
  }

  function deleteResearchPaper(paperId: string) {
    setResearchPapers((papers) => papers.filter((paper) => paper.id !== paperId));
    if (selectedResearchPaperId === paperId) {
      const nextPaper = researchPapers.find((paper) => paper.id !== paperId);
      setSelectedResearchPaperId(nextPaper?.id ?? "");
    }
    if (editingResearchPaper?.id === paperId) {
      closeResearchPaperModal();
    }
  }

  function selectSubprogram(subprogramId: SubprogramId) {
    setActiveSubprogram(subprogramId);
    setIsSubprogramMenuOpen(false);
  }

  const activeSubprogramConfig = subprogramById.get(activeSubprogram) ?? subprograms[0];

  return (
    <main className="min-h-screen bg-theme-background text-theme-text" style={getSubprogramThemeStyle(activeSubprogramConfig)}>
      <header className="sticky top-0 z-10 border-b border-theme-border bg-theme-background/95 shadow-subtle backdrop-blur">
        <div className="flex w-full flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSubprogramMenuOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-theme-border bg-theme-surface text-[var(--program-accent-strong)] transition hover:border-[var(--program-accent)] hover:bg-[var(--program-accent-muted)]"
              aria-label="Open personal manager subprograms"
            >
              <Sparkles size={22} />
            </button>
            <div>
              <h1 className="text-xl font-semibold tracking-normal">Personal Manager</h1>
              <p className="text-sm text-theme-text-muted">{activeSubprogramConfig.name}</p>
            </div>
            <span
              className={`hidden rounded-full border px-3 py-1 text-xs font-medium sm:inline-flex ${
                storageStatus === "remote"
                  ? "border-theme-border-strong bg-theme-accent-muted text-theme-accent-strong"
                  : "border-theme-border bg-theme-surface text-theme-text-muted"
              }`}
              title={storageStatus === "remote" ? "Saving to backend API" : "Using local cache until the API is available"}
            >
              {storageStatus === "remote" ? "API synced" : storageStatus === "connecting" ? "Connecting" : "Local cache"}
            </span>
          </div>
          {activeSubprogram === "calendar" ? (
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
          ) : null}
          {activeSubprogram === "studies" ? (
            <nav className="grid grid-cols-3 gap-1 rounded-2xl border border-theme-border bg-theme-surface p-1 sm:flex sm:items-center">
              {[
                ["research", "Research"],
                ["interface1", "Interface1"],
                ["interface", "Interface"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveStudyInterface(value as StudyInterface)}
                  className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm transition ${
                    activeStudyInterface === value
                      ? "border border-[var(--program-accent)] bg-gradient-to-r from-[var(--program-accent)] to-[var(--program-accent-strong)] font-semibold text-theme-background shadow-subtle"
                      : "font-medium text-theme-text-muted hover:bg-theme-surface hover:text-theme-text"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          ) : null}
        </div>
      </header>

      {activeSubprogram === "calendar" && activeInterface === "tasks" ? (
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
                  onToggleComplete={toggleTaskComplete}
                  onEdit={openEditTask}
                  onDelete={deleteTask}
                />
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {activeSubprogram === "calendar" && activeInterface === "calendar" ? (
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

      {activeSubprogram === "calendar" && activeInterface === "stats" ? (
        <StatsInterface tasks={tasks} groups={taskGroups} />
      ) : null}

      {activeSubprogram === "studies" ? (
        <StudiesInterface
          activeStudyInterface={activeStudyInterface}
          papers={researchPapers}
          selectedPaper={selectedResearchPaper}
          onSelectPaper={setSelectedResearchPaperId}
          onCreatePaper={openCreateResearchPaper}
          onEditPaper={openEditResearchPaper}
          onDeletePaper={deleteResearchPaper}
        />
      ) : null}

      {activeSubprogram !== "calendar" && activeSubprogram !== "studies" ? (
        <PlaceholderSubprogramInterface subprogram={activeSubprogramConfig} />
      ) : null}

      {isSubprogramMenuOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-theme-background/80 px-4 py-6 backdrop-blur-sm">
          <section className="w-full max-w-2xl rounded-2xl border border-theme-border bg-theme-surface shadow-card">
            <div className="flex items-center justify-between gap-3 border-b border-theme-border px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-theme-text">Subprograms</h2>
                <p className="text-sm text-theme-text-muted">Choose a Personal Manager workspace.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSubprogramMenuOpen(false)}
                className="rounded-full p-2 text-theme-text-muted hover:bg-theme-surface-raised hover:text-theme-text"
                aria-label="Close subprogram menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {subprograms.map((subprogram) => {
                const SubprogramIcon = subprogram.Icon;
                const isActive = activeSubprogram === subprogram.id;

                return (
                  <button
                    key={subprogram.id}
                    type="button"
                    onClick={() => selectSubprogram(subprogram.id)}
                    style={getSubprogramThemeStyle(subprogram)}
                    className={`flex min-h-32 items-start gap-4 rounded-2xl border p-4 text-left transition ${
                      isActive
                        ? "border-[var(--program-accent)] bg-[var(--program-accent-muted)]"
                        : "border-theme-border bg-theme-background hover:border-[var(--program-accent)] hover:bg-theme-surface-raised"
                    }`}
                  >
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${
                        isActive
                          ? "border-[var(--program-accent)] bg-theme-surface text-[var(--program-accent-strong)]"
                          : "border-theme-border bg-theme-surface text-theme-text-muted"
                      }`}
                    >
                      <SubprogramIcon size={22} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-base font-semibold text-theme-text">{subprogram.name}</span>
                      <span className="mt-1 block text-sm leading-5 text-theme-text-muted">
                        {subprogram.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}

      {activeSubprogram === "calendar" && (isCreatingTask || editingTask) ? (
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

      {activeSubprogram === "calendar" && (initialEventValues || editingEvent) ? (
        <Modal title={editingEvent ? "Edit event" : "Create event"} onClose={closeEventModal}>
          <EventForm
            groups={taskGroups}
            editingEvent={editingEvent}
            initialValues={initialEventValues ?? undefined}
            onSubmit={handleEventSubmit}
          />
        </Modal>
      ) : null}

      {activeSubprogram === "calendar" && (isCreatingGroup || editingGroup) ? (
        <Modal title={editingGroup ? "Edit task list" : "Create task list"} onClose={closeGroupModal}>
          <GroupForm editingGroup={editingGroup} onSubmit={handleGroupSubmit} />
        </Modal>
      ) : null}

      {activeSubprogram === "studies" && activeStudyInterface === "research" && (isCreatingResearchPaper || editingResearchPaper) ? (
        <Modal
          title={editingResearchPaper ? "Edit paper" : "Create paper"}
          onClose={closeResearchPaperModal}
        >
          <ResearchPaperForm editingPaper={editingResearchPaper} onSubmit={handleResearchPaperSubmit} />
        </Modal>
      ) : null}
    </main>
  );
}

export default App;
