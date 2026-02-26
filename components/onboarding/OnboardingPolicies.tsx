'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { OnboardingFormData } from './types';
import { Label } from '@/components/ui/label';

interface OnboardingPoliciesProps {
  formData: OnboardingFormData;
  onPolicyChange: (field: string, value: string | boolean) => void;
}

const textareaClass = "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-2";

export function OnboardingPolicies({ formData, onPolicyChange }: OnboardingPoliciesProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Company Policies (Optional)</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="codingStandards">Coding Standards</Label>
          <textarea
            id="codingStandards"
            value={formData.policies.codingStandards}
            onChange={(e) => onPolicyChange('codingStandards', e.target.value)}
            className={textareaClass}
            rows={3}
            placeholder="e.g., Follow PEP 8 for Python, use ESLint for JavaScript..."
          />
        </div>

        <div>
          <Label htmlFor="confidentiality">Confidentiality Guidelines</Label>
          <textarea
            id="confidentiality"
            value={formData.policies.confidentialityGuidelines}
            onChange={(e) => onPolicyChange('confidentialityGuidelines', e.target.value)}
            className={textareaClass}
            rows={3}
            placeholder="e.g., All project data is confidential..."
          />
        </div>

        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles size={18} /> AI-Suggested Policies
          </h4>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-input"
                checked={formData.policies.enforceCodeReview}
                onChange={(e) => onPolicyChange('enforceCodeReview', e.target.checked)}
              />
              <span>Enforce code review before merging</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-input"
                checked={formData.policies.requireDocs}
                onChange={(e) => onPolicyChange('requireDocs', e.target.checked)}
              />
              <span>Require documentation for all functions</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-input"
                checked={formData.policies.conventionalCommits}
                onChange={(e) => onPolicyChange('conventionalCommits', e.target.checked)}
              />
              <span>Use conventional commit messages</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
