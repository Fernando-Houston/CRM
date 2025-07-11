'use client'

import React from 'react'
import { 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react'

const stats = [
  {
    name: 'Total Leads',
    value: '247',
    change: '+12%',
    changeType: 'positive',
    icon: Users,
  },
  {
    name: 'Active Deals',
    value: '89',
    change: '+5%',
    changeType: 'positive',
    icon: Building2,
  },
  {
    name: 'Pipeline Value',
    value: '$12.4M',
    change: '+8%',
    changeType: 'positive',
    icon: TrendingUp,
  },
  {
    name: 'Revenue This Month',
    value: '$2.1M',
    change: '+15%',
    changeType: 'positive',
    icon: DollarSign,
  },
]

const recentLeads = [
  {
    id: 1,
    name: 'John Smith',
    company: 'ABC Development',
    email: 'john@abcdev.com',
    status: 'NEW',
    priority: 'HIGH',
    assignedTo: 'Sarah Johnson',
    createdAt: '2 hours ago',
  },
  {
    id: 2,
    name: 'Maria Garcia',
    company: 'Houston Properties LLC',
    email: 'maria@houstonprops.com',
    status: 'CONTACTED',
    priority: 'MEDIUM',
    assignedTo: 'Mike Wilson',
    createdAt: '4 hours ago',
  },
  {
    id: 3,
    name: 'David Chen',
    company: 'Chen Investments',
    email: 'david@cheninvest.com',
    status: 'QUALIFIED',
    priority: 'HIGH',
    assignedTo: 'Sarah Johnson',
    createdAt: '1 day ago',
  },
]

const upcomingTasks = [
  {
    id: 1,
    title: 'Follow up with John Smith',
    type: 'CALL',
    dueDate: 'Today',
    priority: 'HIGH',
    assignedTo: 'Sarah Johnson',
  },
  {
    id: 2,
    title: 'Site visit - Downtown property',
    type: 'SITE_VISIT',
    dueDate: 'Tomorrow',
    priority: 'MEDIUM',
    assignedTo: 'Mike Wilson',
  },
  {
    id: 3,
    title: 'Send proposal to Maria Garcia',
    type: 'PROPOSAL',
    dueDate: 'Dec 15',
    priority: 'HIGH',
    assignedTo: 'Sarah Johnson',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your real estate development pipeline.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-houston-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
            <button className="text-sm text-houston-600 hover:text-houston-700">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-houston-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-houston-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-500">{lead.company}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`status-badge status-${lead.status.toLowerCase().replace('_', '-')}`}>
                    {lead.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{lead.createdAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
            <button className="text-sm text-houston-600 hover:text-houston-700">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-development-100 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-development-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{task.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center p-4 bg-houston-50 hover:bg-houston-100 rounded-lg transition-colors">
            <Users className="h-5 w-5 text-houston-600 mr-3" />
            <span className="text-sm font-medium text-houston-900">Add New Lead</span>
          </button>
          <button className="flex items-center p-4 bg-development-50 hover:bg-development-100 rounded-lg transition-colors">
            <Building2 className="h-5 w-5 text-development-600 mr-3" />
            <span className="text-sm font-medium text-development-900">Create Deal</span>
          </button>
          <button className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <Calendar className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-green-900">Schedule Task</span>
          </button>
          <button className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-purple-900">View Reports</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      <div className="card">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">High Priority Lead</p>
              <p className="text-xs text-yellow-700">John Smith from ABC Development requires immediate attention</p>
            </div>
            <span className="text-xs text-yellow-600">2 hours ago</span>
          </div>
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Deal Milestone</p>
              <p className="text-xs text-blue-700">Downtown property deal moved to negotiation stage</p>
            </div>
            <span className="text-xs text-blue-600">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  )
} 