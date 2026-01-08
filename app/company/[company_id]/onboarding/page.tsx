'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, Check, X, Plus, Upload, Eye, Edit2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
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
    }
  });

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedStep = localStorage.getItem('onboardingCurrentStep');
    if (savedStep) {
      setCurrentStep(JSON.parse(savedStep));
    }

    const savedData = localStorage.getItem('onboardingFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('onboardingFormData', JSON.stringify(formData));
      localStorage.setItem('onboardingCurrentStep', JSON.stringify(currentStep));
    }
  }, [formData, currentStep, isHydrated]);
  
  const [showAISuggestion, setShowAISuggestion] = useState(false);

  const steps = [
    { id: 0, title: 'Welcome', icon: '👋' },
    { id: 1, title: 'Company Basics', icon: '🏢' },
    { id: 2, title: 'Job Roles', icon: '👥' },
    { id: 3, title: 'Evaluation', icon: '📊' },
    { id: 4, title: 'Policies', icon: '📋' },
    { id: 5, title: 'Advanced', icon: '⚙️' },
    { id: 6, title: 'Review', icon: '✅' }
  ];

  const industryOptions = ['SaaS', 'E-commerce', 'FinTech', 'HealthTech', 'EdTech', 'AI/ML', 'Gaming'];
  const techStackOptions = ['React', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'TypeScript', 'Supabase', 'FastAPI'];
  const roleTemplates = [
    { name: 'Backend Intern', skills: ['Node.js', 'API Design', 'Database', 'Authentication'], level: 'Beginner' },
    { name: 'Frontend Intern', skills: ['React', 'CSS', 'JavaScript', 'UI/UX'], level: 'Beginner' },
    { name: 'Data Analyst', skills: ['Python', 'SQL', 'Data Viz', 'Statistics'], level: 'Intermediate' },
    { name: 'DevOps Intern', skills: ['Docker', 'CI/CD', 'AWS', 'Linux'], level: 'Intermediate' }
  ];
  const metricOptions = ['Code Quality', 'Project Completion', 'Teamwork', 'Innovation', 'Documentation', 'Problem Solving'];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePolicyChange = (field, value) => {
    setFormData(prev => ({
        ...prev,
        policies: {
            ...prev.policies,
            [field]: value
        }
    }));
  };
    
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        advanced: {
          ...prev.advanced,
          [field]: file.name
        }
      }));
      toast.success(`${file.name} selected.`);
    }
  };

  const addTag = (field, tag) => {
    if (!formData[field].includes(tag)) {
      updateFormData(field, [...formData[field], tag]);
    }
  };

  const removeTag = (field, tag) => {
    updateFormData(field, formData[field].filter(t => t !== tag));
  };

  const addRole = (role) => {
    if (!formData.roles.find(r => r.name === role.name)) {
      updateFormData('roles', [...formData.roles, { ...role, students: 5 }]);
    }
  };

  const removeRole = (roleName) => {
    updateFormData('roles', formData.roles.filter(r => r.name !== roleName));
  };

  const aiSuggestTechStack = () => {
    const suggestions = formData.domain === 'SaaS' 
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

  const handleSubmission = async()=>{
    console.log(formData)

    const { data, error } = await supabase
      .from('companies')
      .update({ companyDetails: formData })
      .eq('company_id', "company_1")
      .select('*');

    if (error) {
      console.error("Error inserting data:", error);
      toast.error("Failed to create environment. Please try again.");
    } else {
      console.log("Data inserted successfully:", data);

      const res = await fetch("https://n8n.srv1034714.hstgr.cloud/webhook/17ab3087-1d7c-4724-b38d-53b38d9d526c",{
        method:"POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData })
      })
      const response = await res.json()
      console.log(response)

      if(response){
        toast.success("Company environment created successfully!")
        
        localStorage.removeItem('onboardingFormData');
        localStorage.removeItem('onboardingCurrentStep');

        window.location.href = `/company/company_1/dashboard`
      }
    }
  }

  if (!isHydrated) {
    return null; 
  }

  const renderStep = () => {
    switch(currentStep) {
      case 0:
        return (
          <div className="text-center text-black py-12 px-6 max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Welcome to AI Company Builder!</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              In a few steps, we'll help you create your virtual company environment with learning modules, 
              projects, and evaluation pipelines — all powered by AI.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
              <p className="text-sm text-blue-800">
                <strong>💡 Pro Tip:</strong> Most fields are optional. Our AI will auto-suggest based on your input, 
                making the entire setup process take just 5-10 minutes.
              </p>
            </div>
            <button 
              onClick={() => setCurrentStep(1)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto text-lg"
            >
              Get Started <ChevronRight size={20} />
            </button>
          </div>
        );

      case 1:
        return (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Company Basics</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-black text-black text-sm font-medium mb-2">Company Name *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  className="w-full px-4 py-2 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., TechFlow Inc."
                />
              </div>

              <div>
                <label className="block text-black text-sm font-medium mb-2">Industry / Domain *</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {industryOptions.map(industry => (
                    <button
                      key={industry}
                      onClick={() => updateFormData('domain', industry)}
                      className={`px-4 py-2 rounded-full text-sm transition ${
                        formData.domain === industry
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-black text-sm font-medium mb-2 flex items-center gap-2">
                  Mission Statement
                  <button
                    onClick={aiSuggestMission}
                    className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-200"
                  >
                    <Sparkles size={12} /> AI Generate
                  </button>
                </label>
                <textarea
                  value={formData.mission}
                  onChange={(e) => updateFormData('mission', e.target.value)}
                  className="w-full px-4 py-2 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="What's your company's mission?"
                />
              </div>

              <div>
                <label className="block text-black text-sm font-medium mb-2">Number of Employees</label>
                <input
                  type="number"
                  value={formData.employees}
                  onChange={(e) => updateFormData('employees', e.target.value)}
                  className="w-full px-4 py-2 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 50"
                />
              </div>

              <div>
                <label className="block text-black text-sm font-medium mb-2 flex items-center gap-2">
                  Tech Stack
                  {formData.domain && !showAISuggestion && formData.techStack.length === 0 && (
                    <button
                      onClick={() => setShowAISuggestion(true)}
                      className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-200"
                    >
                      <Sparkles size={12} /> AI Suggest
                    </button>
                  )}
                </label>
                {showAISuggestion && (
                  <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800 mb-2">
                      💡 Based on "{formData.domain}", we recommend these technologies:
                    </p>
                    <button
                      onClick={aiSuggestTechStack}
                      className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                    >
                      Apply Suggestions
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.techStack.map(tech => (
                    <span key={tech} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {tech}
                      <X size={14} className="cursor-pointer" onClick={() => removeTag('techStack', tech)} />
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {techStackOptions.filter(t => !formData.techStack.includes(t)).map(tech => (
                    <button
                      key={tech}
                      onClick={() => addTag('techStack', tech)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                    >
                      + {tech}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Job Roles & Intern Profiles</h2>
            
            <div className="mb-6">
              <label className="block text-black text-sm font-medium mb-3">Select Roles to Simulate</label>
              <div className="grid grid-cols-2 gap-3">
                {roleTemplates.map(role => (
                  <div
                    key={role.name}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.roles.find(r => r.name === role.name)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => formData.roles.find(r => r.name === role.name) ? removeRole(role.name) : addRole(role)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-black text-gray-800">{role.name}</h3>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">{role.level}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.skills.map(skill => (
                        <span key={skill} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {formData.roles.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-black mb-3">Selected Roles</h3>
                {formData.roles.map((role, idx) => (
                  <div key={idx} className="mb-4 p-4 text-black bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{role.name}</h4>
                      <button
                        onClick={() => removeRole(role.name)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="text-sm">
                        Students per role:
                        <input
                          type="number"
                          value={role.students}
                          onChange={(e) => {
                            const updated = formData.roles.map(r => 
                              r.name === role.name ? {...r, students: e.target.value} : r
                            );
                            updateFormData('roles', updated);
                          }}
                          className="ml-2 w-20 px-2 py-1 border rounded"
                          min="1"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Evaluation & Metrics</h2>
            
            <div className="space-y-6 text-black">
              <div>
                <label className="block text-black text-sm font-medium mb-3">
                  Select Evaluation Metrics
                  <span className="ml-2 text-xs text-purple-600">(AI recommended based on roles)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {metricOptions.map(metric => (
                    <button
                      key={metric}
                      onClick={() => {
                        if (formData.metrics.includes(metric)) {
                          removeTag('metrics', metric);
                        } else {
                          addTag('metrics', metric);
                        }
                      }}
                      className={`p-3 border-2 rounded-lg text-left transition ${
                        formData.metrics.includes(metric)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{metric}</span>
                        {formData.metrics.includes(metric) && <Check size={18} className="text-blue-600" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="font-medium">Auto-rank students</span>
                </label>
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="font-medium">Enable real-time dashboards</span>
                </label>
                <label className="flex items-center gap-2">
                  <span className="font-medium">Feedback frequency:</span>
                  <select className="px-3 py-1 border rounded">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>After each project</option>
                  </select>
                </label>
              </div>

              <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
                <h4 className="font-semibold text-black mb-2 flex items-center gap-2">
                  <Eye size={18} /> Preview Dashboard
                </h4>
                <div className="bg-white p-3 rounded">
                  <div className="text-xs text-gray-500 mb-2">Mock Dashboard Preview:</div>
                  <div className="space-y-2">
                    {formData.metrics.slice(0, 3).map((metric, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-24 text-xs">{metric}</div>
                        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full" 
                            style={{width: `${Math.random() * 60 + 40}%`}}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Company Policies (Optional)</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-black text-sm font-medium mb-2">Coding Standards</label>
                <textarea
                  value={formData.policies.codingStandards}
                  onChange={(e) => handlePolicyChange('codingStandards', e.target.value)}
                  className="w-full px-4 py-2 border text-black rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="e.g., Follow PEP 8 for Python, use ESLint for JavaScript..."
                />
              </div>

              <div>
                <label className="block text-black text-sm font-medium mb-2">Confidentiality Guidelines</label>
                <textarea
                  value={formData.policies.confidentialityGuidelines}
                  onChange={(e) => handlePolicyChange('confidentialityGuidelines', e.target.value)}
                  className="w-full px-4 py-2 border text-black rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="e.g., All project data is confidential..."
                />
              </div>

              <div className="p-4 text-black bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-black mb-2 flex items-center gap-2">
                  <Sparkles size={18} /> AI-Suggested Policies
                </h4>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={formData.policies.enforceCodeReview}
                      onChange={(e) => handlePolicyChange('enforceCodeReview', e.target.checked)}
                    />
                    <span>Enforce code review before merging</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={formData.policies.requireDocs}
                      onChange={(e) => handlePolicyChange('requireDocs', e.target.checked)}
                    />
                    <span>Require documentation for all functions</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={formData.policies.conventionalCommits}
                      onChange={(e) => handlePolicyChange('conventionalCommits', e.target.checked)}
                    />
                    <span>Use conventional commit messages</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Advanced Inputs (Optional)</h2>
            
            <div className="space-y-6">
              <label className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition cursor-pointer block">
                <Upload className="mx-auto mb-3 text-gray-400" size={32} />
                <p className="font-medium mb-1">Upload Project Briefs</p>
                <p className="text-sm text-gray-500">
                  {formData.advanced.projectBriefs || 'PDF, DOCX, or TXT files'}
                </p>
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'projectBriefs')} accept=".pdf,.docx,.txt" />
              </label>

              <label className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition cursor-pointer block">
                <Upload className="mx-auto mb-3 text-gray-400" size={32} />
                <p className="font-medium mb-1">Upload Code Examples</p>
                <p className="text-sm text-gray-500">
                  {formData.advanced.codeExamples || 'ZIP, GitHub repo, or individual files'}
                </p>
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'codeExamples')} />
              </label>

              <label className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition cursor-pointer block">
                <Upload className="mx-auto mb-3 text-gray-400" size={32} />
                <p className="font-medium mb-1">Upload Evaluation Rubrics</p>
                <p className="text-sm text-gray-500">
                  {formData.advanced.evaluationRubrics || 'Excel, CSV, or PDF'}
                </p>
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'evaluationRubrics')} accept=".xlsx,.csv,.pdf" />
              </label>

              <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
                <p className="text-sm text-blue-800">
                  <strong>💡 AI Integration:</strong> Uploaded content will be automatically parsed and integrated 
                  into learning modules, projects, and evaluation criteria.
                </p>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="max-w-4xl mx-auto text-black">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Review & Confirm</h2>
            
            <div className="space-y-4">
              <div className="p-6 bg-white border rounded-lg shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold text-black">Company Overview</h3>
                   <button onClick={() => setCurrentStep(1)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                     <Edit2 size={16} /> Edit
                   </button>
                 </div>
                 <dl className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <dt className="text-gray-500">Company Name</dt>
                     <dd className="font-medium">{formData.companyName || 'Not specified'}</dd>
                   </div>
                   <div>
                     <dt className="text-gray-500">Industry</dt>
                     <dd className="font-medium">{formData.domain || 'Not specified'}</dd>
                   </div>
                   <div className="col-span-2">
                     <dt className="text-gray-500">Mission</dt>
                     <dd className="font-medium">{formData.mission || 'Not specified'}</dd>
                   </div>
                   <div className="col-span-2">
                     <dt className="text-gray-500">Tech Stack</dt>
                     <dd className="flex flex-wrap gap-1">
                       {formData.techStack.length > 0 ? formData.techStack.map(tech => (
                         <span key={tech} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                           {tech}
                         </span>
                       )) : 'Not specified'}
                     </dd>
                   </div>
                 </dl>
              </div>

              <div className="p-6 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black">Roles & Skills</h3>
                  <button onClick={() => setCurrentStep(2)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Edit2 size={16} /> Edit
                  </button>
                </div>
                {formData.roles.length > 0 ? (
                  <div className="space-y-3">
                    {formData.roles.map((role, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-xs text-gray-500">{role.students} students • {role.level}</div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {role.skills.map(skill => (
                            <span key={skill} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No roles configured</p>
                )}
              </div>

              <div className="p-6 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black">Evaluation Metrics</h3>
                  <button onClick={() => setCurrentStep(3)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Edit2 size={16} /> Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.metrics.length > 0 ? formData.metrics.map(metric => (
                        <span key={metric} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {metric}
                        </span>
                    )) : <p className="text-gray-500 text-sm">No metrics configured</p>}
                </div>
              </div>
              
              <div className="p-6 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black">Company Policies</h3>
                  <button onClick={() => setCurrentStep(4)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Edit2 size={16} /> Edit
                  </button>
                </div>
                <dl className="space-y-2 text-sm">
                    {formData.policies.codingStandards && <div><dt className="text-gray-500">Coding Standards</dt><dd className="font-medium whitespace-pre-wrap">{formData.policies.codingStandards}</dd></div>}
                    {formData.policies.confidentialityGuidelines && <div><dt className="text-gray-500">Confidentiality Guidelines</dt><dd className="font-medium whitespace-pre-wrap">{formData.policies.confidentialityGuidelines}</dd></div>}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {formData.policies.enforceCodeReview && <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Enforce code review</span>}
                        {formData.policies.requireDocs && <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Require documentation</span>}
                        {formData.policies.conventionalCommits && <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Use conventional commits</span>}
                    </div>
                </dl>
              </div>

              <div className="p-6 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black">Advanced Inputs</h3>
                  <button onClick={() => setCurrentStep(5)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Edit2 size={16} /> Edit
                  </button>
                </div>
                <dl className="space-y-1 text-sm">
                    {formData.advanced.projectBriefs && <div><dt className="text-gray-500 inline mr-2">Project Briefs:</dt><dd className="font-medium inline">{formData.advanced.projectBriefs}</dd></div>}
                    {formData.advanced.codeExamples && <div><dt className="text-gray-500 inline mr-2">Code Examples:</dt><dd className="font-medium inline">{formData.advanced.codeExamples}</dd></div>}
                    {formData.advanced.evaluationRubrics && <div><dt className="text-gray-500 inline mr-2">Evaluation Rubrics:</dt><dd className="font-medium inline">{formData.advanced.evaluationRubrics}</dd></div>}
                    {!formData.advanced.projectBriefs && !formData.advanced.codeExamples && !formData.advanced.evaluationRubrics && <p className="text-gray-500 text-sm">No advanced inputs provided</p>}
                </dl>
              </div>


              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                  <Sparkles className="text-purple-600" /> AI-Generated Summary
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Your virtual company is ready! We've created {formData.roles.length} role{formData.roles.length !== 1 ? 's' : ''} with 
                  customized learning modules, project templates, and an evaluation pipeline. 
                  {formData.metrics.length > 0 && ` Students will be evaluated on ${formData.metrics.length} key metrics.`}
                </p>
                <button onClick={handleSubmission} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold  flex items-center justify-center gap-2">
                  <Check size={20} /> Publish Company Environment
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-black transition ${
                      currentStep >= step.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span className="text-xs mt-1 text-gray-600 hidden md:block text-black">{step.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 min-h-[500px]">
          {renderStep()}
        </div>

        {currentStep > 0 && (
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <ChevronLeft size={20} /> Previous
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Next <ChevronRight size={20} />
              </button>
            ) : (
              <div className="text-sm text-gray-500">Review complete - Click "Publish" above</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;