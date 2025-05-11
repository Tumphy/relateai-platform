'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Edit2,
  Save,
  PlusCircle,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Users,
  DollarSign,
  BarChart2,
  Clock,
  ShieldCheck,
  Zap,
  CheckSquare
} from 'lucide-react';

// Mock data for the current account
const account = {
  id: '123',
  name: 'Acme Corporation',
  industry: 'Technology',
  website: 'https://acme.example.com',
  employees: '1,000-5,000',
  revenue: '$100M-$500M',
  hq: 'San Francisco, CA'
};

// MEDDPPICC framework sections with descriptions
const frameworkSections = [
  {
    id: 'metrics',
    title: 'Metrics',
    icon: <BarChart2 className="h-5 w-5" />,
    description: 'Quantifiable results the customer wants to achieve',
    questions: [
      'What metrics is the prospect trying to improve?',
      'How will they measure success?',
      'What KPIs are most important to them?',
      'What is the financial impact of achieving these metrics?'
    ]
  },
  {
    id: 'economic-buyer',
    title: 'Economic Buyer',
    icon: <DollarSign className="h-5 w-5" />,
    description: 'The person who can release funds for the purchase',
    questions: [
      'Who has budget authority for this purchase?',
      'Have you met with this person directly?',
      'What are their personal goals and priorities?',
      'How do they evaluate purchases like this?'
    ]
  },
  {
    id: 'decision-criteria',
    title: 'Decision Criteria',
    icon: <CheckSquare className="h-5 w-5" />,
    description: 'Factors used to evaluate potential solutions',
    questions: [
      'What criteria will be used to evaluate solutions?',
      'How is each criterion weighted?',
      'Which criteria favor your solution?',
      'Are there any mandatory requirements?'
    ]
  },
  {
    id: 'decision-process',
    title: 'Decision Process',
    icon: <Briefcase className="h-5 w-5" />,
    description: 'The steps to purchase approval and implementation',
    questions: [
      'What is the formal decision-making process?',
      'Who needs to be involved at each stage?',
      'What approvals are required?',
      'Have they purchased similar solutions before?'
    ]
  },
  {
    id: 'paper-process',
    title: 'Paper Process',
    icon: <ShieldCheck className="h-5 w-5" />,
    description: 'The legal and procurement requirements',
    questions: [
      'What legal or procurement steps are required?',
      'Who manages the contract review process?',
      'Are there standard terms they require?',
      'What is their typical timeline for procurement?'
    ]
  },
  {
    id: 'identified-pain',
    title: 'Identified Pain',
    icon: <AlertCircle className="h-5 w-5" />,
    description: 'The specific problems the customer is facing',
    questions: [
      'What challenges is the prospect experiencing?',
      'How urgent is solving this problem?',
      'What happens if they do nothing?',
      'Who is most affected by this pain?'
    ]
  },
  {
    id: 'champion',
    title: 'Champion',
    icon: <Zap className="h-5 w-5" />,
    description: 'The internal advocate who will sell on your behalf',
    questions: [
      'Who stands to benefit most from your solution?',
      'Do they have influence with decision makers?',
      'Are they willing to advocate for you?',
      'Can they articulate your value proposition internally?'
    ]
  },
  {
    id: 'competition',
    title: 'Competition',
    icon: <Users className="h-5 w-5" />,
    description: 'Alternative solutions being considered',
    questions: [
      'What other solutions are they considering?',
      'Is the status quo a viable option?',
      'What is your competitive advantage?',
      'How does your pricing compare?'
    ]
  }
];

// Initial state for the account's MEDDPPICC assessment
const initialAssessment = {
  metrics: {
    score: 2,
    notes: 'Seeking to improve sales productivity by 30% and reduce customer acquisition cost',
    confidence: 'medium'
  },
  'economic-buyer': {
    score: 1,
    notes: 'CFO Mary Johnson makes final budget decisions, need to establish relationship',
    confidence: 'low'
  },
  'decision-criteria': {
    score: 3,
    notes: 'ROI within 12 months, ease of implementation, and integration with existing CRM',
    confidence: 'high'
  },
  'decision-process': {
    score: 2,
    notes: '3-stage process: technical evaluation, business case review, and executive approval',
    confidence: 'medium'
  },
  'paper-process': {
    score: 1,
    notes: 'Known for lengthy procurement process, legal review can take 4-6 weeks',
    confidence: 'medium'
  },
  'identified-pain': {
    score: 3,
    notes: 'Sales team struggling with low conversion rates and inefficient prospecting',
    confidence: 'high'
  },
  champion: {
    score: 2,
    notes: 'VP of Sales Operations is supportive but new in role, building influence',
    confidence: 'medium'
  },
  competition: {
    score: 1,
    notes: 'Currently evaluating 3 competitors, including the incumbent solution',
    confidence: 'low'
  }
};

