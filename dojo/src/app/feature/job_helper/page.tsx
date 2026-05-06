"use client";
import { CopilotKit, useCoAgent, useCopilotAction } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useState } from "react";
import "@copilotkit/react-ui/styles.css";
import "./style.css";

type Grade = "A" | "B" | "C" | "D" | "F";
type JobStatus = "inbox" | "applied" | "interview" | "offer" | "rejected";

interface Dimension {
  name: string;
  score: number;
}

interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  salary_range: string;
  grade: Grade;
  score: number;
  status: JobStatus;
  notes: string;
  tags: string[];
  dimensions: Dimension[];
}

interface JobHelperState {
  jobs: Job[];
}

const SAMPLE_JOBS: Job[] = [
  {
    id: "1",
    company: "Anthropic",
    role: "Senior ML Engineer",
    location: "San Francisco, CA",
    salary_range: "$200k – $280k",
    grade: "A",
    score: 9.2,
    status: "interview",
    notes: "Great alignment with AI safety mission. Strong Python/ML requirements match background well.",
    tags: ["AI/ML", "Python", "Research"],
    dimensions: [
      { name: "Role Fit", score: 9.5 },
      { name: "Culture Match", score: 9.0 },
      { name: "Growth Potential", score: 9.5 },
      { name: "Compensation", score: 9.0 },
      { name: "Work-Life Balance", score: 8.5 },
    ],
  },
  {
    id: "2",
    company: "Vercel",
    role: "Staff Engineer – Infrastructure",
    location: "Remote",
    salary_range: "$190k – $260k",
    grade: "A",
    score: 8.8,
    status: "applied",
    notes: "Excellent remote culture. Strong infra focus with great team reputation.",
    tags: ["Infrastructure", "TypeScript", "Remote"],
    dimensions: [
      { name: "Role Fit", score: 8.5 },
      { name: "Culture Match", score: 9.5 },
      { name: "Growth Potential", score: 9.0 },
      { name: "Compensation", score: 8.5 },
      { name: "Work-Life Balance", score: 9.0 },
    ],
  },
  {
    id: "3",
    company: "OpenAI",
    role: "Software Engineer – Applied AI",
    location: "San Francisco, CA",
    salary_range: "$180k – $250k",
    grade: "B",
    score: 7.4,
    status: "inbox",
    notes: "Fast-paced environment. Good mission alignment but some travel required.",
    tags: ["AI/ML", "TypeScript", "Python"],
    dimensions: [
      { name: "Role Fit", score: 8.0 },
      { name: "Culture Match", score: 7.5 },
      { name: "Growth Potential", score: 8.0 },
      { name: "Compensation", score: 7.5 },
      { name: "Work-Life Balance", score: 6.0 },
    ],
  },
];

const INITIAL_STATE: JobHelperState = { jobs: SAMPLE_JOBS };

const GRADE_STYLES: Record<Grade, string> = {
  A: "grade-a",
  B: "grade-b",
  C: "grade-c",
  D: "grade-d",
  F: "grade-f",
};

const STATUS_CONFIG: Record<JobStatus, { label: string; dotClass: string }> = {
  inbox: { label: "Inbox", dotClass: "dot-gray" },
  applied: { label: "Applied", dotClass: "dot-blue" },
  interview: { label: "Interview", dotClass: "dot-purple" },
  offer: { label: "Offer", dotClass: "dot-green" },
  rejected: { label: "Rejected", dotClass: "dot-red" },
};

const ALL_STATUSES: JobStatus[] = ["inbox", "applied", "interview", "offer", "rejected"];

export default function JobHelper() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" showDevConsole={false} agent="jobHelperAgent">
      <div className="job-helper-root">
        <Dashboard />
        <CopilotSidebar
          defaultOpen={true}
          labels={{
            title: "Job Search AI",
            initial:
              "Hi! I'm your AI-powered job search assistant inspired by career-ops.\n\nPaste a job description and I'll evaluate it with an A–F grade across 5 key dimensions:\n• Role Fit\n• Culture Match\n• Growth Potential\n• Compensation\n• Work-Life Balance\n\nI can also help move jobs through your pipeline. Try: \"Move Vercel to interview stage\"",
          }}
          clickOutsideToClose={false}
        />
      </div>
    </CopilotKit>
  );
}

