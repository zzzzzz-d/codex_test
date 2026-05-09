import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  FolderKanban,
  Home,
  ListFilter,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
} from "lucide-react";

const STORAGE_KEY = "codex-react-todos-v2";
const DEFAULT_DATE = "2026-05-09";

const initialTasks = [
  {
    id: "task-1",
    title: "完成产品周报",
    project: "工作",
    tag: "高优先级",
    time: "09:30 - 10:15",
    date: "2026-05-09",
    done: true,
    accent: "coral",
  },
  {
    id: "task-2",
    title: "设计待办小程序首页",
    project: "设计",
    tag: "设计",
    time: "11:00 - 12:00",
    date: "2026-05-09",
    done: false,
    accent: "violet",
  },
  {
    id: "task-3",
    title: "整理会议纪要",
    project: "工作",
    tag: "工作",
    time: "14:00 - 14:30",
    date: "2026-05-09",
    done: true,
    accent: "blue",
  },
  {
    id: "task-4",
    title: "晚上阅读 30 分钟",
    project: "生活",
    tag: "习惯",
    time: "20:30 - 21:00",
    date: "2026-05-09",
    done: false,
    accent: "green",
  },
  {
    id: "task-5",
    title: "复盘本周目标",
    project: "学习",
    tag: "复盘",
    time: "16:00 - 16:30",
    date: "2026-05-10",
    done: false,
    accent: "amber",
  },
];

const navItems = [
  { id: "today", label: "今日", icon: Home },
  { id: "projects", label: "项目", icon: FolderKanban },
  { id: "calendar", label: "日历", icon: CalendarDays },
  { id: "stats", label: "统计", icon: BarChart3 },
  { id: "settings", label: "设置", icon: Settings },
];

const projectMeta = {
  工作: { color: "blue", description: "会议、报告和团队协作" },
  设计: { color: "violet", description: "界面、体验和视觉检查" },
  生活: { color: "green", description: "家务、习惯和个人安排" },
  学习: { color: "amber", description: "阅读、课程和复盘" },
};

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialTasks;
  } catch {
    return initialTasks;
  }
}

function formatDateLabel(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function formatPageDate(dateText) {
  if (dateText === DEFAULT_DATE) return "今天的任务";
  const date = new Date(`${dateText}T00:00:00`);
  return `${date.getMonth() + 1}月${date.getDate()}日的任务`;
}

function dateFromMayDay(day) {
  return `2026-05-${String(day).padStart(2, "0")}`;
}

function App() {
  const [activePage, setActivePage] = useState("today");
  const [tasks, setTasks] = useState(loadTasks);
  const [taskText, setTaskText] = useState("");
  const [selectedProject, setSelectedProject] = useState("工作");
  const [selectedDate, setSelectedDate] = useState(DEFAULT_DATE);
  const [query, setQuery] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const stats = useMemo(() => {
    const done = tasks.filter((task) => task.done).length;
    const selectedDayTasks = tasks.filter((task) => task.date === selectedDate);
    return {
      total: tasks.length,
      done,
      active: tasks.length - done,
      rate: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
      todayDone: selectedDayTasks.filter((task) => task.done).length,
      todayTotal: selectedDayTasks.length,
    };
  }, [selectedDate, tasks]);

  const filteredTasks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return tasks;
    return tasks.filter((task) =>
      [task.title, task.project, task.tag, task.time].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [query, tasks]);

  const todayTasks = filteredTasks.filter((task) => task.date === selectedDate);

  const projects = useMemo(() => {
    return Object.keys(projectMeta).map((name) => {
      const items = tasks.filter((task) => task.project === name);
      const done = items.filter((task) => task.done).length;
      return {
        name,
        ...projectMeta[name],
        total: items.length,
        done,
        percent: items.length ? Math.round((done / items.length) * 100) : 0,
      };
    });
  }, [tasks]);

  function addTask(event) {
    event.preventDefault();
    const title = taskText.trim();
    if (!title) return;

    setTasks((current) => [
      {
        id: crypto.randomUUID(),
        title,
        project: selectedProject,
        tag: selectedProject,
        time: "今天",
        date: selectedDate,
        done: false,
        accent: projectMeta[selectedProject].color,
      },
      ...current,
    ]);
    setTaskText("");
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  return (
    <main className="app-shell">
      <section className="browser-frame" aria-label="待办小程序">
        <div className="browser-bar" aria-hidden="true">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
          <span className="address">todo.app / {navItems.find((item) => item.id === activePage)?.label}</span>
        </div>

        <div className="app-grid">
          <aside className="sidebar">
            <div>
              <p className="eyebrow">Today</p>
              <h1>待办轻清单</h1>
              <p className="sidebar-date">{formatDateLabel(selectedDate)}</p>
            </div>

            <form className="quick-add" onSubmit={addTask}>
              <input
                aria-label="新任务"
                value={taskText}
                onChange={(event) => setTaskText(event.target.value)}
                placeholder="添加任务"
              />
              <button type="submit" aria-label="添加任务">
                <Plus size={18} />
              </button>
            </form>

            <nav className="nav-list" aria-label="主导航">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={activePage === item.id ? "active" : ""}
                    onClick={() => setActivePage(item.id)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    <ChevronRight size={16} />
                  </button>
                );
              })}
            </nav>

            <div className="completion-card">
              <strong>{stats.rate}%</strong>
              <span>整体完成率</span>
            </div>
          </aside>

          <section className="workspace">
            <header className="topbar">
              <div>
                <p className="eyebrow">Todo Mini</p>
                <h2>{pageTitle(activePage, selectedDate)}</h2>
              </div>
              <label className="search-box">
                <Search size={18} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索任务、标签或时间"
                />
              </label>
            </header>

            {activePage === "today" && (
              <TodayPage
                tasks={todayTasks}
                calendarTasks={tasks}
                stats={stats}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                toggleTask={toggleTask}
                deleteTask={deleteTask}
              />
            )}
            {activePage === "projects" && (
              <ProjectsPage projects={projects} tasks={filteredTasks} />
            )}
            {activePage === "calendar" && <CalendarPage tasks={filteredTasks} />}
            {activePage === "stats" && <StatsPage projects={projects} stats={stats} />}
            {activePage === "settings" && <SettingsPage />}
          </section>
        </div>
      </section>
    </main>
  );
}

