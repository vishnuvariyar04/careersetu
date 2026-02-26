'use client';

import React from 'react';
import { X } from 'lucide-react';
import { OnboardingFormData, OnboardingRole } from './types';
import { ROLE_TEMPLATES } from './constants';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface OnboardingJobRolesProps {
  formData: OnboardingFormData;
  onAddRole: (role: { name: string; skills: string[]; level: string }) => void;
  onRemoveRole: (roleName: string) => void;
  onUpdateRoles: (roles: OnboardingRole[]) => void;
}

export function OnboardingJobRoles({
  formData,
  onAddRole,
  onRemoveRole,
  onUpdateRoles,
}: OnboardingJobRolesProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Job Roles & Intern Profiles</h2>

      <div className="mb-6">
        <Label className="mb-3 block">Select Roles to Simulate</Label>
        <div className="grid grid-cols-2 gap-3">
          {ROLE_TEMPLATES.map((role) => {
            const isSelected = formData.roles.find((r) => r.name === role.name);
            return (
              <div
                key={role.name}
                role="button"
                tabIndex={0}
                onClick={() => (isSelected ? onRemoveRole(role.name) : onAddRole(role))}
                onKeyDown={(e) => e.key === 'Enter' && (isSelected ? onRemoveRole(role.name) : onAddRole(role))}
                className={`p-4 border-2 rounded-xl cursor-pointer transition ${
                  isSelected ? 'border-primary bg-primary/10' : 'border-border bg-muted/50 hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{role.name}</h3>
                  <Badge variant="secondary" className="text-xs">{role.level}</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {role.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {formData.roles.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Selected Roles</h3>
          {formData.roles.map((role, idx) => (
            <div key={idx} className="mb-4 p-4 bg-muted/50 border rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{role.name}</h4>
                <button
                  onClick={() => onRemoveRole(role.name)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  Students per role:
                  <Input
                    type="number"
                    value={role.students}
                    onChange={(e) => {
                      const updated = formData.roles.map((r) =>
                        r.name === role.name ? { ...r, students: e.target.value } : r
                      );
                      onUpdateRoles(updated);
                    }}
                    className="w-20 h-8"
                    min={1}
                  />
                </Label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
