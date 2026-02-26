'use client';

import React from 'react';
import { Upload } from 'lucide-react';
import { OnboardingFormData } from './types';

interface OnboardingAdvancedProps {
  formData: OnboardingFormData;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
}

export function OnboardingAdvanced({ formData, onFileChange }: OnboardingAdvancedProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Advanced Inputs (Optional)</h2>

      <div className="space-y-6">
        <label className="p-6 border-2 border-dashed border-border rounded-xl text-center hover:border-primary/50 hover:bg-muted/50 transition cursor-pointer block">
          <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
          <p className="font-medium mb-1">Upload Project Briefs</p>
          <p className="text-sm text-muted-foreground">
            {formData.advanced.projectBriefs || 'PDF, DOCX, or TXT files'}
          </p>
          <input
            type="file"
            className="hidden"
            onChange={(e) => onFileChange(e, 'projectBriefs')}
            accept=".pdf,.docx,.txt"
          />
        </label>

        <label className="p-6 border-2 border-dashed border-border rounded-xl text-center hover:border-primary/50 hover:bg-muted/50 transition cursor-pointer block">
          <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
          <p className="font-medium mb-1">Upload Code Examples</p>
          <p className="text-sm text-muted-foreground">
            {formData.advanced.codeExamples || 'ZIP, GitHub repo, or individual files'}
          </p>
          <input type="file" className="hidden" onChange={(e) => onFileChange(e, 'codeExamples')} />
        </label>

        <label className="p-6 border-2 border-dashed border-border rounded-xl text-center hover:border-primary/50 hover:bg-muted/50 transition cursor-pointer block">
          <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
          <p className="font-medium mb-1">Upload Evaluation Rubrics</p>
          <p className="text-sm text-muted-foreground">
            {formData.advanced.evaluationRubrics || 'Excel, CSV, or PDF'}
          </p>
          <input
            type="file"
            className="hidden"
            onChange={(e) => onFileChange(e, 'evaluationRubrics')}
            accept=".xlsx,.csv,.pdf"
          />
        </label>

        <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-r-xl">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">💡 AI Integration:</strong> Uploaded content will be automatically parsed and integrated
            into learning modules, projects, and evaluation criteria.
          </p>
        </div>
      </div>
    </div>
  );
}