function pageTitle(page, selectedDate) {
  const titles = {
    today: formatPageDate(selectedDate),
    projects: "项目清单",
    calendar: "日历视图",
    stats: "效率统计",
    settings: "偏好设置",
  };
  return titles[page];
}

function TodayPage({
  tasks,
  calendarTasks,
  stats,
  selectedDate,
  setSelectedDate,
  selectedProject,
  setSelectedProject,
  toggleTask,
  deleteTask,
}) {
  return (
    <div className="content-layout">
      <section className="task-column">
        <div className="section-toolbar">
          <div>
            <p>{stats.todayTotal} 个任务，已完成 {stats.todayDone} 个</p>
          </div>
          <div className="filter-chip">
            <ListFilter size={16} />
            按优先级排序
          </div>
        </div>

        <div className="project-tabs" role="tablist" aria-label="任务项目">
          {Object.keys(projectMeta).map((project) => (
            <button
              key={project}
              type="button"
              className={selectedProject === project ? "active" : ""}
              onClick={() => setSelectedProject(project)}
            >
              {project}
            </button>
          ))}
        </div>

        <ul className="task-list" aria-label={`${formatDateLabel(selectedDate)}任务列表`}>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
            />
          ))}
        </ul>
        {tasks.length === 0 && (
          <div className="empty-state">
            <CalendarDays size={22} />
            <strong>{formatDateLabel(selectedDate)}暂无任务</strong>
            <span>可以在左侧输入框为这一天添加一条新任务。</span>
          </div>
        )}
      </section>

      <aside className="insight-column">
        <MiniCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          tasks={calendarTasks}
        />
        <div className="progress-panel">
          <div>
            <span>当天进度</span>
            <strong>{stats.todayDone} / {stats.todayTotal}</strong>
          </div>
          <div className="meter">
            <i style={{ width: `${stats.todayTotal ? (stats.todayDone / stats.todayTotal) * 100 : 0}%` }} />
          </div>
        </div>
        <div className="focus-note">
          <Sparkles size={20} />
          <div>
            <strong>小步快跑</strong>
            <span>先完成一个 15 分钟任务，再继续推进。</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className={`task-card ${task.done ? "done" : ""} ${task.accent}`}>
      <span className="accent-line" />
      <button
        type="button"
        className="check-button"
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? "标记为未完成" : "标记为已完成"}
      >
        {task.done ? <Check size={17} /> : <Circle size={17} />}
      </button>
      <div className="task-copy">
        <strong>{task.title}</strong>
        <span>
          <Clock3 size={14} />
          {task.time} · {task.project}
        </span>
      </div>
      <span className={`tag ${task.accent}`}>{task.tag}</span>
      <button
        type="button"
        className="delete-button"
        onClick={() => onDelete(task.id)}
        aria-label="删除任务"
      >
        <Trash2 size={17} />
      </button>
    </li>
  );
}

