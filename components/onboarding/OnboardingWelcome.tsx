'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingWelcomeProps {
  onNext: () => void;
}

export function OnboardingWelcome({ onNext }: OnboardingWelcomeProps) {
  return (
    <div className="text-center py-8 px-6 max-w-2xl mx-auto">
      <div className="text-6xl mb-6">🚀</div>
      <h2 className="text-3xl font-bold mb-4">Welcome to AI Company Builder!</h2>
      <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
        In a few steps, we&apos;ll help you create your virtual company environment with learning modules,
        projects, and evaluation pipelines — all powered by AI.
      </p>
      <div className="bg-primary/10 border-l-4 border-primary p-4 mb-6 text-left rounded-r-lg">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">💡 Pro Tip:</strong> Most fields are optional. Our AI will auto-suggest based on your input,
          making the entire setup process take just 5-10 minutes.
        </p>
      </div>
      <Button onClick={onNext} size="lg" className="gap-2">
        Get Started <ChevronRight size={20} />
      </Button>
    </div>
  );
}
