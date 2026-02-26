'use client';

import React from 'react';
import { Check, Eye } from 'lucide-react';
import { OnboardingFormData } from './types';
import { METRIC_OPTIONS } from './constants';
import { Label } from '@/components/ui/label';

interface OnboardingEvaluationProps {
  formData: OnboardingFormData;
  onAddMetric: (metric: string) => void;
  onRemoveMetric: (metric: string) => void;
}

export function OnboardingEvaluation({ formData, onAddMetric, onRemoveMetric }: OnboardingEvaluationProps) {
  const toggleMetric = (metric: string) => {
    if (formData.metrics.includes(metric)) onRemoveMetric(metric);
    else onAddMetric(metric);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Evaluation & Metrics</h2>

      <div className="space-y-6">
        <div>
          <Label className="mb-3 block">
            Select Evaluation Metrics
            <span className="ml-2 text-xs text-muted-foreground font-normal">(AI recommended based on roles)</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {METRIC_OPTIONS.map((metric) => (
              <button
                key={metric}
                type="button"
                onClick={() => toggleMetric(metric)}
                className={`p-3 border-2 rounded-xl text-left transition ${
                  formData.metrics.includes(metric)
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-muted/50 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{metric}</span>
                  {formData.metrics.includes(metric) && <Check size={18} className="text-primary" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-muted/50 border rounded-xl">
          <label className="flex items-center gap-2 mb-3">
            <input type="checkbox" className="rounded border-input" />
            <span className="font-medium">Auto-rank students</span>
          </label>
          <label className="flex items-center gap-2 mb-3">
            <input type="checkbox" className="rounded border-input" />
            <span className="font-medium">Enable real-time dashboards</span>
          </label>
          <label className="flex items-center gap-2">
            <span className="font-medium">Feedback frequency:</span>
            <select className="px-3 py-1.5 rounded-md border border-input bg-background text-sm">
              <option>Daily</option>
              <option>Weekly</option>
              <option>After each project</option>
            </select>
          </label>
        </div>

        <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-r-xl">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Eye size={18} /> Preview Dashboard
          </h4>
          <div className="bg-muted/50 p-3 rounded-lg border">
            <div className="text-xs text-muted-foreground mb-2">Mock Dashboard Preview:</div>
            <div className="space-y-2">
              {formData.metrics.slice(0, 3).map((metric, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-24 text-xs text-muted-foreground">{metric}</div>
                  <div className="flex-1 bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: `${Math.random() * 60 + 40}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
