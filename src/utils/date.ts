export function todayInputValue() {
  return toInputValue(new Date());
}

export function tomorrowInputValue() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toInputValue(date);
}

export function datePart(value?: string) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export function toDateTimeInputValue(value?: string) {
  if (!value) {
    return "";
  }

  if (value.length === 10) {
    return `${value}T09:00`;
  }

  return value.slice(0, 16);
}

export function formatDueDate(value?: string) {
  if (!value) {
    return "No due date";
  }

  const date = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
  const hasTime = value.includes("T");

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(hasTime
      ? {
          hour: "numeric",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
}

function toInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
