import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, FolderKanban, Sparkles, Loader2, Check, Edit3, ChevronDown, ChevronRight, Trash2, GripVertical, Clock, Target, Zap, FileCode, Layers, GitBranch, Package } from 'lucide-react';

export default function ProjectBuilderComponent() {
  const [projects, setProjects] = useState([
    { id: 1, title: 'E-commerce Platform', components: 12, progress: 75, date: '2025-10-01', tech: 'React, Node.js' },
    { id: 2, title: 'AI Chat Application', components: 8, progress: 45, date: '2025-10-05', tech: 'Next.js, OpenAI' },
    { id: 3, title: 'Task Management System', components: 15, progress: 20, date: '2025-10-07', tech: 'Vue, Firebase' }
  ]);
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [editingSection, setEditingSection] = useState(null);
  const [sectionInput, setSectionInput] = useState('');
  const inputRef = useRef(null);

  const handleCreateNew = () => {
    setShowBuilder(true);
    setSelectedProject(null);
    setCurrentProject(null);
    setInputValue('');
  };

  const generateDummyProject = (description) => {
    return {
      id: Date.now(),
      title: description.split(' ').slice(0, 4).join(' ') || 'New Project',
      description: 'AI-generated project structure tailored to your requirements',
      estimatedTime: '6-8 weeks',
      complexity: 'Intermediate',
      techStack: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS', 'Express'],
      architecture: {
        title: 'Project Architecture',
        description: 'Microservices-based architecture with frontend and backend separation',
        components: [
          'Frontend SPA using React',
          'RESTful API backend',
          'Database layer with MongoDB',
          'Authentication & Authorization',
          'Real-time WebSocket communication'
        ]
      },
      structure: [
        {
          id: 1,
          name: 'Frontend Components',
          type: 'Frontend',
          description: 'User interface components and pages',
          items: [
            { name: 'Authentication Pages', files: ['Login.jsx', 'Register.jsx', 'ForgotPassword.jsx'] },
            { name: 'Dashboard', files: ['Dashboard.jsx', 'Sidebar.jsx', 'TopNav.jsx'] },
            { name: 'Core Features', files: ['UserProfile.jsx', 'Settings.jsx', 'Notifications.jsx'] },
            { name: 'Shared Components', files: ['Button.jsx', 'Input.jsx', 'Modal.jsx', 'Card.jsx'] }
          ],
          technologies: ['React', 'Tailwind CSS', 'React Router']
        },
        {
          id: 2,
          name: 'Backend API',
          type: 'Backend',
          description: 'Server-side logic and API endpoints',
          items: [
            { name: 'Authentication', files: ['auth.controller.js', 'auth.service.js', 'jwt.middleware.js'] },
            { name: 'User Management', files: ['user.controller.js', 'user.model.js', 'user.routes.js'] },
            { name: 'Core Business Logic', files: ['main.controller.js', 'main.service.js', 'validators.js'] },
            { name: 'Database', files: ['db.config.js', 'schemas.js', 'migrations/'] }
          ],
          technologies: ['Node.js', 'Express', 'MongoDB', 'JWT']
        },
        {
          id: 3,
          name: 'Database Schema',
          type: 'Database',
          description: 'Data models and relationships',
          items: [
            { name: 'Users Collection', files: ['User schema with authentication fields', 'Indexes on email and username'] },
            { name: 'Sessions Collection', files: ['Active user sessions', 'Token management'] },
            { name: 'Activity Logs', files: ['User activity tracking', 'Audit trail'] },
            { name: 'Relationships', files: ['User → Sessions (1:N)', 'User → Logs (1:N)'] }
          ],
          technologies: ['MongoDB', 'Mongoose']
        },
        {
          id: 4,
          name: 'DevOps & Deployment',
          type: 'Infrastructure',
          description: 'Deployment, CI/CD, and infrastructure setup',
          items: [
            { name: 'Docker Configuration', files: ['Dockerfile', 'docker-compose.yml', '.dockerignore'] },
            { name: 'CI/CD Pipeline', files: ['.github/workflows/deploy.yml', 'deployment scripts'] },
            { name: 'Environment Config', files: ['.env.example', 'config files for dev/staging/prod'] },
            { name: 'Monitoring', files: ['Error tracking setup', 'Performance monitoring', 'Logging configuration'] }
          ],
          technologies: ['Docker', 'GitHub Actions', 'AWS/Vercel']
        }
      ],
      features: [
        {
          id: 1,
          name: 'User Authentication & Authorization',
          priority: 'High',
          status: 'To Do',
          tasks: ['Implement JWT authentication', 'Create login/register flows', 'Add OAuth providers', 'Role-based access control']
        },
        {
          id: 2,
          name: 'Dashboard & Analytics',
          priority: 'High',
          status: 'To Do',
          tasks: ['Design dashboard layout', 'Implement data visualization', 'Real-time updates', 'Export functionality']
        },
        {
          id: 3,
          name: 'API Integration',
          priority: 'Medium',
          status: 'To Do',
          tasks: ['RESTful API endpoints', 'API documentation', 'Rate limiting', 'Error handling']
        },
        {
          id: 4,
          name: 'Testing & Quality Assurance',
          priority: 'Medium',
          status: 'To Do',
          tasks: ['Unit tests', 'Integration tests', 'E2E testing setup', 'Code coverage reports']
        }
      ],
      timeline: [
        { phase: 'Week 1-2', task: 'Project setup, architecture design, database schema' },
        { phase: 'Week 3-4', task: 'Core backend API development, authentication system' },
        { phase: 'Week 5-6', task: 'Frontend components, UI/UX implementation' },
        { phase: 'Week 7', task: 'Integration, testing, bug fixes' },
        { phase: 'Week 8', task: 'Deployment, documentation, handover' }
      ]
    };
  };

  const handleGenerateProject = async () => {
    if (!inputValue.trim() || isGenerating) return;

    setIsGenerating(true);

    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      // Make webhook POST request
      const response = await fetch('YOUR_WEBHOOK_URL_HERE', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: inputValue,
          projectId: currentProject?.id
        })
      });

      const data = await response.json();
      
      // Use dummy data for now
      const newProject = data.project || generateDummyProject(inputValue);
      setCurrentProject(newProject);
      setShowBuilder(false);
    } catch (error) {
      console.error('Error generating project:', error);
      // Fallback to dummy data
      const newProject = generateDummyProject(inputValue);
      setCurrentProject(newProject);
      setShowBuilder(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-72 bg-zinc-950 border-r border-emerald-900/20 flex flex-col">
        <div className="p-4 border-b border-emerald-900/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <FolderKanban size={18} className="text-black" />
            </div>
            <span className="font-semibold text-white">Project Builder</span>
          </div>
          <button
            onClick={handleCreateNew}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
          >
            <Plus size={18} />
            New Project
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-3">
            Your Projects
          </div>
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => {
                setSelectedProject(project);
                setShowBuilder(false);
                setCurrentProject(null);
              }}
              className={`bg-zinc-900/50 hover:bg-zinc-900 rounded-lg p-3 cursor-pointer transition-all duration-200 border ${
                selectedProject?.id === project.id 
                  ? 'border-emerald-500 bg-zinc-900' 
                  : 'border-zinc-800 hover:border-emerald-500/30'
              }`}
            >
              <h3 className="font-medium text-sm text-white mb-1">{project.title}</h3>
              <p className="text-xs text-zinc-500 mb-2">{project.tech}</p>
              <p className="text-xs text-zinc-500">{project.components} components</p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1">
                  <div 
                    className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-black overflow-hidden">
        {showBuilder ? (
          // Project Builder Input Screen
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
            <div className="w-full max-w-4xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 mx-auto">
                  <Sparkles size={32} className="text-emerald-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">Create New Project</h1>
                <p className="text-zinc-400 text-center max-w-2xl mx-auto">
                  Describe your project idea, tech stack preferences, and key features. Our AI will generate a complete project structure with architecture, components, and implementation details.
                </p>
              </div>
              
              <div className="bg-zinc-900 border border-emerald-900/30 rounded-2xl p-1 focus-within:border-emerald-500 transition-colors">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Example: Build a full-stack e-commerce platform with React and Node.js. Include user authentication, product catalog, shopping cart, payment integration with Stripe, order management, and admin dashboard. Use MongoDB for database and implement real-time notifications..."
                  className="w-full bg-transparent text-white placeholder-zinc-500 text-sm outline-none resize-none p-4 min-h-[200px]"
                  disabled={isGenerating}
                />
                <div className="flex items-center justify-between px-4 pb-3">
                  <span className="text-xs text-zinc-500">
                    {isGenerating ? 'AI is generating your project structure...' : 'Be specific about features, tech stack, and requirements'}
                  </span>
                  <button
                    onClick={handleGenerateProject}
                    disabled={!inputValue.trim() || isGenerating}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:cursor-not-allowed text-black font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        Generate Project
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isGenerating && (
                <div className="mt-8 bg-zinc-900 border border-emerald-900/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 size={20} className="text-emerald-500 animate-spin" />
                    <span className="text-sm font-medium text-white">Building your project structure</span>
                  </div>
                  <div className="space-y-3">
                    {['Analyzing requirements', 'Designing architecture', 'Creating file structure', 'Defining components', 'Generating documentation'].map((step, i) => (
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
        ) : currentProject ? (
          // Generated Project View
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
              {/* Project Header */}
              <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-900/30 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Check size={20} className="text-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Generated Project</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{currentProject.title}</h2>
                    <p className="text-zinc-400 text-sm mb-4">{currentProject.description}</p>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-emerald-500" />
                        <span className="text-zinc-300">{currentProject.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Target size={16} className="text-emerald-500" />
                        <span className="text-zinc-300">{currentProject.complexity}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Layers size={16} className="text-emerald-500" />
                        <span className="text-zinc-300">{currentProject.structure.length} Sections</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCreateNew}
                    className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"
                  >
                    <Edit3 size={18} />
                  </button>
                </div>
                
                {/* Tech Stack */}
                <div className="border-t border-emerald-900/20 pt-4 mt-4">
                  <h3 className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-3">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentProject.techStack.map((tech, i) => (
                      <span key={i} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-lg">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Architecture Overview */}
              <div className="bg-zinc-900 border border-emerald-900/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GitBranch size={20} className="text-emerald-500" />
                  <h3 className="text-lg font-semibold text-white">{currentProject.architecture.title}</h3>
                </div>
                <p className="text-zinc-400 text-sm mb-4">{currentProject.architecture.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  {currentProject.architecture.components.map((component, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-zinc-300 bg-zinc-950 p-3 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      {component}
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Structure */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileCode size={20} className="text-emerald-500" />
                  Project Structure
                </h3>
                
                {currentProject.structure.map((section) => (
                  <div key={section.id} className="bg-zinc-900 border border-emerald-900/20 rounded-xl overflow-hidden hover:border-emerald-500/40 transition-colors">
                    <div 
                      onClick={() => toggleSection(section.id)}
                      className="p-5 cursor-pointer hover:bg-zinc-900/80 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <Package size={20} className="text-emerald-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-semibold text-white">{section.name}</h4>
                              <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">{section.type}</span>
                            </div>
                            <p className="text-sm text-zinc-400 mb-3">{section.description}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {section.technologies.map((tech, i) => (
                                <span key={i} className="text-xs bg-zinc-950 text-zinc-400 px-2 py-1 rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        {expandedSections[section.id] ? (
                          <ChevronDown size={20} className="text-zinc-400 mt-1" />
                        ) : (
                          <ChevronRight size={20} className="text-zinc-400 mt-1" />
                        )}
                      </div>
                    </div>

                    {expandedSections[section.id] && (
                      <div className="px-5 pb-5 border-t border-emerald-900/20 pt-4 space-y-4">
                        {section.items.map((item, i) => (
                          <div key={i} className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                            <h5 className="text-sm font-medium text-white mb-2">{item.name}</h5>
                            <div className="space-y-1.5">
                              {item.files.map((file, j) => (
                                <div key={j} className="flex items-center gap-2 text-xs text-zinc-400 font-mono bg-black p-2 rounded">
                                  <FileCode size={12} className="text-emerald-500" />
                                  {file}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Features & Tasks */}
              <div className="bg-zinc-900 border border-emerald-900/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target size={20} className="text-emerald-500" />
                  Key Features & Implementation Tasks
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {currentProject.features.map((feature) => (
                    <div key={feature.id} className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-medium text-white">{feature.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          feature.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {feature.priority}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {feature.tasks.map((task, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                            {task}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-zinc-900 border border-emerald-900/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-emerald-500" />
                  Development Timeline
                </h3>
                <div className="space-y-3">
                  {currentProject.timeline.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 pb-3 border-b border-zinc-800 last:border-0">
                      <div className="w-20 flex-shrink-0">
                        <span className="text-xs font-semibold text-emerald-500">{item.phase}</span>
                      </div>
                      <p className="text-sm text-zinc-300">{item.task}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 pt-4 pb-8">
                <button
                  onClick={() => {
                    const newProject = {
                      id: Date.now(),
                      title: currentProject.title,
                      components: currentProject.structure.length,
                      progress: 0,
                      date: new Date().toISOString().split('T')[0],
                      tech: currentProject.techStack.slice(0, 2).join(', ')
                    };
                    setProjects(prev => [newProject, ...prev]);
                    setCurrentProject(null);
                    setShowBuilder(false);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Check size={18} />
                  Save Project
                </button>
                <button
                  onClick={handleCreateNew}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
                >
                  Create Another
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md px-6">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FolderKanban size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">AI Project Builder</h2>
              <p className="text-zinc-400 mb-6 leading-relaxed">
                Generate complete project structures with architecture, components, and implementation details powered by AI.
              </p>
              <button
                onClick={handleCreateNew}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium py-3 px-6 rounded-lg inline-flex items-center gap-2 transition-all duration-200"
              >
                <Plus size={20} />
                Create New Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}