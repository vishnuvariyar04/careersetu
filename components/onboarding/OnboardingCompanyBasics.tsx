'use client';

import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { OnboardingFormData } from './types';
import { INDUSTRY_OPTIONS, TECH_STACK_OPTIONS } from './constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface OnboardingCompanyBasicsProps {
  formData: OnboardingFormData;
  showAISuggestion: boolean;
  onUpdate: (field: keyof OnboardingFormData, value: unknown) => void;
  onRemoveTag: (field: 'techStack' | 'metrics', tag: string) => void;
  onAddTag: (field: 'techStack' | 'metrics', tag: string) => void;
  onAiSuggestTechStack: () => void;
  onAiSuggestMission: () => void;
  onSetShowAISuggestion: (v: boolean) => void;
}

export function OnboardingCompanyBasics({
  formData,
  showAISuggestion,
  onUpdate,
  onRemoveTag,
  onAddTag,
  onAiSuggestTechStack,
  onAiSuggestMission,
  onSetShowAISuggestion,
}: OnboardingCompanyBasicsProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Company Basics</h2>

      <div className="space-y-6">
        <div>
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => onUpdate('companyName', e.target.value)}
            placeholder="e.g., TechFlow Inc."
            className="mt-2"
          />
        </div>

        <div>
          <Label className="mb-2 block">Industry / Domain *</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {INDUSTRY_OPTIONS.map((industry) => (
              <Button
                key={industry}
                type="button"
                variant={formData.domain === industry ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdate('domain', industry)}
                className="rounded-full"
              >
                {industry}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="mission">Mission Statement</Label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-6 text-xs"
              onClick={onAiSuggestMission}
            >
              <Sparkles size={12} /> AI Generate
            </Button>
          </div>
          <textarea
            id="mission"
            value={formData.mission}
            onChange={(e) => onUpdate('mission', e.target.value)}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            rows={3}
            placeholder="What's your company's mission?"
          />
        </div>

        <div>
          <Label htmlFor="employees">Number of Employees</Label>
          <Input
            id="employees"
            type="number"
            value={formData.employees}
            onChange={(e) => onUpdate('employees', e.target.value)}
            placeholder="e.g., 50"
            className="mt-2"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label>Tech Stack</Label>
            {formData.domain && !showAISuggestion && formData.techStack.length === 0 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-6 text-xs"
                onClick={() => onSetShowAISuggestion(true)}
              >
                <Sparkles size={12} /> AI Suggest
              </Button>
            )}
          </div>
          {showAISuggestion && (
            <div className="mb-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                💡 Based on &quot;{formData.domain}&quot;, we recommend these technologies:
              </p>
              <Button size="sm" onClick={onAiSuggestTechStack}>
                Apply Suggestions
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.techStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 rounded-full bg-primary/20 text-primary px-3 py-1 text-sm border border-primary/30"
              >
                {tech}
                <X size={14} className="cursor-pointer hover:text-destructive" onClick={() => onRemoveTag('techStack', tech)} />
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {TECH_STACK_OPTIONS.filter((t) => !formData.techStack.includes(t)).map((tech) => (
              <Button
                key={tech}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => onAddTag('techStack', tech)}
              >
                + {tech}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