export default function MeddppiccPage({ params }: { params: { id: string } }) {
  const [assessment, setAssessment] = useState(initialAssessment);
  const [expanded, setExpanded] = useState<string | null>('metrics');
  const [editing, setEditing] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [tempScore, setTempScore] = useState(0);
  const [tempConfidence, setTempConfidence] = useState('');

  // Calculate overall score
  const overallScore = Object.values(assessment).reduce((sum, item: any) => sum + item.score, 0) / 8;
  
  // Determine deal health based on overall score
  const getDealHealth = (score: number) => {
    if (score >= 2.5) return { status: 'Healthy', color: 'bg-success-500' };
    if (score >= 1.5) return { status: 'Moderate Risk', color: 'bg-warning-500' };
    return { status: 'High Risk', color: 'bg-danger-500' };
  };
  
  const dealHealth = getDealHealth(overallScore);

  // Toggle section expanded/collapsed
  const toggleExpand = (sectionId: string) => {
    setExpanded(expanded === sectionId ? null : sectionId);
  };

  // Start editing a section
  const startEditing = (sectionId: string) => {
    setEditing(sectionId);
    setTempNotes(assessment[sectionId as keyof typeof assessment].notes);
    setTempScore(assessment[sectionId as keyof typeof assessment].score);
    setTempConfidence(assessment[sectionId as keyof typeof assessment].confidence);
  };

  // Save edits to a section
  const saveEdits = () => {
    if (!editing) return;
    
    setAssessment({
      ...assessment,
      [editing]: {
        ...assessment[editing as keyof typeof assessment],
        notes: tempNotes,
        score: tempScore,
        confidence: tempConfidence
      }
    });
    
    setEditing(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditing(null);
  };

  // Confidence level badge
  const ConfidenceBadge = ({ level }: { level: string }) => {
    const colors = {
      low: 'bg-danger-100 text-danger-800',
      medium: 'bg-warning-100 text-warning-800',
      high: 'bg-success-100 text-success-800'
    };
    
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[level as keyof typeof colors]}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)} confidence
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="border-b border-neutral-200 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/dashboard/accounts/${params.id}`} className="mr-4 text-neutral-500 hover:text-neutral-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold text-neutral-900">MEDDPPICC Assessment</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href={`/dashboard/accounts/${params.id}/meddppicc/history`} className="text-sm text-primary-600 hover:text-primary-800">
              View history
            </Link>
            <button className="btn-primary">Share assessment</button>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-neutral-900">{account.name}</h2>
            <p className="text-sm text-neutral-500">{account.industry} • {account.employees} employees</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium text-neutral-700">Deal Health:</div>
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${dealHealth.color}`} />
              <div className="text-sm font-medium">{dealHealth.status}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall score card */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-neutral-900">Overall Score</h3>
          <div className="text-2xl font-bold">{overallScore.toFixed(1)}/3</div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-neutral-500 mb-1">
            <span>Weak opportunity</span>
            <span>Strong opportunity</span>
          </div>
          <div className="relative h-2 w-full bg-neutral-200 rounded-full">
            <div 
              className={`absolute left-0 top-0 h-2 rounded-full ${
                overallScore >= 2.5 ? 'bg-success-500' :
                overallScore >= 1.5 ? 'bg-warning-500' : 'bg-danger-500'
              }`}
              style={{ width: `${(overallScore / 3) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-4 gap-4">
          {frameworkSections.map(section => (
            <div key={section.id} className="card border border-neutral-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-1.5 rounded-md bg-primary-50 text-primary-600">
                  {section.icon}
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-neutral-900">{section.title}</h4>
                  <div className="mt-1 flex items-center">
                    <div className="text-xl font-semibold">
                      {assessment[section.id as keyof typeof assessment].score}/3
                    </div>
                    <div className="ml-2">
                      <ConfidenceBadge level={assessment[section.id as keyof typeof assessment].confidence} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MEDDPPICC sections */}
      <div className="space-y-4">
        {frameworkSections.map(section => (
          <div key={section.id} className="card border border-neutral-200 overflow-hidden">
            {/* Section header */}
            <div 
              className={`flex items-center justify-between px-6 py-4 ${
                expanded === section.id ? 'bg-primary-50' : 'bg-white'
              } cursor-pointer`}
              onClick={() => toggleExpand(section.id)}
            >
              <div className="flex items-center">
                <div className={`p-1.5 rounded-md ${
                  expanded === section.id ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-700'
                }`}>
                  {section.icon}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-neutral-900">{section.title}</h3>
                  <p className="text-sm text-neutral-500">{section.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-lg font-semibold">
                  {assessment[section.id as keyof typeof assessment].score}/3
                </div>
                {expanded === section.id ? 
                  <ChevronUp className="h-5 w-5 text-neutral-500" /> : 
                  <ChevronDown className="h-5 w-5 text-neutral-500" />
                }
              </div>
            </div>
            
            {/* Expanded content */}
            {expanded === section.id && (
              <div className="px-6 py-4 border-t border-neutral-200">
                {editing === section.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Score
                      </label>
                      <div className="flex space-x-4">
                        {[1, 2, 3].map(score => (
                          <button
                            key={score}
                            type="button"
                            onClick={() => setTempScore(score)}
                            className={`px-4 py-2 border rounded-md text-sm font-medium ${
                              tempScore === score
                                ? 'bg-primary-100 border-primary-500 text-primary-700'
                                : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Confidence Level
                      </label>
                      <div className="flex space-x-4">
                        {['low', 'medium', 'high'].map(level => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setTempConfidence(level)}
                            className={`px-4 py-2 border rounded-md text-sm font-medium ${
                              tempConfidence === level
                                ? 'bg-primary-100 border-primary-500 text-primary-700'
                                : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                            }`}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor={`notes-${section.id}`} className="block text-sm font-medium text-neutral-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        id={`notes-${section.id}`}
                        rows={4}
                        className="input"
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveEdits}
                        className="btn-primary"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <div className="flex justify-between">
                        <div className="text-sm font-medium text-neutral-500">Assessment</div>
                        <button
                          onClick={() => startEditing(section.id)}
                          className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
                        >
                          <Edit2 className="h-4 w-4 mr-1" /> Edit
                        </button>
                      </div>
                      <div className="mt-2 text-sm text-neutral-900">
                        {assessment[section.id as keyof typeof assessment].notes}
                      </div>
                      <div className="mt-2">
                        <ConfidenceBadge level={assessment[section.id as keyof typeof assessment].confidence} />
                      </div>
                    </div>
                    
                    <div className="border-t border-neutral-200 pt-4">
                      <div className="text-sm font-medium text-neutral-500 mb-2">
                        Key questions to consider
                      </div>
                      <ul className="space-y-2">
                        {section.questions.map((question, idx) => (
                          <li key={idx} className="flex items-start">
                            <HelpCircle className="h-4 w-4 text-primary-600 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm text-neutral-900">{question}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-4 border-t border-neutral-200 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium text-neutral-500">AI Recommendations</div>
                        <button className="text-primary-600 hover:text-primary-800 text-xs font-medium">
                          Refresh
                        </button>
                      </div>
                      <div className="bg-neutral-50 rounded-md p-3 text-sm text-neutral-900">
                        <p className="mb-2">Based on your assessment:</p>
                        <ul className="space-y-1.5 pl-5 list-disc">
                          {section.id === 'economic-buyer' && (
                            <>
                              <li>Schedule a direct meeting with CFO Mary Johnson to understand her priorities</li>
                              <li>Prepare ROI analysis specifically addressing her financial concerns</li>
                              <li>Identify who has influence over Mary's decisions and engage them</li>
                            </>
                          )}
                          {section.id === 'competition' && (
                            <>
                              <li>Create a comparison matrix highlighting your unique advantages</li>
                              <li>Identify weaknesses in incumbent solution from stakeholder interviews</li>
                              <li>Develop targeted messaging addressing why you're the better alternative</li>
                            </>
                          )}
                          {section.id !== 'economic-buyer' && section.id !== 'competition' && (
                            <>
                              <li>Gather more information to increase confidence in your assessment</li>
                              <li>Focus on strengthening this area to improve overall deal health</li>
                              <li>Document specific examples that demonstrate your value proposition</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Next steps and action items */}
      <div className="card border border-neutral-200 p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-4">Action Plan</h3>
        
        <div className="border-b border-neutral-200 pb-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-neutral-700">Next steps</div>
            <button className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center">
              <PlusCircle className="h-4 w-4 mr-1" /> Add step
            </button>
          </div>
          
          <ul className="space-y-2">
            {[
              { id: 1, text: 'Schedule introductory call with CFO Mary Johnson', completed: false, due: '05/20/2025' },
              { id: 2, text: 'Send ROI calculator to VP of Sales Operations', completed: true, due: '05/15/2025' },
              { id: 3, text: 'Prepare competitive analysis for next meeting', completed: false, due: '05/25/2025' },
            ].map((item) => (
              <li key={item.id} className="flex items-start group">
                <div className={`flex-shrink-0 h-5 w-5 mr-3 mt-0.5 ${
                  item.completed ? 'text-success-500' : 'text-neutral-300 group-hover:text-neutral-400'
                }`}>
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm ${item.completed ? 'line-through text-neutral-500' : 'text-neutral-900'}`}>
                    {item.text}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Due {item.due}
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100">
                  <button className="text-neutral-400 hover:text-neutral-500">
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-neutral-700">Deal notes</div>
            <div className="text-xs text-neutral-500">Last updated 3 days ago</div>
          </div>
          
          <textarea
            className="input"
            rows={3}
            placeholder="Add notes about this opportunity..."
            defaultValue="Acme is in the early stages of evaluating solutions. They currently use a competitor's product but their contract expires in 4 months. The champion is pushing for change but we need to strengthen our relationship with the economic buyer."
          />
        </div>
      </div>
    </div>
  );
}