function ProjectsPage({ projects, tasks }) {
  return (
    <div className="page-stack">
      <div className="project-grid">
        {projects.map((project) => (
          <article key={project.name} className={`project-card ${project.color}`}>
            <span>{project.name}</span>
            <strong>{project.total} 个任务</strong>
            <p>{project.description}</p>
            <div className="meter">
              <i style={{ width: `${project.percent}%` }} />
            </div>
          </article>
        ))}
      </div>
      <section className="wide-panel">
        <h3>最近任务</h3>
        <ul className="compact-list">
          {tasks.slice(0, 6).map((task) => (
            <li key={task.id}>
              <span className={`status-dot ${task.accent}`} />
              <strong>{task.title}</strong>
              <em>{task.project}</em>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function CalendarPage({ tasks }) {
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  return (
    <div className="calendar-page">
      <section className="calendar-board">
        <div className="calendar-heading">
          <h3>2026 年 5 月</h3>
          <span>按日期查看安排</span>
        </div>
        <div className="week-row">
          {["一", "二", "三", "四", "五", "六", "日"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {days.map((day) => {
            const dayTasks = tasks.filter((task) => Number(task.date.slice(-2)) === day);
            return (
              <div key={day} className={day === 9 ? "today" : ""}>
                <strong>{day}</strong>
                {dayTasks.slice(0, 2).map((task) => (
                  <span key={task.id}>{task.title}</span>
                ))}
              </div>
            );
          })}
        </div>
      </section>
      <aside className="schedule-panel">
        <h3>5 月 9 日</h3>
        {tasks
          .filter((task) => task.date === "2026-05-09")
          .map((task) => (
            <p key={task.id}>
              <strong>{task.time}</strong>
              {task.title}
            </p>
          ))}
      </aside>
    </div>
  );
}

function StatsPage({ projects, stats }) {
  return (
    <div className="stats-page">
      <div className="stat-tile">
        <span>总任务</span>
        <strong>{stats.total}</strong>
      </div>
      <div className="stat-tile">
        <span>已完成</span>
        <strong>{stats.done}</strong>
      </div>
      <div className="stat-tile">
        <span>进行中</span>
        <strong>{stats.active}</strong>
      </div>
      <section className="wide-panel chart-panel">
        <h3>项目完成率</h3>
        {projects.map((project) => (
          <div key={project.name} className="chart-row">
            <span>{project.name}</span>
            <div className="meter">
              <i style={{ width: `${project.percent}%` }} />
            </div>
            <em>{project.percent}%</em>
          </div>
        ))}
      </section>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="settings-page">
      {[
        ["每日提醒", "08:30 推送当天待办", true],
        ["自动归档", "完成任务 7 天后收起", true],
        ["专注模式", "隐藏低优先级任务", false],
      ].map(([title, detail, enabled]) => (
        <section key={title} className="setting-row">
          <div>
            <strong>{title}</strong>
            <span>{detail}</span>
          </div>
          <button type="button" className={enabled ? "switch on" : "switch"} aria-label={title}>
            <span />
          </button>
        </section>
      ))}
    </div>
  );
}

function MiniCalendar({ selectedDate, onSelectDate, tasks }) {
  const taskDates = useMemo(
    () => new Set(tasks.map((task) => task.date)),
    [tasks],
  );

  return (
    <div className="mini-calendar">
      <h3>本周概览</h3>
      <p>May 2026</p>
      <div className="week-row">
        {["一", "二", "三", "四", "五", "六", "日"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mini-days">
        {Array.from({ length: 28 }, (_, index) => index + 1).map((day) => {
          const date = dateFromMayDay(day);
          const isSelected = selectedDate === date;
          const hasTasks = taskDates.has(date);
          return (
            <button
              key={day}
              type="button"
              className={`${isSelected ? "active" : ""} ${hasTasks ? "has-tasks" : ""}`}
              onClick={() => onSelectDate(date)}
              aria-pressed={isSelected}
              aria-label={`选择5月${day}日${hasTasks ? "，有任务" : ""}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default App;
