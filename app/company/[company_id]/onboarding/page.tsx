'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  INITIAL_FORM_DATA,
  OnboardingFormData,
  STEPS,
  dbRowToOnboardingFormData,
  OnboardingStepper,
  OnboardingWelcome,
  OnboardingCompanyBasics,
  OnboardingJobRoles,
  OnboardingEvaluation,
  OnboardingPolicies,
  OnboardingAdvanced,
  OnboardingReview,
} from '@/components/onboarding';

export default function OnboardingWizard() {
  const params = useParams<{ company_id: string }>();
  const router = useRouter();
  const companyId = params.company_id;
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>(INITIAL_FORM_DATA);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      let usedDbData = false;
      if (companyId) {
        const { data: row } = await supabase
          .from('companies')
          .select('name, industry, mission, vision, employee_count, evaluation_metrics, policies, onboarding_advanced')
          .eq('company_id', companyId)
          .single();
        if (!cancelled && row) {
          const hasExistingData =
            row.name || row.industry || row.mission || row.vision ||
            (row.evaluation_metrics && row.evaluation_metrics.length > 0) ||
            (row.onboarding_advanced as { roles?: unknown[] })?.roles?.length;
          if (hasExistingData) {
            setFormData(dbRowToOnboardingFormData({ company_id: companyId, ...row }));
            setCurrentStep(1);
            usedDbData = true;
          }
        }
      }
      if (!cancelled && !usedDbData) {
        const savedStep = localStorage.getItem('onboardingCurrentStep');
        const savedData = localStorage.getItem('onboardingFormData');
        if (savedStep) setCurrentStep(JSON.parse(savedStep) as number);
        if (savedData) setFormData(JSON.parse(savedData) as OnboardingFormData);
      }
      if (!cancelled) setIsHydrated(true);
    };
    init();
    return () => { cancelled = true; };
  }, [companyId]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('onboardingFormData', JSON.stringify(formData));
      localStorage.setItem('onboardingCurrentStep', JSON.stringify(currentStep));
    }
  }, [formData, currentStep, isHydrated]);

  const updateFormData = (field: keyof OnboardingFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePolicyChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      policies: { ...prev.policies, [field]: value },
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        advanced: { ...prev.advanced, [field]: file.name },
      }));
      toast.success(`${file.name} selected.`);
    }
  };

  const addTag = (field: 'techStack' | 'metrics', tag: string) => {
    if (!formData[field].includes(tag)) {
      updateFormData(field, [...formData[field], tag]);
    }
  };

  const removeTag = (field: 'techStack' | 'metrics', tag: string) => {
    updateFormData(field, formData[field].filter((t) => t !== tag));
  };

  const addRole = (role: { name: string; skills: string[]; level: string }) => {
    if (!formData.roles.find((r) => r.name === role.name)) {
      updateFormData('roles', [...formData.roles, { ...role, students: 5 }]);
    }
  };

  const removeRole = (roleName: string) => {
    updateFormData('roles', formData.roles.filter((r) => r.name !== roleName));
  };

  const aiSuggestTechStack = () => {
    const suggestions =
      formData.domain === 'SaaS'
        ? ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker']
        : formData.domain === 'AI/ML'
          ? ['Python', 'TensorFlow', 'FastAPI', 'PostgreSQL', 'Docker']
          : ['React', 'Node.js', 'MongoDB', 'AWS'];
    updateFormData('techStack', [...new Set([...formData.techStack, ...suggestions])]);
    setShowAISuggestion(false);
  };

  const aiSuggestMission = () => {
    const mission = `Empowering the future of ${formData.domain || 'technology'} through innovative solutions that transform how businesses operate and scale.`;
    updateFormData('mission', mission);
  };

  const handleSubmission = async () => {
    if (!companyId) {
      toast.error('Invalid company. Please log in again.');
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    const employeeCount = formData.employees ? parseInt(formData.employees, 10) : null;
    const hasPolicies =
      formData.policies.codingStandards ||
      formData.policies.confidentialityGuidelines ||
      formData.policies.enforceCodeReview ||
      formData.policies.requireDocs ||
      formData.policies.conventionalCommits;

    const updatePayload: Record<string, unknown> = {
      onboarding_advanced: {
        roles: formData.roles,
        projectBriefs: formData.advanced.projectBriefs,
        codeExamples: formData.advanced.codeExamples,
        evaluationRubrics: formData.advanced.evaluationRubrics,
      },
    };
    if (formData.companyName) updatePayload.name = formData.companyName;
    if (formData.domain) updatePayload.industry = formData.domain;
    if (formData.mission) updatePayload.mission = formData.mission;
    if (formData.vision) updatePayload.vision = formData.vision;
    if (employeeCount != null && !Number.isNaN(employeeCount)) updatePayload.employee_count = employeeCount;
    if (formData.metrics.length > 0) updatePayload.evaluation_metrics = formData.metrics;
    if (hasPolicies) updatePayload.policies = formData.policies;

    const { error } = await supabase
      .from('companies')
      .update(updatePayload)
      .eq('company_id', companyId)
      .select('*');

    if (error) {
      console.error('Error saving company data:', error);
      toast.error('Failed to save. Please try again.');
      setIsSubmitting(false);
      return;
    }

    try {
      await fetch(
        'https://n8n.srv1034714.hstgr.cloud/webhook/17ab3087-1d7c-4724-b38d-53b38d9d526c',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formData, company_id: companyId }),
        }
      );
    } catch {
      // Webhook is optional; don't fail the flow
    } finally {
      setIsSubmitting(false);
    }

    toast.success('Company environment created successfully!');
    localStorage.removeItem('onboardingFormData');
    localStorage.removeItem('onboardingCurrentStep');
    router.push(`/company/${companyId}/dashboard`);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <OnboardingWelcome onNext={() => setCurrentStep(1)} />;
      case 1:
        return (
          <OnboardingCompanyBasics
            formData={formData}
            showAISuggestion={showAISuggestion}
            onUpdate={updateFormData}
            onRemoveTag={removeTag}
            onAddTag={addTag}
            onAiSuggestTechStack={aiSuggestTechStack}
            onAiSuggestMission={aiSuggestMission}
            onSetShowAISuggestion={setShowAISuggestion}
          />
        );
      case 2:
        return (
          <OnboardingJobRoles
            formData={formData}
            onAddRole={addRole}
            onRemoveRole={removeRole}
            onUpdateRoles={(roles) => updateFormData('roles', roles)}
          />
        );
      case 3:
        return (
          <OnboardingEvaluation
            formData={formData}
            onAddMetric={(m) => addTag('metrics', m)}
            onRemoveMetric={(m) => removeTag('metrics', m)}
          />
        );
      case 4:
        return (
          <OnboardingPolicies formData={formData} onPolicyChange={handlePolicyChange} />
        );
      case 5:
        return (
          <OnboardingAdvanced formData={formData} onFileChange={handleFileChange} />
        );
      case 6:
        return (
          <OnboardingReview
            formData={formData}
            onEditStep={setCurrentStep}
            onSubmit={handleSubmission}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen bg-background flex overflow-y-hidden">
      {/* Left sidebar - matches dashboard */}
      <aside className="w-18 border-r bg-card flex flex-col items-center py-6 gap-6 fixed h-screen flex-shrink-0">
        <Link
          href={companyId ? `/company/${companyId}/dashboard` : '/'}
          className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mb-4 text-primary-foreground hover:opacity-90 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-16 overflow-auto">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Company onboarding</h1>
            <p className="text-muted-foreground">
              Configure your virtual environment, roles, and evaluation once — CareerSetu will handle the rest.
            </p>
          </div>

          <Card>
            <CardHeader>
              <OnboardingStepper currentStep={currentStep} />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="min-h-[320px]">
                {renderStep()}
              </div>

              {currentStep > 0 && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    className="gap-2"
                  >
                    <ChevronLeft size={20} /> Previous
                  </Button>
                  {currentStep < STEPS.length - 1 ? (
                    <Button
                      onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
                      className="gap-2"
                    >
                      Next <ChevronRight size={20} />
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Review complete – click <span className="font-semibold text-primary">Publish Company Environment</span> above.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
