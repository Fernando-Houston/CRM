'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
  Calendar,
  User
} from 'lucide-react'
import Link from 'next/link'

// Mock data - will be replaced with API calls
const mockLeads = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@abcdev.com',
    phone: '(713) 555-0123',
    company: 'ABC Development',
    jobTitle: 'CEO',
    status: 'NEW',
    priority: 'HIGH',
    source: 'WEBSITE',
    assignedTo: 'Sarah Johnson',
    budget: 5000000,
    location: 'Downtown Houston',
    createdAt: '2024-01-15',
    lastContact: '2024-01-15',
  },
  {
    id: '2',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria@houstonprops.com',
    phone: '(713) 555-0456',
    company: 'Houston Properties LLC',
    jobTitle: 'Development Manager',
    status: 'CONTACTED',
    priority: 'MEDIUM',
    source: 'REFERRAL',
    assignedTo: 'Mike Wilson',
    budget: 3000000,
    location: 'Houston Heights',
    createdAt: '2024-01-14',
    lastContact: '2024-01-16',
  },
  {
    id: '3',
    firstName: 'David',
    lastName: 'Chen',
    email: 'david@cheninvest.com',
    phone: '(713) 555-0789',
    company: 'Chen Investments',
    jobTitle: 'Investment Director',
    status: 'QUALIFIED',
    priority: 'HIGH',
    source: 'COLD_CALL',
    assignedTo: 'Sarah Johnson',
    budget: 8000000,
    location: 'Medical Center',
    createdAt: '2024-01-13',
    lastContact: '2024-01-17',
  },
]

const statusOptions = ['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST', 'DISQUALIFIED']
const priorityOptions = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']
const sourceOptions = ['ALL', 'WEBSITE', 'REFERRAL', 'COLD_CALL', 'SOCIAL_MEDIA', 'EMAIL_CAMPAIGN', 'TRADE_SHOW', 'OTHER']

export default function LeadsPage() {
  const [leads, setLeads] = useState(mockLeads)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [sourceFilter, setSourceFilter] = useState('ALL')
  const [showFilters, setShowFilters] = useState(false)

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter
    const matchesPriority = priorityFilter === 'ALL' || lead.priority === priorityFilter
    const matchesSource = sourceFilter === 'ALL' || lead.source === sourceFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesSource
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Manage and track your real estate development leads</p>
        </div>
        <Link
          href="/leads/new"
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Lead
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="input-field"
                >
                  {priorityOptions.map(priority => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="input-field"
                >
                  {sourceOptions.map(source => (
                    <option key={source} value={source}>
                      {source.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Showing {filteredLeads.length} of {leads.length} leads</span>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>

      {/* Leads Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-houston-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-houston-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                        <div className="flex items-center mt-1 space-x-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{lead.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.company}</div>
                        <div className="text-sm text-gray-500">{lead.jobTitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-badge status-${lead.status.toLowerCase().replace('_', '-')}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`priority-${lead.priority.toLowerCase()}`}>
                      {lead.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(lead.budget)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.assignedTo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                      {formatDate(lead.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-houston-600 hover:text-houston-900"
                      >
                        View
                      </Link>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || sourceFilter !== 'ALL'
                ? 'Try adjusting your search or filters.'
                : 'Get started by creating a new lead.'}
            </p>
            {!searchTerm && statusFilter === 'ALL' && priorityFilter === 'ALL' && sourceFilter === 'ALL' && (
              <div className="mt-6">
                <Link href="/leads/new" className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Lead
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 