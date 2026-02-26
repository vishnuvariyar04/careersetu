'use client';

import React from 'react';
import { STEPS } from './constants';

interface OnboardingStepperProps {
  currentStep: number;
}

export function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition ${
                  currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.icon}
              </div>
              <span className="text-xs mt-1 text-muted-foreground hidden md:block">{step.title}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded transition ${
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
