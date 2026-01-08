import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, BookOpen, Sparkles, Loader2, Check, Edit3, ChevronDown, ChevronRight, Trash2, GripVertical, Clock, Target, Zap } from 'lucide-react';

export default function LearningWorkflowComponent() {
  const [workflows, setWorkflows] = useState([
    { id: 1, title: 'JavaScript Fundamentals', modules: 5, progress: 75, date: '2025-10-01' },
    { id: 2, title: 'React Advanced Patterns', modules: 8, progress: 45, date: '2025-10-05' },
    { id: 3, title: 'Python for Data Science', modules: 12, progress: 20, date: '2025-10-07' }
  ]);
  
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [editingModule, setEditingModule] = useState(null);
  const [moduleInput, setModuleInput] = useState('');
  const inputRef = useRef(null);

  const handleCreateNew = () => {
    setShowBuilder(true);
    setSelectedWorkflow(null);
    setCurrentWorkflow(null);
    setInputValue('');
  };

  const handleGenerateWorkflow = async () => {
    if (!inputValue.trim() || isGenerating) return;

    setIsGenerating(true);

    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      // Make webhook POST request
      const response = await fetch('YOUR_WEBHOOK_URL_HERE', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: inputValue,
          workflowId: currentWorkflow?.id
        })
      });

      const data = await response.json();
      
      // Simulated workflow generation
      const newWorkflow = data.workflow || {
        id: Date.now(),
        title: inputValue.split(' ').slice(0, 4).join(' '),
        description: 'AI-generated learning workflow tailored to your requirements',
        estimatedTime: '8-10 weeks',
        difficulty: 'Intermediate',
        modules: [
          {
            id: 1,
            title: 'Foundations & Core Concepts',
            duration: '2 weeks',
            topics: ['Introduction to key principles', 'Understanding fundamentals', 'Basic terminology', 'Setting up environment'],
            description: 'Build a strong foundation with essential concepts and terminology',
            objectives: ['Understand core principles', 'Set up development environment', 'Complete first hands-on project']
          },
          {
            id: 2,
            title: 'Intermediate Techniques',
            duration: '3 weeks',
            topics: ['Advanced patterns', 'Best practices', 'Common pitfalls', 'Optimization techniques'],
            description: 'Explore intermediate concepts and practical applications',
            objectives: ['Master intermediate patterns', 'Apply best practices', 'Build real-world projects']
          },
          {
            id: 3,
            title: 'Advanced Applications',
            duration: '3 weeks',
            topics: ['Expert strategies', 'Performance optimization', 'Scalability', 'Production deployment'],
            description: 'Deep dive into advanced topics and production-ready solutions',
            objectives: ['Implement advanced features', 'Optimize for production', 'Handle edge cases']
          },
          {
            id: 4,
            title: 'Capstone Project & Portfolio',
            duration: '2 weeks',
            topics: ['Project planning', 'Full implementation', 'Testing & debugging', 'Deployment & showcase'],
            description: 'Apply all learned concepts in a comprehensive final project',
            objectives: ['Complete end-to-end project', 'Deploy to production', 'Build portfolio piece']
          }
        ]
      };

      setCurrentWorkflow(newWorkflow);
    } catch (error) {
      console.error('Error generating workflow:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModifyModule = async (module) => {
    if (!moduleInput.trim() || isGenerating) return;

    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const response = await fetch('YOUR_WEBHOOK_URL_HERE', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId: module.id,
          modification: moduleInput,
          workflowId: currentWorkflow.id
        })
      });

      const data = await response.json();
      
      // Update module
      setCurrentWorkflow(prev => ({
        ...prev,
        modules: prev.modules.map(m => 
          m.id === module.id 
            ? { ...m, ...data.updatedModule, topics: [...m.topics, 'Updated content'] }
            : m
        )
      }));
      
      setEditingModule(null);
      setModuleInput('');
    } catch (error) {
      console.error('Error modifying module:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-72 bg-zinc-950 border-r border-emerald-900/20 flex flex-col">
        <div className="p-4 border-b border-emerald-900/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <BookOpen size={18} className="text-black" />
            </div>
            <span className="font-semibold text-white">Learning Workflow</span>
          </div>
          <button
            onClick={handleCreateNew}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
          >
            <Plus size={18} />
            New Workflow
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-3">
            Your Workflows
          </div>
          {workflows.map(workflow => (
            <div
              key={workflow.id}
              onClick={() => {
                setSelectedWorkflow(workflow);
                setShowBuilder(false);
              }}
              className={`bg-zinc-900/50 hover:bg-zinc-900 rounded-lg p-3 cursor-pointer transition-all duration-200 border ${
                selectedWorkflow?.id === workflow.id 
                  ? 'border-emerald-500 bg-zinc-900' 
                  : 'border-zinc-800 hover:border-emerald-500/30'
              }`}
            >
              <h3 className="font-medium text-sm text-white mb-1">{workflow.title}</h3>
              <p className="text-xs text-zinc-500">{workflow.modules} modules</p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                  <span>Progress</span>
                  <span>{workflow.progress}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1">
                  <div 
                    className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${workflow.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-black">
        {showBuilder || currentWorkflow ? (
          <div className="flex-1 flex flex-col items-center overflow-y-auto">
            <div className="w-full max-w-5xl px-6 py-8">
              {!currentWorkflow ? (
                // Initial Builder Screen
                <div className="flex flex-col items-center justify-center min-h-[70vh]">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                    <Sparkles size={32} className="text-emerald-500" />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-3">Create Learning Workflow</h1>
                  <p className="text-zinc-400 text-center mb-8 max-w-2xl">
                    Describe your learning goals, target audience, and desired outcomes. Our AI will generate a comprehensive workflow with structured modules.
                  </p>
                  
                  <div className="w-full max-w-3xl">
                    <div className="bg-zinc-900 border border-emerald-900/30 rounded-2xl p-1 focus-within:border-emerald-500 transition-colors">
                      <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Example: Create a comprehensive web development course for beginners covering HTML, CSS, JavaScript, and React. Include hands-on projects and real-world applications..."
                        className="w-full bg-transparent text-white placeholder-zinc-500 text-sm outline-none resize-none p-4 min-h-[120px]"
                        disabled={isGenerating}
                      />
                      <div className="flex items-center justify-between px-4 pb-3">
                        <span className="text-xs text-zinc-500">
                          {isGenerating ? 'AI is generating your workflow...' : 'Be specific about topics, duration, and learning objectives'}
                        </span>
                        <button
                          onClick={handleGenerateWorkflow}
                          disabled={!inputValue.trim() || isGenerating}
                          className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:cursor-not-allowed text-black font-medium px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Generating
                            </>
                          ) : (
                            <>
                              <Zap size={16} />
                              Generate Workflow
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {isGenerating && (
                      <div className="mt-8 bg-zinc-900 border border-emerald-900/30 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Loader2 size={20} className="text-emerald-500 animate-spin" />
                          <span className="text-sm font-medium text-white">Building your learning workflow</span>
                        </div>
                        <div className="space-y-3">
                          {['Analyzing requirements', 'Structuring modules', 'Defining learning objectives', 'Creating timeline'].map((step, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Generated Workflow View
                <div className="space-y-6">
                  {/* Workflow Header */}
                  <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-900/30 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Check size={20} className="text-emerald-500" />
                          <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Generated Workflow</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">{currentWorkflow.title}</h2>
                        <p className="text-zinc-400 text-sm">{currentWorkflow.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          setCurrentWorkflow(null);
                          setInputValue('');
                        }}
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        <Edit3 size={18} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-emerald-500" />
                        <span className="text-zinc-300">{currentWorkflow.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Target size={16} className="text-emerald-500" />
                        <span className="text-zinc-300">{currentWorkflow.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen size={16} className="text-emerald-500" />
                        <span className="text-zinc-300">{currentWorkflow.modules.length} Modules</span>
                      </div>
                    </div>
                  </div>

                  {/* Modules */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <GripVertical size={20} className="text-emerald-500" />
                      Course Modules
                    </h3>
                    
                    {currentWorkflow.modules.map((module, index) => (
                      <div key={module.id} className="bg-zinc-900 border border-emerald-900/20 rounded-xl overflow-hidden hover:border-emerald-500/40 transition-colors">
                        <div 
                          onClick={() => toggleModule(module.id)}
                          className="p-5 cursor-pointer hover:bg-zinc-900/80 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-500 font-bold text-sm flex-shrink-0 mt-1">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-white mb-1">{module.title}</h4>
                                <p className="text-sm text-zinc-400 mb-2">{module.description}</p>
                                <div className="flex items-center gap-3 text-xs text-zinc-500">
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {module.duration}
                                  </span>
                                  <span>{module.topics.length} topics</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingModule(module.id);
                                }}
                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                              >
                                <Edit3 size={14} className="text-emerald-500" />
                              </button>
                              {expandedModules[module.id] ? (
                                <ChevronDown size={20} className="text-zinc-400" />
                              ) : (
                                <ChevronRight size={20} className="text-zinc-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {expandedModules[module.id] && (
                          <div className="px-5 pb-5 border-t border-emerald-900/20 pt-4 space-y-4">
                            {/* Topics */}
                            <div>
                              <h5 className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">Topics Covered</h5>
                              <div className="grid grid-cols-2 gap-2">
                                {module.topics.map((topic, i) => (
                                  <div key={i} className="flex items-center gap-2 text-sm text-zinc-300 bg-zinc-950 p-2 rounded-lg">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    {topic}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Learning Objectives */}
                            <div>
                              <h5 className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">Learning Objectives</h5>
                              <div className="space-y-2">
                                {module.objectives.map((objective, i) => (
                                  <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                    <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                    {objective}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {editingModule === module.id && (
                          <div className="px-5 pb-5 border-t border-emerald-900/20 pt-4">
                            <div className="bg-zinc-950 border border-emerald-900/30 rounded-lg p-3">
                              <textarea
                                value={moduleInput}
                                onChange={(e) => setModuleInput(e.target.value)}
                                placeholder={`Request changes for "${module.title}"... (e.g., Add more hands-on exercises, include video content, extend duration to 4 weeks)`}
                                className="w-full bg-transparent text-white placeholder-zinc-500 text-sm outline-none resize-none min-h-[60px]"
                                disabled={isGenerating}
                              />
                              <div className="flex items-center justify-end gap-2 mt-2">
                                <button
                                  onClick={() => {
                                    setEditingModule(null);
                                    setModuleInput('');
                                  }}
                                  className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleModifyModule(module)}
                                  disabled={!moduleInput.trim() || isGenerating}
                                  className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 text-black text-xs font-medium px-4 py-1.5 rounded flex items-center gap-1.5 transition-colors"
                                >
                                  {isGenerating ? (
                                    <>
                                      <Loader2 size={12} className="animate-spin" />
                                      Updating
                                    </>
                                  ) : (
                                    <>
                                      <Zap size={12} />
                                      Apply Changes
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <button
                      onClick={() => {
                        const newWorkflow = {
                          id: Date.now(),
                          title: currentWorkflow.title,
                          modules: currentWorkflow.modules.length,
                          progress: 0,
                          date: new Date().toISOString().split('T')[0]
                        };
                        setWorkflows(prev => [newWorkflow, ...prev]);
                        setCurrentWorkflow(null);
                        setShowBuilder(false);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium px-8 py-3 rounded-lg transition-colors"
                    >
                      Save Workflow
                    </button>
                    <button
                      onClick={() => {
                        setCurrentWorkflow(null);
                        setInputValue('');
                      }}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
                    >
                      Start Over
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md px-6">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Learning Workflow Builder</h2>
              <p className="text-zinc-400 mb-6 leading-relaxed">
                Create AI-powered learning workflows with structured modules and personalized content.
              </p>
              <button
                onClick={handleCreateNew}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium py-3 px-6 rounded-lg inline-flex items-center gap-2 transition-all duration-200"
              >
                <Plus size={20} />
                Create New Workflow
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}