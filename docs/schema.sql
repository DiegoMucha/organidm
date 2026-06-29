CREATE TABLE task_groups (
  id varchar(64) PRIMARY KEY,
  name text NOT NULL,
  icon_placeholder text NOT NULL,
  color text NOT NULL DEFAULT '#2563eb',
  created_at timestamp NOT NULL
);

CREATE TABLE tasks (
  id varchar(64) PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  task_group_id varchar(64),
  due_date timestamp,
  priority integer NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL,
  FOREIGN KEY (task_group_id) REFERENCES task_groups(id) ON DELETE SET NULL
);

CREATE TABLE calendar_events (
  id varchar(64) PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  task_group_id varchar(64),
  event_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL,
  CONSTRAINT calendar_events_valid_time CHECK (end_time > start_time),
  FOREIGN KEY (task_group_id) REFERENCES task_groups(id) ON DELETE SET NULL
);

CREATE TABLE research_papers (
  id varchar(64) PRIMARY KEY,
  title text NOT NULL,
  authors text NOT NULL DEFAULT '',
  venue text NOT NULL DEFAULT '',
  publication_year text NOT NULL DEFAULT '',
  abstract text NOT NULL DEFAULT '',
  paper_url text NOT NULL DEFAULT '',
  review_url text NOT NULL DEFAULT '',
  implementation_url text NOT NULL DEFAULT '',
  training_repo_url text NOT NULL DEFAULT '',
  conclusion text NOT NULL DEFAULT '',
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL
);

CREATE INDEX idx_tasks_task_group_id ON tasks(task_group_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_calendar_events_task_group_id ON calendar_events(task_group_id);
CREATE INDEX idx_calendar_events_event_date ON calendar_events(event_date);
CREATE INDEX idx_research_papers_updated_at ON research_papers(updated_at);
