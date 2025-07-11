'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  DollarSign,
  Calendar,
  User,
  Building2,
  TrendingUp,
  Clock
} from 'lucide-react'
import Link from 'next/link'

// Mock data - will be replaced with API calls
const mockDeals = [
  {
    id: '1',
    title: 'Downtown Mixed-Use Development',
    description: 'Development of a mixed-use property in downtown Houston',
    status: 'ACTIVE',
    stage: 'NEGOTIATION',
    value: 8500000,
    probability: 75,
    expectedCloseDate: '2024-06-30',
    assignedTo: 'Sarah Johnson',
    leadName: 'John Smith',
    leadCompany: 'ABC Development',
    properties: ['Downtown Mixed-Use Development'],
    createdAt: '2024-01-15',
    lastActivity: '2024-01-17',
  },
  {
    id: '2',
    title: 'Heights Residential Development',
    description: 'Multi-family residential development in Houston Heights',
    status: 'OPPORTUNITY',
    stage: 'PROPOSAL',
    value: 1200000,
    probability: 60,
    expectedCloseDate: '2024-04-30',
    assignedTo: 'Mike Wilson',
    leadName: 'Maria Garcia',
    leadCompany: 'Houston Properties LLC',
    properties: ['Heights Residential Development'],
    createdAt: '2024-01-14',
    lastActivity: '2024-01-16',
  },
  {
    id: '3',
    title: 'Medical Center Office Complex',
    description: 'Medical office development in the Texas Medical Center',
    status: 'OPPORTUNITY',
    stage: 'DISCOVERY',
    value: 15000000,
    probability: 40,
    expectedCloseDate: '2024-12-31',
    assignedTo: 'Sarah Johnson',
    leadName: 'David Chen',
    leadCompany: 'Chen Investments',
    properties: [],
    createdAt: '2024-01-13',
    lastActivity: '2024-01-15',
  },
]

const stages = ['DISCOVERY', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSING', 'CLOSED']
const statuses = ['OPPORTUNITY', 'ACTIVE', 'WON', 'LOST', 'ON_HOLD']

export default function DealsPage() {
  const [deals, setDeals] = useState(mockDeals)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [stageFilter, setStageFilter] = useState('ALL')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list')

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.leadCompany.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || deal.status === statusFilter
    const matchesStage = stageFilter === 'ALL' || deal.stage === stageFilter

    return matchesSearch && matchesStatus && matchesStage
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

  const getStageColor = (stage: string) => {
    const colors = {
      DISCOVERY: 'bg-blue-100 text-blue-800',
      QUALIFICATION: 'bg-yellow-100 text-yellow-800',
      PROPOSAL: 'bg-purple-100 text-purple-800',
      NEGOTIATION: 'bg-orange-100 text-orange-800',
      CLOSING: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    }
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      OPPORTUNITY: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      WON: 'bg-emerald-100 text-emerald-800',
      LOST: 'bg-red-100 text-red-800',
      ON_HOLD: 'bg-yellow-100 text-yellow-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const totalPipelineValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0)
  const weightedValue = filteredDeals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600">Manage your real estate development pipeline</p>
        </div>
        <Link
          href="/deals/new"
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Deal
        </Link>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-houston-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Pipeline</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalPipelineValue)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Weighted Value</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(weightedValue)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Deals</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredDeals.length}</p>
            </div>
          </div>
        </div>
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
                placeholder="Search deals by title, lead name, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                viewMode === 'list'
                  ? 'bg-houston-100 text-houston-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                viewMode === 'pipeline'
                  ? 'bg-houston-100 text-houston-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pipeline
            </button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="ALL">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stage
                </label>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="ALL">All Stages</option>
                  {stages.map(stage => (
                    <option key={stage} value={stage}>
                      {stage}
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
        <span>Showing {filteredDeals.length} of {deals.length} deals</span>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>

      {/* Deals Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Probability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Close
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-development-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-development-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                        <div className="text-sm text-gray-500">{deal.description}</div>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                            {deal.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{deal.leadName}</div>
                        <div className="text-sm text-gray-500">{deal.leadCompany}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(deal.stage)}`}>
                      {deal.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(deal.value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-houston-600 h-2 rounded-full" 
                          style={{ width: `${deal.probability}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{deal.probability}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                      {formatDate(deal.expectedCloseDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {deal.assignedTo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/deals/${deal.id}`}
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

        {filteredDeals.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No deals found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'ALL' || stageFilter !== 'ALL'
                ? 'Try adjusting your search or filters.'
                : 'Get started by creating a new deal.'}
            </p>
            {!searchTerm && statusFilter === 'ALL' && stageFilter === 'ALL' && (
              <div className="mt-6">
                <Link href="/deals/new" className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Deal
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 