import { BarChart3, CalendarRange, ChevronLeft, ChevronRight, Filter, LayoutGrid, ListChecks, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import type { Task, TaskGroup } from "../types";
import { datePart } from "../utils/date";
import { GroupIcon } from "../utils/groupIcons";

type StatsInterfaceProps = {
  tasks: Task[];
  groups: TaskGroup[];
};

type ProgressPoint = {
  date: string;
  label: string;
  onTimeCompleted: number;
  lateCompleted: number;
  incomplete: number;
  weightedCompleted: number;
  total: number;
  score: number;
  heavyLoad: boolean;
};

type StatsView = "graph" | "completion" | "interface3";
type TimePeriod = "week" | "month" | "year";

type DateRange = {
  label: string;
  start: string;
  end: string;
  period: TimePeriod;
};

export function StatsInterface({ tasks, groups }: StatsInterfaceProps) {
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("week");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [statsView, setStatsView] = useState<StatsView>("graph");

  const assignedTasks = useMemo(() => tasks.filter((task) => Boolean(task.dueDate)), [tasks]);

  const filteredTasks = useMemo(() => {
    return assignedTasks.filter((task) => {
      if (selectedGroupIds.length === 0) {
        return true;
      }

      return task.taskGroupId ? selectedGroupIds.includes(task.taskGroupId) : false;
    });
  }, [assignedTasks, selectedGroupIds]);

  const activeRange = useMemo(() => rangeForPeriod(anchorDate, timePeriod), [anchorDate, timePeriod]);
  const progressPoints = useMemo(() => buildProgressPoints(filteredTasks, activeRange), [filteredTasks, activeRange]);

  function moveRange(direction: -1 | 1) {
    setAnchorDate((currentDate) => {
      const nextDate = new Date(currentDate);

      if (timePeriod === "week") {
        nextDate.setDate(nextDate.getDate() + direction * 7);
      }

      if (timePeriod === "month") {
        nextDate.setMonth(nextDate.getMonth() + direction);
      }

      if (timePeriod === "year") {
        nextDate.setFullYear(nextDate.getFullYear() + direction);
      }

      return nextDate;
    });
  }

  function toggleGroup(groupId: string) {
    setSelectedGroupIds((currentIds) =>
      currentIds.includes(groupId)
        ? currentIds.filter((id) => id !== groupId)
        : [...currentIds, groupId],
    );
  }

  return (
    <div className="grid h-[calc(100vh-89px)] w-full items-stretch gap-5 overflow-hidden px-4 py-6 sm:px-6 md:h-[calc(100vh-73px)] lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
      <aside className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4 overflow-hidden">
        <section className="rounded-2xl border border-theme-border bg-theme-surface p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <Filter size={18} className="text-theme-accent-strong" />
            <h2 className="text-sm font-semibold uppercase text-theme-text-muted">Time filters</h2>
          </div>

          <div className="grid gap-2">
            {[
              ["week", "Weekly"],
              ["month", "Monthly"],
              ["year", "Yearly"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTimePeriod(value as TimePeriod)}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                  timePeriod === value
                    ? "border-theme-border-strong bg-theme-accent-muted text-theme-text"
                    : "border-theme-border bg-theme-background text-theme-text-muted hover:bg-theme-surface-raised hover:text-theme-text"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="flex min-h-0 flex-col rounded-2xl border border-theme-border bg-theme-surface p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <CalendarRange size={18} className="text-theme-accent-strong" />
            <h2 className="text-sm font-semibold uppercase text-theme-text-muted">Task group</h2>
          </div>

          <div className="grid min-h-0 flex-1 content-start gap-2 overflow-y-auto pr-1">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-sm text-theme-text-muted hover:bg-theme-surface-raised hover:text-theme-text">
              <input
                type="checkbox"
                checked={selectedGroupIds.length === 0}
                onChange={() => setSelectedGroupIds([])}
                className="accent-theme-accent"
              />
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-theme-border text-xs font-semibold">
                <GroupIcon value="layers" />
              </span>
              <span className="min-w-0 truncate">All tasks</span>
            </label>

            {groups.map((group) => (
              <label
                key={group.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-theme-border bg-theme-background px-3 py-2 text-sm text-theme-text-muted hover:bg-theme-surface-raised hover:text-theme-text"
              >
                <input
                  type="checkbox"
                  checked={selectedGroupIds.includes(group.id)}
                  onChange={() => toggleGroup(group.id)}
                  className="accent-theme-accent"
                />
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-theme-border text-xs font-semibold">
                  <GroupIcon value={group.iconPlaceholder} />
                </span>
                <span className="min-w-0 truncate">{group.name}</span>
              </label>
            ))}
          </div>
        </section>
      </aside>

      <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-theme-border bg-theme-surface p-4 shadow-card sm:p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-theme-text">Stats</h2>
            <p className="text-sm text-theme-text-muted">{activeRange.label}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-2xl border border-theme-border bg-theme-background p-1">
              <button
                type="button"
                onClick={() => moveRange(-1)}
                className="rounded-xl p-2 text-theme-text-muted transition hover:bg-theme-surface-raised hover:text-theme-accent-strong"
                aria-label="Previous stats period"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setAnchorDate(new Date())}
                className="rounded-xl px-3 py-2 text-sm font-medium text-theme-text-muted transition hover:bg-theme-surface-raised hover:text-theme-text"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => moveRange(1)}
                className="rounded-xl p-2 text-theme-text-muted transition hover:bg-theme-surface-raised hover:text-theme-accent-strong"
                aria-label="Next stats period"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-theme-border bg-theme-background p-1">
              {[
                { id: "graph", label: "Graph", Icon: BarChart3 },
                { id: "completion", label: "Bars", Icon: ListChecks },
                { id: "interface3", label: "Insights", Icon: LayoutGrid },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setStatsView(id as StatsView)}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                    statsView === id
                      ? "border border-theme-border-strong bg-theme-accent-muted text-theme-text"
                      : "text-theme-text-muted hover:bg-theme-surface-raised hover:text-theme-text"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto rounded-2xl border border-theme-border bg-theme-background p-4">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-theme-accent-strong" />
            <h3 className="text-sm font-semibold uppercase text-theme-text-muted">{statsViewTitle(statsView)}</h3>
          </div>

          {statsView === "graph" ? <ProgressLineGraph points={progressPoints} /> : null}
          {statsView === "completion" ? <CompletionBars points={progressPoints} /> : null}
          {statsView === "interface3" ? <InsightsPanel points={progressPoints} /> : null}
        </div>
      </section>
    </div>
  );
}

function ProgressLineGraph({ points }: { points: ProgressPoint[] }) {
  const width = 860;
  const height = 300;
  const paddingTop = 28;
  const paddingRight = 34;
  const paddingBottom = 36;
  const paddingLeft = 58;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const graphPoints = points.map((point, index) => {
    const x = paddingLeft + (points.length <= 1 ? chartWidth : (index / (points.length - 1)) * chartWidth);
    const y = paddingTop + (1 - point.score) * chartHeight;
    return { ...point, x, y };
  });
  const path = graphPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <div className="overflow-x-auto">
      <svg className="min-w-[720px]" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Daily progress line graph">
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = paddingTop + (1 - tick) * chartHeight;

          return (
            <g key={tick}>
              <line x1={paddingLeft} x2={width - paddingRight} y1={y} y2={y} stroke="#282c35" strokeWidth="1" />
              <text x={16} y={y + 3} fill="#8f9baa" fontSize="10">
                {Math.round(tick * 100)}%
              </text>
            </g>
          );
        })}

        {path ? <path d={path} fill="none" stroke="#48adff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> : null}

        {graphPoints.map((point) => (
          <g key={point.date}>
            <circle
              cx={point.x}
              cy={point.y}
              r={point.heavyLoad ? "4" : point.lateCompleted > 0 ? "3.5" : "3"}
              fill={point.heavyLoad ? graphPointColor(point) : "#101116"}
              stroke={graphPointColor(point)}
              strokeWidth="1.5"
              filter={point.heavyLoad ? "url(#heavy-load-glow)" : undefined}
            />
            <title>
              {point.label}: {formatScoreValue(point.weightedCompleted)}/{point.total}
              {point.lateCompleted > 0 ? ` (${point.lateCompleted} late)` : ""}
            </title>
          </g>
        ))}

        <defs>
          <filter id="heavy-load-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {graphPoints.map((point, index) =>
          index === 0 || index === graphPoints.length - 1 || index % Math.ceil(Math.max(graphPoints.length, 1) / 6) === 0 ? (
            <text key={point.date} x={point.x} y={height - 10} fill="#8f9baa" fontSize="10" textAnchor="middle">
              {point.label}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}

function CompletionBars({ points }: { points: ProgressPoint[] }) {
  return (
    <div className="grid gap-2">
      {points.length ? (
        points.map((point) => (
          <div
            key={point.date}
            className="grid grid-cols-[110px_minmax(0,1fr)_76px] items-center gap-3 rounded-xl border border-theme-border bg-theme-surface px-3 py-2"
          >
            <span className="text-sm font-medium text-theme-text">{point.label}</span>
            <div className="flex h-2 overflow-hidden rounded-full bg-theme-surface-raised">
              <div
                className="h-full bg-theme-accent-strong"
                style={{ width: `${point.total ? (point.onTimeCompleted / point.total) * 100 : 0}%` }}
              />
              <div
                className="h-full bg-yellow-400"
                style={{ width: `${point.total ? (point.lateCompleted / point.total) * 100 : 0}%` }}
              />
            </div>
            <span className="text-right text-sm text-theme-text-muted">
              {point.onTimeCompleted + point.lateCompleted}/{point.total}
            </span>
          </div>
        ))
      ) : (
        <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-theme-border text-sm text-theme-text-muted">
          No assigned tasks in this range.
        </div>
      )}
    </div>
  );
}

function statsViewTitle(view: StatsView) {
  if (view === "completion") {
    return "Completion bars";
  }

  if (view === "interface3") {
    return "Insights";
  }

  return "Daily progress";
}

function InsightsPanel({ points }: { points: ProgressPoint[] }) {
  const activePoints = points.filter((point) => point.total > 0);
  const completedTasks = activePoints.reduce((sum, point) => sum + point.onTimeCompleted + point.lateCompleted, 0);
  const lateTasks = activePoints.reduce((sum, point) => sum + point.lateCompleted, 0);
  const incompleteTasks = activePoints.reduce((sum, point) => sum + point.incomplete, 0);
  const averageScore = activePoints.length
    ? activePoints.reduce((sum, point) => sum + point.score, 0) / activePoints.length
    : 0;
  const bestPoint = [...activePoints].sort((a, b) => b.score - a.score || b.total - a.total)[0];
  const busiestPoint = [...activePoints].sort((a, b) => b.total - a.total)[0];
  const streaks = streakSummary(points);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InsightMetric label="Average score" value={`${Math.round(averageScore * 100)}%`} />
        <InsightMetric label="Completed" value={String(completedTasks)} />
        <InsightMetric label="Late completed" value={String(lateTasks)} />
        <InsightMetric label="Incomplete" value={String(incompleteTasks)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-theme-border bg-theme-surface p-4">
          <h4 className="text-sm font-semibold uppercase text-theme-text-muted">Streaks</h4>
          <div className="mt-3 grid gap-3">
            <InsightRow label="Current perfect streak" value={`${streaks.currentPerfect} days`} />
            <InsightRow label="Best perfect streak" value={`${streaks.bestPerfect} days`} />
            <InsightRow label="Current activity streak" value={`${streaks.currentActivity} days`} />
            <InsightRow label="Best activity streak" value={`${streaks.bestActivity} days`} />
          </div>
        </section>

        <section className="rounded-2xl border border-theme-border bg-theme-surface p-4">
          <h4 className="text-sm font-semibold uppercase text-theme-text-muted">Highlights</h4>
          <div className="mt-3 grid gap-3">
            <InsightRow label="Best period" value={bestPoint ? `${bestPoint.label} (${Math.round(bestPoint.score * 100)}%)` : "No data"} />
            <InsightRow label="Busiest period" value={busiestPoint ? `${busiestPoint.label} (${busiestPoint.total} tasks)` : "No data"} />
            <InsightRow label="Heavy-load periods" value={String(activePoints.filter((point) => point.heavyLoad).length)} />
            <InsightRow label="Days with late work" value={String(activePoints.filter((point) => point.lateCompleted > 0).length)} />
          </div>
        </section>
      </div>
    </div>
  );
}

function InsightMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-theme-border bg-theme-surface px-4 py-3">
      <p className="text-xs uppercase text-theme-text-dim">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-theme-text">{value}</p>
    </div>
  );
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-theme-border bg-theme-background px-3 py-2">
      <span className="text-sm text-theme-text-muted">{label}</span>
      <span className="text-sm font-semibold text-theme-text">{value}</span>
    </div>
  );
}

