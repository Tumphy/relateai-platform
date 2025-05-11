import Link from 'next/link';
import Image from 'next/image';
import { 
  BarChart3, 
  Building2, 
  ChevronRight, 
  Mail, 
  MessageSquare, 
  SignalHigh, 
  Target, 
  Zap,
  ArrowUp,
  ArrowRight,
  Users,
  Phone,
  Calendar
} from 'lucide-react';

// Mock data
const signals = [
  {
    id: 1,
    company: 'Finastra',
    signal: 'Hiring 3 new DevOps Engineers',
    date: '2d ago',
    score: 87,
    importance: 'high'
  },
  {
    id: 2,
    company: 'Stripe',
    signal: 'New product launch: Terminal API',
    date: '3d ago',
    score: 82,
    importance: 'high'
  },
  {
    id: 3,
    company: 'IBM',
    signal: 'Expanding cloud services division',
    date: '5d ago',
    score: 75,
    importance: 'medium'
  },
  {
    id: 4,
    company: 'Microsoft',
    signal: 'New Azure compliance certification',
    date: '1w ago',
    score: 68,
    importance: 'medium'
  }
];

const campaigns = [
  { 
    id: 1, 
    name: 'Q2 Enterprise Outreach', 
    status: 'active', 
    contacts: 145, 
    opened: 89, 
    replied: 32,
    progress: 65
  },
  { 
    id: 2, 
    name: 'Banking Sector Cold Outreach', 
    status: 'active', 
    contacts: 78, 
    opened: 41, 
    replied: 13,
    progress: 45
  },
  { 
    id: 3, 
    name: 'Product Launch Follow-up', 
    status: 'paused', 
    contacts: 213, 
    opened: 167, 
    replied: 52,
    progress: 80
  }
];

