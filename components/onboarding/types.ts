export interface OnboardingFormData {
  companyName: string;
  domain: string;
  mission: string;
  vision: string;
  employees: string;
  techStack: string[];
  roles: OnboardingRole[];
  metrics: string[];
  policies: {
    codingStandards: string;
    confidentialityGuidelines: string;
    enforceCodeReview: boolean;
    requireDocs: boolean;
    conventionalCommits: boolean;
  };
  advanced: {
    projectBriefs: string | null;
    codeExamples: string | null;
    evaluationRubrics: string | null;
  };
}

export interface OnboardingRole {
  name: string;
  skills: string[];
  level: string;
  students: number | string;
}

export const INITIAL_FORM_DATA: OnboardingFormData = {
  companyName: '',
  domain: '',
  mission: '',
  vision: '',
  employees: '',
  techStack: [],
  roles: [],
  metrics: [],
  policies: {
    codingStandards: '',
    confidentialityGuidelines: '',
    enforceCodeReview: false,
    requireDocs: false,
    conventionalCommits: false,
  },
  advanced: {
    projectBriefs: null,
    codeExamples: null,
    evaluationRubrics: null,
  },
};

export interface CompanyDbRow {
  company_id: string;
  name?: string | null;
  industry?: string | null;
  mission?: string | null;
  vision?: string | null;
  employee_count?: number | null;
  tech_stack?: string[] | null;
  evaluation_metrics?: string[] | null;
  policies?: Record<string, unknown> | null;
  onboarding_advanced?: {
    roles?: OnboardingRole[];
    projectBriefs?: string | null;
    codeExamples?: string | null;
    evaluationRubrics?: string | null;
  } | null;
}

/** Map a companies table row to OnboardingFormData for pre-filling forms */
export function dbRowToOnboardingFormData(row: CompanyDbRow | null): OnboardingFormData {
  if (!row) return { ...INITIAL_FORM_DATA };
  const adv = row.onboarding_advanced;
  const pol = row.policies as OnboardingFormData['policies'] | undefined;
  return {
    companyName: row.name ?? '',
    domain: row.industry ?? '',
    mission: row.mission ?? '',
    vision: row.vision ?? '',
    employees: row.employee_count != null ? String(row.employee_count) : '',
    techStack: row.tech_stack ?? [],
    roles: adv?.roles ?? [],
    metrics: row.evaluation_metrics ?? [],
    policies: pol
      ? {
          codingStandards: pol.codingStandards ?? '',
          confidentialityGuidelines: pol.confidentialityGuidelines ?? '',
          enforceCodeReview: pol.enforceCodeReview ?? false,
          requireDocs: pol.requireDocs ?? false,
          conventionalCommits: pol.conventionalCommits ?? false,
        }
      : INITIAL_FORM_DATA.policies,
    advanced: {
      projectBriefs: adv?.projectBriefs ?? null,
      codeExamples: adv?.codeExamples ?? null,
      evaluationRubrics: adv?.evaluationRubrics ?? null,
    },
  };
}