function buildProgressPoints(tasks: Task[], range: DateRange): ProgressPoint[] {
  const markHeavyLoad = (points: ProgressPoint[]) => markHeavyLoadPoints(points);

  if (range.period === "year") {
    return markHeavyLoad(monthsBetween(range.start, range.end).map(({ key, label, start, end }) => {
      const tasksForMonth = tasks.filter((task) => {
        const assignedDate = datePart(task.dueDate);
        return assignedDate >= start && assignedDate <= end;
      });
      return buildProgressPoint(key, label, tasksForMonth);
    }));
  }

  return markHeavyLoad(daysBetween(range.start, range.end).map((date) => {
    const tasksForDate = tasks.filter((task) => datePart(task.dueDate) === date);
    return buildProgressPoint(date, shortDateLabel(date), tasksForDate);
  }));
}

function buildProgressPoint(date: string, label: string, tasks: Task[]): ProgressPoint {
  const onTimeCompleted = tasks.filter((task) => task.completed && !wasCompletedLate(task)).length;
  const lateCompleted = tasks.filter((task) => task.completed && wasCompletedLate(task)).length;
  const incomplete = tasks.filter((task) => !task.completed).length;
  const weightedCompleted = onTimeCompleted + lateCompleted * 0.5;
  const total = tasks.length;

  return {
    date,
    label,
    onTimeCompleted,
    lateCompleted,
    incomplete,
    weightedCompleted,
    total,
    score: total ? weightedCompleted / total : 0,
    heavyLoad: false,
  };
}

