export type ScreenId = 'overview' | 'scraper' | 'tests' | 'issues' | 'pins' | 'trends';

export type Persona = 
  | 'standard_user' 
  | 'problem_user' 
  | 'performance_glitch_user' 
  | 'error_user' 
  | 'visual_user' 
  | 'locked_out_user';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus = 'open' | 'in_review' | 'fixed' | 'resolved';
export type IssueArea = 'PLP' | 'PDP' | 'Checkout Flow' | 'Auth' | 'Review Pin';

export interface DetectedIssue {
  id: string;
  key: string;
  title: string;
  area: IssueArea;
  severity: IssueSeverity;
  status: IssueStatus;
  firstSeen: string;
  lastSeen: string;
  persona: Persona;
  url: string;
  description: string;
  reproSteps: string[];
  expected: string;
  actual: string;
  screenshotThumbnail?: string;
  stackTrace?: string;
}

export interface ProductItem {
  id: number;
  name: string;
  price: number;
  extractedPriceStr: string;
  imgUrl: string;
  isBrokenImage: boolean;
  isDuplicateAsset: boolean;
  duplicateNote?: string;
  isPriceGlitch: boolean;
  missingDescription: boolean;
  location: string;
  deepLink: string;
  status: 'valid' | 'warning' | 'critical';
  statusLabel: string;
}

export interface TestStep {
  name: string;
  durationMs: number;
  status: 'passed' | 'failed' | 'running' | 'pending';
  error?: string;
  codeExcerpt?: string;
  screenshotThumbnail?: string;
}

export interface TestSuite {
  id: string;
  name: string;
  persona: Persona;
  status: 'passed' | 'failed' | 'running' | 'idle';
  totalDurationMs: number;
  steps: TestStep[];
}

export interface ReviewPin {
  id: string;
  xPercent: number;
  yPercent: number;
  title: string;
  description: string;
  severity: IssueSeverity;
  pageUrl: string;
  elementSelector: string;
  timestamp: string;
  author: string;
  status: IssueStatus;
}

export interface ExecutionRun {
  id: string;
  timestamp: string;
  persona: Persona;
  targetRoute: string;
  findings: string;
  status: 'passed' | 'failed' | 'warning';
  duration: string;
  suiteName: string;
}
