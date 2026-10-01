export type UserRole = 'reporter' | 'developer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export type BugStatus =
  | 'submitted'
  | 'clarifying'
  | 'triaging'
  | 'reproduced'
  | 'routed'
  | 'closed'
  | 'duplicate';

export type BugSeverity = 'critical' | 'high' | 'medium' | 'low';
export type BugPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface Component {
  id: string;
  name: string;
  description: string;
  owner_team: string;
  owner_developer_id?: string | null;
}

export interface TriageSummary {
  title: string;
  clean_description: string;
  steps_to_reproduce: string[];
  expected_result: string;
  actual_result: string;
  environment: string;
}

export interface TriageAgentOutput {
  summary: TriageSummary;
  is_complete: boolean;
  missing_fields: string[];
  clarifying_questions: string[];
  reasoning: string;
}

export interface PotentialDuplicate {
  bug_id: string;
  title: string;
  similarity_score: number;
  reason: string;
}

export interface SuggestedComponent {
  component_id?: string | null;
  name: string;
  confidence: number;
  reason: string;
}

export interface IntelligenceAgentOutput {
  potential_duplicates: PotentialDuplicate[];
  suggested_components: SuggestedComponent[];
  severity: BugSeverity;
  priority: BugPriority;
  reasoning: string;
}

export interface ReproductionEvidenceItem {
  type: 'screenshot' | 'console_log' | 'network' | 'script';
  path: string;
  description: string;
}

export interface ReproductionAgentOutput {
  reproduction_status: 'reproduced' | 'partial' | 'could_not_reproduce' | 'needs_manual' | 'script_only';
  generated_selenium_script: string;
  evidence: ReproductionEvidenceItem[];
  execution_log: string;
  reasoning: string;
}

export interface RoutingAgentOutput {
  is_regression: boolean;
  regression_reason: string;
  assigned_developer_id?: string | null;
  assigned_developer_name?: string | null;
  assigned_team: string;
  final_triage_summary: string;
  recommended_actions: string[];
  reasoning: string;
}

export interface AgentAction {
  id: string;
  triage_run_id: string;
  agent_name: 'triage' | 'intelligence' | 'reproduction' | 'routing';
  input_data?: any;
  output_data?: any;
  reasoning?: string;
  created_at: string;
}

export type TriageRunStatus = 'running' | 'waiting_for_user' | 'completed' | 'failed';

export interface TriageRun {
  id: string;
  bug_id: string;
  status: TriageRunStatus;
  full_report?: {
    triage_agent?: TriageAgentOutput;
    intelligence_agent?: IntelligenceAgentOutput;
    reproduction_agent?: ReproductionAgentOutput;
    routing_agent?: RoutingAgentOutput;
    summary_markdown?: string;
  } | null;
  started_at: string;
  completed_at?: string | null;
  actions: AgentAction[];
}

export interface DuplicateMatch {
  id: string;
  bug_id: string;
  matched_bug_id: string;
  similarity_score: number;
  confirmed?: boolean | null;
  matched_bug_title?: string | null;
  matched_bug_status?: string | null;
}

export interface Evidence {
  id: string;
  bug_id: string;
  type: string;
  file_path: string;
  metadata_json?: Record<string, any>;
}

export interface ClarificationMessage {
  id: string;
  bug_id: string;
  sender: 'agent' | 'user';
  message: string;
  created_at: string;
}

export interface Feedback {
  id: string;
  bug_id: string;
  developer_id: string;
  rating_summary: number;
  rating_duplicate: number;
  rating_component: number;
  rating_reproduction: number;
  comments?: string | null;
  created_at: string;
}

export interface Bug {
  id: string;
  title: string;
  raw_description: string;
  structured_data?: any;
  status: BugStatus;
  severity: BugSeverity;
  priority: BugPriority;
  reporter_id: string;
  assigned_to?: string | null;
  component_id?: string | null;
  created_at: string;
  updated_at: string;
  reporter?: User;
  assignee?: User;
  component?: Component;
  duplicate_matches?: DuplicateMatch[];
  evidences?: Evidence[];
  clarification_messages?: ClarificationMessage[];
  triage_runs?: TriageRun[];
}

export interface AdminStats {
  total_bugs: number;
  triaged_bugs: number;
  reproduced_bugs: number;
  duplicate_bugs: number;
  total_components: number;
  avg_accuracy_rating: number;
  avg_reproduction_rating: number;
  demo_mode: boolean;
}