function markHeavyLoadPoints(points: ProgressPoint[]) {
  const activePoints = points.filter((point) => point.total > 0);
  const heavyCount = Math.max(1, Math.ceil(activePoints.length * 0.1));
  const heavyDates = new Set(
    [...activePoints]
      .sort((a, b) => b.total - a.total)
      .slice(0, heavyCount)
      .map((point) => point.date),
  );

  return points.map((point) => ({
    ...point,
    heavyLoad: point.total > 0 && heavyDates.has(point.date),
  }));
}

function graphPointColor(point: ProgressPoint) {
  if (point.incomplete > 0) {
    return "#ff5364";
  }

  if (point.lateCompleted > 0) {
    return "#facc15";
  }

  return "#48adff";
}

function streakSummary(points: ProgressPoint[]) {
  const dailyPoints = points.filter((point) => point.date.length === 10);
  const currentPerfect = trailingStreak(dailyPoints, (point) => point.total > 0 && point.score === 1);
  const currentActivity = trailingStreak(dailyPoints, (point) => point.onTimeCompleted + point.lateCompleted > 0);

  return {
    currentPerfect,
    bestPerfect: bestStreak(dailyPoints, (point) => point.total > 0 && point.score === 1),
    currentActivity,
    bestActivity: bestStreak(dailyPoints, (point) => point.onTimeCompleted + point.lateCompleted > 0),
  };
}