function Dashboard() {
  const { state: agentState, setState: setAgentState } = useCoAgent<JobHelperState>({
    name: "jobHelperAgent",
    initialState: INITIAL_STATE,
  });

  const [localJobs, setLocalJobs] = useState<Job[]>(INITIAL_STATE.jobs);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  const syncJobs = (jobs: Job[]) => {
    setLocalJobs(jobs);
    setAgentState({ jobs });
  };

  const handleStatusChange = (jobId: string, status: JobStatus) => {
    syncJobs(localJobs.map((j) => (j.id === jobId ? { ...j, status } : j)));
    if (selectedJob?.id === jobId) setSelectedJob((s) => s && { ...s, status });
  };

  useCopilotAction({
    name: "evaluate_job",
    description:
      "Evaluate a job listing and add it to the pipeline with an A-F grade. Use this whenever the user pastes a job description.",
    parameters: [
      { name: "company", type: "string", description: "Company name" },
      { name: "role", type: "string", description: "Job title / role" },
      { name: "location", type: "string", description: "Job location" },
      { name: "salary_range", type: "string", description: "Salary range (e.g. $120k – $160k)" },
      {
        name: "grade",
        type: "string",
        description: "Overall grade: A (excellent), B (good), C (moderate), D (poor), F (skip)",
      },
      { name: "score", type: "number", description: "Overall score 1–10" },
      { name: "notes", type: "string", description: "Short evaluation summary" },
      { name: "tags", type: "string[]", description: "Key skills or tags" },
      {
        name: "dimensions",
        type: "object[]",
        description: "5 evaluation dimensions with scores",
        attributes: [
          { name: "name", type: "string" },
          { name: "score", type: "number" },
        ],
      },
    ],
    followUp: false,
    handler: async (jobData: any) => {
      const newJob: Job = {
        id: Date.now().toString(),
        status: "inbox",
        company: jobData.company ?? "",
        role: jobData.role ?? "",
        location: jobData.location ?? "",
        salary_range: jobData.salary_range ?? "",
        grade: (jobData.grade as Grade) ?? "C",
        score: jobData.score ?? 5,
        notes: jobData.notes ?? "",
        tags: jobData.tags ?? [],
        dimensions: jobData.dimensions ?? [],
      };
      setFlashId(newJob.id);
      syncJobs([...localJobs, newJob]);
      setTimeout(() => setFlashId(null), 2000);
      return "Job evaluated and added to your pipeline.";
    },
    render: ({ args, status }) => <EvaluationCard job={args} status={status} />,
  });

  useCopilotAction({
    name: "update_job_status",
    description: "Move a job to a different pipeline stage",
    parameters: [
      { name: "company", type: "string", description: "Company name to identify the job" },
      {
        name: "status",
        type: "string",
        description: "New pipeline stage",
        enum: ["inbox", "applied", "interview", "offer", "rejected"],
      },
    ],
    followUp: false,
    handler: async ({ company, status }: { company: string; status: string }) => {
      const job = localJobs.find((j) =>
        j.company.toLowerCase().includes(company.toLowerCase())
      );
      if (job) handleStatusChange(job.id, status as JobStatus);
      return job ? `Moved ${job.company} to ${status}.` : "Job not found in pipeline.";
    },
  });

  const gradeCount = (grade: Grade) => localJobs.filter((j) => j.grade === grade).length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Job Pipeline</h1>
          <p className="dashboard-subtitle">
            AI-powered job evaluation — paste a job description in the chat to evaluate it
          </p>
        </div>
        <div className="grade-stats">
          {(["A", "B", "C", "D", "F"] as Grade[]).map((grade) => (
            <div key={grade} className="grade-stat-pill">
              <span className={`grade-badge ${GRADE_STYLES[grade]}`}>{grade}</span>
              <span className="grade-stat-count">{gradeCount(grade)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pipeline">
        {ALL_STATUSES.map((stage) => {
          const stageJobs = localJobs.filter((j) => j.status === stage);
          return (
            <div key={stage} className="pipeline-stage">
              <div className="stage-header">
                <span className={`stage-dot ${STATUS_CONFIG[stage].dotClass}`} />
                <span className="stage-label">{STATUS_CONFIG[stage].label}</span>
                <span className="stage-count">{stageJobs.length}</span>
              </div>
              {stageJobs.length === 0 ? (
                <p className="stage-empty">No jobs yet</p>
              ) : (
                stageJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isNew={job.id === flashId}
                    isSelected={selectedJob?.id === job.id}
                    onClick={() =>
                      setSelectedJob((prev) => (prev?.id === job.id ? null : job))
                    }
                    onStatusChange={(s) => handleStatusChange(job.id, s)}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>

      {selectedJob && (
        <JobDetailPanel
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onStatusChange={(s) => handleStatusChange(selectedJob.id, s)}
        />
      )}
    </div>
  );
}

interface JobCardProps {
  job: Job;
  isNew: boolean;
  isSelected: boolean;
  onClick: () => void;
  onStatusChange: (s: JobStatus) => void;
}

function JobCard({ job, isNew, isSelected, onClick, onStatusChange }: JobCardProps) {
  return (
    <div
      className={`job-card ${isNew ? "job-card-new" : ""} ${isSelected ? "job-card-selected" : ""}`}
      onClick={onClick}
    >
      <div className="job-card-top">
        <div className="job-card-info">
          <p className="job-company">{job.company}</p>
          <p className="job-role">{job.role}</p>
          <p className="job-location">{job.location}</p>
        </div>
        <div className="job-card-meta">
          <span className={`grade-badge ${GRADE_STYLES[job.grade]}`}>{job.grade}</span>
          <span className="job-score">{job.score.toFixed(1)}</span>
        </div>
      </div>
      <div className="job-tags">
        {job.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="job-card-actions" onClick={(e) => e.stopPropagation()}>
        <select
          className="status-select"
          value={job.status}
          onChange={(e) => onStatusChange(e.target.value as JobStatus)}
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

interface JobDetailPanelProps {
  job: Job;
  onClose: () => void;
  onStatusChange: (s: JobStatus) => void;
}

function JobDetailPanel({ job, onClose, onStatusChange }: JobDetailPanelProps) {
  return (
    <div className="detail-panel">
      <div className="detail-panel-header">
        <div>
          <h2 className="detail-company">{job.company}</h2>
          <p className="detail-role">{job.role}</p>
        </div>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="detail-meta">
        <span>{job.location}</span>
        <span>•</span>
        <span>{job.salary_range}</span>
        <span>•</span>
        <span className={`grade-badge ${GRADE_STYLES[job.grade]}`}>Grade {job.grade}</span>
        <span className="job-score">{job.score.toFixed(1)} / 10</span>
      </div>

      <div className="detail-section">
        <h3 className="detail-section-title">Evaluation Dimensions</h3>
        {job.dimensions.map((dim) => (
          <div key={dim.name} className="dimension-row">
            <span className="dimension-name">{dim.name}</span>
            <div className="dimension-bar-track">
              <div
                className="dimension-bar-fill"
                style={{ width: `${(dim.score / 10) * 100}%` }}
              />
            </div>
            <span className="dimension-score">{dim.score.toFixed(1)}</span>
          </div>
        ))}
      </div>

      <div className="detail-section">
        <h3 className="detail-section-title">Notes</h3>
        <p className="detail-notes">{job.notes}</p>
      </div>

      <div className="detail-section">
        <h3 className="detail-section-title">Move to Stage</h3>
        <div className="stage-buttons">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              className={`stage-btn ${job.status === s ? "stage-btn-active" : ""}`}
              onClick={() => onStatusChange(s)}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface EvaluationCardProps {
  job: Partial<Job>;
  status: string;
}

function EvaluationCard({ job, status }: EvaluationCardProps) {
  if (!job.company && !job.role) return null;

  const grade = (job.grade as Grade) ?? "C";
  const score = job.score ?? 0;

  return (
    <div className="eval-card">
      <div className="eval-card-header">
        <div>
          <p className="eval-company">{job.company}</p>
          <p className="eval-role">{job.role}</p>
        </div>
        <div className="eval-grade-block">
          <span className={`grade-badge grade-badge-lg ${GRADE_STYLES[grade]}`}>{grade}</span>
          {score > 0 && <span className="eval-score">{score.toFixed(1)}</span>}
        </div>
      </div>

      {job.location && (
        <p className="eval-location">
          {job.location}
          {job.salary_range ? ` · ${job.salary_range}` : ""}
        </p>
      )}

      {job.dimensions && job.dimensions.length > 0 && (
        <div className="eval-dimensions">
          {job.dimensions.map((dim: Dimension) => (
            <div key={dim.name} className="eval-dim-row">
              <span className="eval-dim-name">{dim.name}</span>
              <div className="eval-dim-bar-track">
                <div
                  className={`eval-dim-bar-fill ${status === "inProgress" ? "animating" : ""}`}
                  style={{ width: `${(dim.score / 10) * 100}%` }}
                />
              </div>
              <span className="eval-dim-score">{dim.score.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}

      {job.notes && <p className="eval-notes">{job.notes}</p>}

      {job.tags && job.tags.length > 0 && (
        <div className="job-tags" style={{ marginTop: 8 }}>
          {job.tags.map((tag: string) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {status === "inProgress" && (
        <div className="eval-loading">
          <Spinner /> Evaluating…
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="spinner"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