const outreachTasks = [
  { 
    id: 1, 
    type: 'email',
    company: 'Acme Corp',
    contact: 'Jane Smith',
    title: 'Follow up on demo',
    time: '10:00 AM'
  },
  { 
    id: 2, 
    type: 'linkedin',
    company: 'TechGiant',
    contact: 'John Doe',
    title: 'Connection request',
    time: '11:30 AM' 
  },
  { 
    id: 3, 
    type: 'call',
    company: 'Innovative Solutions',
    contact: 'Mike Johnson',
    title: 'Discovery call',
    time: '2:00 PM' 
  },
  { 
    id: 4, 
    type: 'meeting',
    company: 'Global Finance',
    contact: 'Sarah Chen',
    title: 'Product demo',
    time: '3:30 PM' 
  }
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <select className="rounded-md border-neutral-300 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This quarter</option>
            <option>This year</option>
          </select>
          <button className="btn-primary">New Account</button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            label: 'Total Accounts', 
            value: '257', 
            change: '+12%',
            positive: true,
            icon: <Building2 className="h-6 w-6 text-primary-600" />,
            href: '/dashboard/accounts' 
          },
          { 
            label: 'Active Sequences', 
            value: '8', 
            change: '+2',
            positive: true,
            icon: <Mail className="h-6 w-6 text-primary-600" />,
            href: '/dashboard/campaigns' 
          },
          { 
            label: 'Reply Rate', 
            value: '28%', 
            change: '+5%',
            positive: true,
            icon: <MessageSquare className="h-6 w-6 text-primary-600" />,
            href: '/dashboard/analytics' 
          },
          { 
            label: 'New Signals', 
            value: '34', 
            change: '+18',
            positive: true,
            icon: <SignalHigh className="h-6 w-6 text-primary-600" />,
            href: '/dashboard/signals' 
          },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-primary-50">
                {stat.icon}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500">{stat.label}</dt>
                  <dd>
                    <div className="flex items-baseline">
                      <div className="text-2xl font-semibold text-neutral-900">{stat.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.positive ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {stat.positive ? (
                          <ArrowUp className="h-3 w-3 mr-0.5 flex-shrink-0" />
                        ) : (
                          <ArrowUp className="h-3 w-3 mr-0.5 flex-shrink-0 transform rotate-180" />
                        )}
                        {stat.change}
                      </div>
                    </div>
                  </dd>
                </dl>
              </div>
              <div className="ml-auto">
                <Link href={stat.href} className="text-primary-600 hover:text-primary-900">
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Signals card */}
        <div className="card lg:col-span-2">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium leading-6 text-neutral-900">AI Signals</h3>
              <p className="mt-1 max-w-2xl text-sm text-neutral-500">
                Recent buying signals from accounts matching your ICP
              </p>
            </div>
            <Link href="/dashboard/signals" className="text-sm text-primary-600 hover:text-primary-900 flex items-center">
              View all signals
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="border-t border-neutral-200">
            <ul role="list" className="divide-y divide-neutral-200">
              {signals.map((signal) => (
                <li key={signal.id} className="px-4 py-4 sm:px-6 hover:bg-neutral-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded bg-neutral-200 flex items-center justify-center text-neutral-600 font-medium">
                          {signal.company.substring(0, 2)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-neutral-900">{signal.company}</div>
                        <div className="text-sm text-neutral-500">{signal.signal}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 text-sm text-neutral-500">{signal.date}</div>
                      <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        signal.importance === 'high' 
                          ? 'bg-success-100 text-success-800' 
                          : signal.importance === 'medium'
                          ? 'bg-warning-100 text-warning-800'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}>
                        {signal.score}% match
                      </div>
                      <button className="ml-4 text-sm text-primary-600 hover:text-primary-900">
                        Reach out
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Outreach tasks */}
        <div className="card">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-neutral-900">Today's Outreach</h3>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              Tasks scheduled for today
            </p>
          </div>
          <div className="border-t border-neutral-200">
            <ul role="list" className="divide-y divide-neutral-200">
              {outreachTasks.map((task) => (
                <li key={task.id} className="px-4 py-4 sm:px-6 hover:bg-neutral-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {task.type === 'email' && (
                        <Mail className="h-5 w-5 text-primary-600" />
                      )}
                      {task.type === 'linkedin' && (
                        <Users className="h-5 w-5 text-secondary-600" />
                      )}
                      {task.type === 'call' && (
                        <Phone className="h-5 w-5 text-success-600" />
                      )}
                      {task.type === 'meeting' && (
                        <Calendar className="h-5 w-5 text-warning-600" />
                      )}
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900">{task.title}</div>
                      <div className="text-sm text-neutral-500">{task.contact} • {task.company}</div>
                    </div>
                    <div className="ml-auto text-sm text-neutral-500">{task.time}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-4 py-4 sm:px-6 border-t border-neutral-200">
              <Link 
                href="/dashboard/campaigns" 
                className="text-sm font-medium text-primary-600 hover:text-primary-900 flex items-center justify-center"
              >
                View all tasks
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Campaigns */}
        <div className="card lg:col-span-3">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium leading-6 text-neutral-900">Active Campaigns</h3>
              <p className="mt-1 max-w-2xl text-sm text-neutral-500">
                Current outreach sequences and their performance
              </p>
            </div>
            <Link href="/dashboard/campaigns" className="text-sm text-primary-600 hover:text-primary-900 flex items-center">
              Manage campaigns
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="border-t border-neutral-200">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Campaign</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Contacts</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Opened</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Replied</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Progress</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">{campaign.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${
                          campaign.status === 'active' 
                            ? 'bg-success-100 text-success-800' 
                            : campaign.status === 'paused'
                            ? 'bg-neutral-100 text-neutral-800'
                            : 'bg-danger-100 text-danger-800'
                        }`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{campaign.contacts}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{campaign.opened} ({Math.round(campaign.opened / campaign.contacts * 100)}%)</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{campaign.replied} ({Math.round(campaign.replied / campaign.contacts * 100)}%)</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-neutral-200 rounded-full h-2.5">
                          <div 
                            className="bg-primary-600 h-2.5 rounded-full" 
                            style={{ width: `${campaign.progress}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/dashboard/campaigns/${campaign.id}`} className="text-primary-600 hover:text-primary-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: 'MEDDPPICC Framework',
            description: 'Build structured account plans with the proven MEDDPPICC sales qualification framework.',
            icon: <Target className="h-6 w-6 text-primary-600" />,
            href: '/dashboard/accounts'
          },
          {
            title: 'AI-Powered Messaging',
            description: 'Create personalized outreach messages with GPT that resonate with your prospects.',
            icon: <Zap className="h-6 w-6 text-primary-600" />,
            href: '/dashboard/campaigns/new'
          },
          {
            title: 'Sales Analytics',
            description: 'Track performance metrics and identify opportunities to improve your outreach.',
            icon: <BarChart3 className="h-6 w-6 text-primary-600" />,
            href: '/dashboard/analytics'
          }
        ].map((feature) => (
          <div key={feature.title} className="card hover:shadow-md transition-all">
            <div className="p-6">
              <div className="p-2 rounded-md bg-primary-50 inline-block">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{feature.description}</p>
              <div className="mt-6">
                <Link href={feature.href} className="text-sm font-medium text-primary-600 hover:text-primary-900 flex items-center">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}