function trailingStreak(points: ProgressPoint[], predicate: (point: ProgressPoint) => boolean) {
  let count = 0;

  for (let index = points.length - 1; index >= 0; index -= 1) {
    if (!predicate(points[index])) {
      break;
    }

    count += 1;
  }

  return count;
}

function bestStreak(points: ProgressPoint[], predicate: (point: ProgressPoint) => boolean) {
  let best = 0;
  let current = 0;

  points.forEach((point) => {
    if (predicate(point)) {
      current += 1;
      best = Math.max(best, current);
      return;
    }

    current = 0;
  });

  return best;
}

function wasCompletedLate(task: Task) {
  if (!task.completed || !task.completedAt || !task.dueDate) {
    return false;
  }

  return new Date(task.completedAt).getTime() > new Date(task.dueDate).getTime();
}

function formatScoreValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function rangeForPeriod(anchorDate: Date, period: TimePeriod): DateRange {
  if (period === "week") {
    const start = startOfWeek(anchorDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    return {
      start: toDateKey(start),
      end: toDateKey(end),
      label: `${shortDateLabel(toDateKey(start))} - ${shortDateLabel(toDateKey(end))}`,
      period,
    };
  }

  if (period === "month") {
    const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    const end = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);

    return {
      start: toDateKey(start),
      end: toDateKey(end),
      label: new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(start),
      period,
    };
  }

  const start = new Date(anchorDate.getFullYear(), 0, 1);
  const end = new Date(anchorDate.getFullYear(), 11, 31);

  return {
    start: toDateKey(start),
    end: toDateKey(end),
    label: String(anchorDate.getFullYear()),
    period,
  };
}

function daysBetween(start: string, end: string) {
  const days: string[] = [];
  const cursor = parseDateKey(start);
  const last = parseDateKey(end);

  while (cursor <= last) {
    days.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function monthsBetween(start: string, end: string) {
  const months: Array<{ key: string; label: string; start: string; end: string }> = [];
  const cursor = parseDateKey(start);
  cursor.setDate(1);
  const last = parseDateKey(end);

  while (cursor <= last) {
    const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const key = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`;

    months.push({
      key,
      label: new Intl.DateTimeFormat(undefined, { month: "short" }).format(monthStart),
      start: toDateKey(monthStart),
      end: toDateKey(monthEnd),
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

function startOfWeek(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + mondayOffset);
  return date;
}

function parseDateKey(value: string) {
  return new Date(`${value}T00:00:00`);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shortDateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(parseDateKey(value));
}
