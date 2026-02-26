'use client';

import React from 'react';
import { Edit2, Sparkles, Check } from 'lucide-react';
import { OnboardingFormData } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OnboardingReviewProps {
  formData: OnboardingFormData;
  onEditStep: (step: number) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function OnboardingReview({ formData, onEditStep, onSubmit, isSubmitting }: OnboardingReviewProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Review & Confirm</h2>

      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Company Overview</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(1)} className="gap-1">
              <Edit2 size={16} /> Edit
            </Button>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Company Name</dt>
                <dd className="font-medium">{formData.companyName || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Industry</dt>
                <dd className="font-medium">{formData.domain || 'Not specified'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Mission</dt>
                <dd className="font-medium">{formData.mission || 'Not specified'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Tech Stack</dt>
                <dd className="flex flex-wrap gap-1">
                  {formData.techStack.length > 0
                    ? formData.techStack.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                      ))
                    : 'Not specified'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Roles & Skills</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(2)} className="gap-1">
              <Edit2 size={16} /> Edit
            </Button>
          </CardHeader>
          <CardContent>
            {formData.roles.length > 0 ? (
              <div className="space-y-3">
                {formData.roles.map((role, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {role.students} students • {role.level}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.skills?.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No roles configured</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Evaluation Metrics</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(3)} className="gap-1">
              <Edit2 size={16} /> Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formData.metrics.length > 0 ? (
                formData.metrics.map((metric) => (
                  <Badge key={metric} variant="secondary">{metric}</Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No metrics configured</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Company Policies</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(4)} className="gap-1">
              <Edit2 size={16} /> Edit
            </Button>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              {formData.policies.codingStandards && (
                <div>
                  <dt className="text-muted-foreground">Coding Standards</dt>
                  <dd className="font-medium whitespace-pre-wrap">{formData.policies.codingStandards}</dd>
                </div>
              )}
              {formData.policies.confidentialityGuidelines && (
                <div>
                  <dt className="text-muted-foreground">Confidentiality Guidelines</dt>
                  <dd className="font-medium whitespace-pre-wrap">{formData.policies.confidentialityGuidelines}</dd>
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.policies.enforceCodeReview && (
                  <Badge variant="outline" className="text-xs">Enforce code review</Badge>
                )}
                {formData.policies.requireDocs && (
                  <Badge variant="outline" className="text-xs">Require documentation</Badge>
                )}
                {formData.policies.conventionalCommits && (
                  <Badge variant="outline" className="text-xs">Use conventional commits</Badge>
                )}
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Advanced Inputs</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(5)} className="gap-1">
              <Edit2 size={16} /> Edit
            </Button>
          </CardHeader>
          <CardContent>
            <dl className="space-y-1 text-sm">
              {formData.advanced.projectBriefs && (
                <div>
                  <dt className="text-muted-foreground inline mr-2">Project Briefs:</dt>
                  <dd className="font-medium inline">{formData.advanced.projectBriefs}</dd>
                </div>
              )}
              {formData.advanced.codeExamples && (
                <div>
                  <dt className="text-muted-foreground inline mr-2">Code Examples:</dt>
                  <dd className="font-medium inline">{formData.advanced.codeExamples}</dd>
                </div>
              )}
              {formData.advanced.evaluationRubrics && (
                <div>
                  <dt className="text-muted-foreground inline mr-2">Evaluation Rubrics:</dt>
                  <dd className="font-medium inline">{formData.advanced.evaluationRubrics}</dd>
                </div>
              )}
              {!formData.advanced.projectBriefs &&
                !formData.advanced.codeExamples &&
                !formData.advanced.evaluationRubrics && (
                  <p className="text-muted-foreground text-sm">No advanced inputs provided</p>
                )}
            </dl>
          </CardContent>
        </Card>

        <Card className="border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles /> AI-Generated Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your virtual company is ready! We&apos;ve created {formData.roles.length} role
              {formData.roles.length !== 1 ? 's' : ''} with customized learning modules, project templates, and an
              evaluation pipeline.{' '}
              {formData.metrics.length > 0 &&
                ` Students will be evaluated on ${formData.metrics.length} key metrics.`}
            </p>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full gap-2"
              size="lg"
            >
              <Check size={20} /> {isSubmitting ? 'Publishing...' : 'Publish Company Environment'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
