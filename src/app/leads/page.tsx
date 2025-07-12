'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
  Calendar,
  User,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Download,
  CalendarDays,
  X,
  Trash2,
  UserPlus,
  Edit3,
  Settings,
  Eye,
  EyeOff,
  GripVertical
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LeadTableSkeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import toast from 'react-hot-toast'

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
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { data: session, status } = useSession()
  
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [sourceFilter, setSourceFilter] = useState('ALL')
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // Advanced filtering
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [budgetRange, setBudgetRange] = useState({ min: '', max: '' })
  const [assigneeFilter, setAssigneeFilter] = useState('ALL')
  
  // Bulk actions
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  
  // Column customization
  const [visibleColumns, setVisibleColumns] = useState({
    lead: true,
    company: true,
    status: true,
    priority: true,
    budget: true,
    assignedTo: true,
    created: true,
    actions: true, // Always visible
  })
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  
  // Drag and drop
  const [draggedLead, setDraggedLead] = useState<string | null>(null)
  const [dragOverLead, setDragOverLead] = useState<string | null>(null)
  
  // Debounced search for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads')
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data)
        // API returns leads directly as an array
        setLeads(Array.isArray(data) ? data : [])
      } else {
        console.log('API response not ok, using mock data')
        // API failed, use mock data
        setLeads(mockLeads)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
      // Fallback to mock data if API fails
      setLeads(mockLeads)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'loading') return // Still loading session
    
    if (!session) {
      // Not authenticated, redirect to login
      router.push('/')
      return
    }
    
    // User is authenticated, fetch leads
    fetchLeads()
  }, [session, status, router])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      // Cmd/Ctrl + N: New lead
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault()
        router.push('/leads/new')
      }

      // Cmd/Ctrl + K: Focus search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }

      // F: Toggle filters
      if (event.key === 'f' && !event.metaKey && !event.ctrlKey) {
        event.preventDefault()
        setShowFilters(!showFilters)
      }

      // Escape: Clear search
      if (event.key === 'Escape') {
        if (searchTerm) {
          setSearchTerm('')
        }
        searchInputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, showFilters, searchTerm])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 text-houston-600" /> : 
      <ChevronDown className="h-4 w-4 text-houston-600" />
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter
    const matchesPriority = priorityFilter === 'ALL' || lead.priority === priorityFilter
    const matchesSource = sourceFilter === 'ALL' || lead.source === sourceFilter
    const matchesAssignee = assigneeFilter === 'ALL' || 
      (assigneeFilter === 'UNASSIGNED' && !lead.assignedTo) ||
      lead.assignedTo === assigneeFilter

    // Date range filtering
    const leadDate = new Date(lead.createdAt)
    const matchesDateRange = (!dateRange.start || leadDate >= new Date(dateRange.start)) &&
                           (!dateRange.end || leadDate <= new Date(dateRange.end + 'T23:59:59'))

    // Budget range filtering
    const leadBudget = lead.budget || 0
    const matchesBudgetRange = (!budgetRange.min || leadBudget >= parseFloat(budgetRange.min)) &&
                             (!budgetRange.max || leadBudget <= parseFloat(budgetRange.max))

    return matchesSearch && matchesStatus && matchesPriority && matchesSource && 
           matchesAssignee && matchesDateRange && matchesBudgetRange
  }).sort((a, b) => {
    if (!sortField) return 0

    let aValue = a[sortField]
    let bValue = b[sortField]

    // Handle special cases
    if (sortField === 'name') {
      aValue = `${a.firstName} ${a.lastName}`
      bValue = `${b.firstName} ${b.lastName}`
    } else if (sortField === 'createdAt') {
      aValue = new Date(a.createdAt).getTime()
      bValue = new Date(b.createdAt).getTime()
    } else if (sortField === 'budget') {
      aValue = a.budget || 0
      bValue = b.budget || 0
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
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

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update the lead in the local state
        setLeads(prev => prev.map(lead => 
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        ))
        toast.success('Lead status updated successfully!')
      } else {
        toast.error('Failed to update lead status')
      }
    } catch (error) {
      toast.error('Error updating lead status')
      console.error('Error:', error)
    }
  }

  const handlePriorityUpdate = async (leadId: string, newPriority: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority: newPriority }),
      })

      if (response.ok) {
        // Update the lead in the local state
        setLeads(prev => prev.map(lead => 
          lead.id === leadId ? { ...lead, priority: newPriority } : lead
        ))
        toast.success('Lead priority updated successfully!')
      } else {
        toast.error('Failed to update lead priority')
      }
    } catch (error) {
      toast.error('Error updating lead priority')
      console.error('Error:', error)
    }
  }

  // Bulk action handlers
  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead.id))
    }
  }

  const bulkUpdateStatus = async (newStatus: string) => {
    try {
      const promises = selectedLeads.map(leadId => 
        fetch(`/api/leads/${leadId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
      )

      await Promise.all(promises)
      
      setLeads(prev => prev.map(lead => 
        selectedLeads.includes(lead.id) ? { ...lead, status: newStatus } : lead
      ))
      
      toast.success(`Updated ${selectedLeads.length} leads to ${newStatus.replace('_', ' ')}`)
      setSelectedLeads([])
      setShowBulkActions(false)
    } catch (error) {
      toast.error('Failed to update leads')
    }
  }

  const bulkUpdatePriority = async (newPriority: string) => {
    try {
      const promises = selectedLeads.map(leadId => 
        fetch(`/api/leads/${leadId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priority: newPriority }),
        })
      )

      await Promise.all(promises)
      
      setLeads(prev => prev.map(lead => 
        selectedLeads.includes(lead.id) ? { ...lead, priority: newPriority } : lead
      ))
      
      toast.success(`Updated ${selectedLeads.length} leads to ${newPriority} priority`)
      setSelectedLeads([])
      setShowBulkActions(false)
    } catch (error) {
      toast.error('Failed to update lead priorities')
    }
  }

  const bulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedLeads.length} leads? This action cannot be undone.`)) {
      return
    }

    try {
      const promises = selectedLeads.map(leadId => 
        fetch(`/api/leads/${leadId}`, { method: 'DELETE' })
      )

      await Promise.all(promises)
      
      setLeads(prev => prev.filter(lead => !selectedLeads.includes(lead.id)))
      
      toast.success(`Deleted ${selectedLeads.length} leads`)
      setSelectedLeads([])
      setShowBulkActions(false)
    } catch (error) {
      toast.error('Failed to delete leads')
    }
  }

  const exportSelectedToCSV = () => {
    const selectedLeadsData = filteredLeads.filter(lead => selectedLeads.includes(lead.id))
    
    const headers = [
      'Name', 'Email', 'Phone', 'Company', 'Job Title', 'Status', 'Priority', 
      'Source', 'Budget', 'Location', 'Assigned To', 'Created Date', 'Notes'
    ]

    const csvData = selectedLeadsData.map(lead => [
      `${lead.firstName} ${lead.lastName}`,
      lead.email,
      lead.phone || '',
      lead.company || '',
      lead.jobTitle || '',
      lead.status.replace('_', ' '),
      lead.priority,
      lead.source.replace('_', ' '),
      lead.budget ? formatCurrency(lead.budget) : '',
      lead.location || '',
      lead.user?.name || lead.assignedTo || 'Unassigned',
      formatDate(lead.createdAt),
      lead.notes || ''
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        row.map(field => 
          typeof field === 'string' && (field.includes(',') || field.includes('"')) 
            ? `"${field.replace(/"/g, '""')}"` 
            : field
        ).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `selected_leads_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success(`Exported ${selectedLeadsData.length} selected leads to CSV!`)
    }
  }

  // Column customization handlers
  const toggleColumnVisibility = (column: keyof typeof visibleColumns) => {
    if (column === 'actions') return // Actions column is always visible
    
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }))
  }

  const resetColumns = () => {
    setVisibleColumns({
      lead: true,
      company: true,
      status: true,
      priority: true,
      budget: true,
      assignedTo: true,
      created: true,
      actions: true,
    })
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLead(leadId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, leadId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverLead(leadId)
  }

  const handleDragLeave = () => {
    setDragOverLead(null)
  }

  const handleDrop = async (e: React.DragEvent, targetLeadId: string) => {
    e.preventDefault()
    
    if (!draggedLead || draggedLead === targetLeadId) {
      setDraggedLead(null)
      setDragOverLead(null)
      return
    }

    const draggedLeadData = leads.find(lead => lead.id === draggedLead)
    const targetLeadData = leads.find(lead => lead.id === targetLeadId)

    if (!draggedLeadData || !targetLeadData) return

    // Swap priorities
    const newDraggedPriority = targetLeadData.priority
    const newTargetPriority = draggedLeadData.priority

    try {
      // Update both leads' priorities
      await Promise.all([
        fetch(`/api/leads/${draggedLead}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priority: newDraggedPriority }),
        }),
        fetch(`/api/leads/${targetLeadId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priority: newTargetPriority }),
        })
      ])

      // Update local state
      setLeads(prev => prev.map(lead => {
        if (lead.id === draggedLead) {
          return { ...lead, priority: newDraggedPriority }
        } else if (lead.id === targetLeadId) {
          return { ...lead, priority: newTargetPriority }
        }
        return lead
      }))

      toast.success(`Swapped priorities: ${draggedLeadData.firstName} ${draggedLeadData.lastName} ↔ ${targetLeadData.firstName} ${targetLeadData.lastName}`)
    } catch (error) {
      toast.error('Failed to update priorities')
    }

    setDraggedLead(null)
    setDragOverLead(null)
  }

  const clearAllFilters = () => {
    setStatusFilter('ALL')
    setPriorityFilter('ALL')
    setSourceFilter('ALL')
    setAssigneeFilter('ALL')
    setDateRange({ start: '', end: '' })
    setBudgetRange({ min: '', max: '' })
    setSearchTerm('')
    toast.success('All filters cleared!')
  }

  const hasActiveFilters = statusFilter !== 'ALL' || priorityFilter !== 'ALL' || 
                          sourceFilter !== 'ALL' || assigneeFilter !== 'ALL' ||
                          dateRange.start || dateRange.end || budgetRange.min || budgetRange.max ||
                          debouncedSearchTerm

  const exportToCSV = () => {
    const headers = [
      'Name',
      'Email', 
      'Phone',
      'Company',
      'Job Title',
      'Status',
      'Priority',
      'Source',
      'Budget',
      'Location',
      'Assigned To',
      'Created Date',
      'Notes'
    ]

    const csvData = filteredLeads.map(lead => [
      `${lead.firstName} ${lead.lastName}`,
      lead.email,
      lead.phone || '',
      lead.company || '',
      lead.jobTitle || '',
      lead.status.replace('_', ' '),
      lead.priority,
      lead.source.replace('_', ' '),
      lead.budget ? formatCurrency(lead.budget) : '',
      lead.location || '',
      lead.user?.name || lead.assignedTo || 'Unassigned',
      formatDate(lead.createdAt),
      lead.notes || ''
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        row.map(field => 
          // Escape commas and quotes in CSV
          typeof field === 'string' && (field.includes(',') || field.includes('"')) 
            ? `"${field.replace(/"/g, '""')}"` 
            : field
        ).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success(`Exported ${filteredLeads.length} leads to CSV!`)
    }
  }

  if (status === 'loading' || loading) {
    return <LeadTableSkeleton />
  }

  if (!session) {
    return <LeadTableSkeleton /> // Will redirect, but show skeleton briefly
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">Manage and track your real estate development leads</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className="flex items-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              Columns
            </Button>
            
            {showColumnSettings && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border shadow-lg z-20">
                <div className="py-2">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Column Visibility</span>
                      <button
                        onClick={resetColumns}
                        className="text-xs text-houston-600 hover:text-houston-700"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  
                  {Object.entries(visibleColumns).map(([key, visible]) => (
                    <div key={key} className="px-3 py-2 flex items-center justify-between hover:bg-gray-50">
                      <label className="flex items-center space-x-2 text-sm text-gray-700 capitalize cursor-pointer">
                        <span>{key === 'assignedTo' ? 'Assigned To' : key}</span>
                      </label>
                      <button
                        onClick={() => toggleColumnVisibility(key as keyof typeof visibleColumns)}
                        disabled={key === 'actions'}
                        className={`p-1 rounded ${key === 'actions' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                      >
                        {visible ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={filteredLeads.length === 0}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Link href="/leads/new">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add New Lead
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">⌘+N</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search leads by name, email, or company... (⌘+K)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-houston-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="flex items-center text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center ${hasActiveFilters ? 'border-houston-500 text-houston-600' : ''}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 bg-houston-100 text-houston-700 text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {/* Basic Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-houston-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-houston-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-houston-500 focus:border-transparent"
                  >
                    {sourceOptions.map(source => (
                      <option key={source} value={source}>
                        {source.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To
                  </label>
                  <select
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-houston-500 focus:border-transparent"
                  >
                    <option value="ALL">All Assignees</option>
                    <option value="UNASSIGNED">Unassigned</option>
                    <option value="admin@houstonlandguy.com">Admin User</option>
                    <option value="manager@houstonlandguy.com">Manager User</option>
                    <option value="agent@houstonlandguy.com">Agent User</option>
                  </select>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Advanced Filters
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-houston-500 focus:border-transparent text-sm"
                        placeholder="Start date"
                      />
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-houston-500 focus:border-transparent text-sm"
                        placeholder="End date"
                      />
                    </div>
                  </div>

                  {/* Budget Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget Range ($)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={budgetRange.min}
                        onChange={(e) => setBudgetRange(prev => ({ ...prev, min: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-houston-500 focus:border-transparent text-sm"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        value={budgetRange.max}
                        onChange={(e) => setBudgetRange(prev => ({ ...prev, max: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-houston-500 focus:border-transparent text-sm"
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  {/* Quick Date Filters */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quick Date Filters
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const today = new Date()
                          const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                          setDateRange({
                            start: lastWeek.toISOString().split('T')[0],
                            end: today.toISOString().split('T')[0]
                          })
                        }}
                        className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Last 7 Days
                      </button>
                      <button
                        onClick={() => {
                          const today = new Date()
                          const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
                          setDateRange({
                            start: lastMonth.toISOString().split('T')[0],
                            end: today.toISOString().split('T')[0]
                          })
                        }}
                        className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Last 30 Days
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <Card className="bg-houston-50 border-houston-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-houston-800">
                  {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedLeads([])}
                  className="text-sm text-houston-600 hover:text-houston-700 underline"
                >
                  Clear selection
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportSelectedToCSV}
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export Selected
                </Button>
                
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="flex items-center"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Bulk Actions
                  </Button>
                  
                  {showBulkActions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border shadow-lg z-10">
                      <div className="py-2">
                        <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">
                          Update Status
                        </div>
                        {['CONTACTED', 'QUALIFIED', 'CLOSED_WON', 'CLOSED_LOST'].map(status => (
                          <button
                            key={status}
                            onClick={() => bulkUpdateStatus(status)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                          >
                            {status.replace('_', ' ')}
                          </button>
                        ))}
                        
                        <div className="border-t my-1"></div>
                        
                        <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">
                          Update Priority
                        </div>
                        {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(priority => (
                          <button
                            key={priority}
                            onClick={() => bulkUpdatePriority(priority)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                          >
                            {priority}
                          </button>
                        ))}
                        
                        <div className="border-t my-1"></div>
                        
                        <button
                          onClick={bulkDelete}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Selected
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Showing {filteredLeads.length} of {leads.length} leads</span>
          <span className="flex items-center text-xs text-gray-500">
            <GripVertical className="h-3 w-3 mr-1" />
            Drag rows to swap priorities
          </span>
        </div>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>

      {/* Leads Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-houston-600 focus:ring-houston-500 border-gray-300 rounded"
                  />
                </th>
                {visibleColumns.lead && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('name')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Lead</span>
                      {getSortIcon('name')}
                    </button>
                  </th>
                )}
                {visibleColumns.company && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('company')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Company</span>
                      {getSortIcon('company')}
                    </button>
                  </th>
                )}
                {visibleColumns.status && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('status')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Status</span>
                      {getSortIcon('status')}
                    </button>
                  </th>
                )}
                {visibleColumns.priority && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('priority')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Priority</span>
                      {getSortIcon('priority')}
                    </button>
                  </th>
                )}
                {visibleColumns.budget && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('budget')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Budget</span>
                      {getSortIcon('budget')}
                    </button>
                  </th>
                )}
                {visibleColumns.assignedTo && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                )}
                {visibleColumns.created && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Created</span>
                      {getSortIcon('createdAt')}
                    </button>
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className={`hover:bg-gray-50 transition-colors ${selectedLeads.includes(lead.id) ? 'bg-houston-50' : ''} ${
                    draggedLead === lead.id ? 'opacity-50' : ''
                  } ${
                    dragOverLead === lead.id ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                  }`}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  onDragOver={(e) => handleDragOver(e, lead.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, lead.id)}
                >
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="cursor-move text-gray-400 hover:text-gray-600" title="Drag to reorder priority">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => toggleLeadSelection(lead.id)}
                        className="h-4 w-4 text-houston-600 focus:ring-houston-500 border-gray-300 rounded"
                      />
                    </div>
                  </td>
                  {visibleColumns.lead && (
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
                  )}
                  {visibleColumns.company && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lead.company}</div>
                          <div className="text-sm text-gray-500">{lead.jobTitle}</div>
                        </div>
                      </div>
                    </td>
                  )}
                  {visibleColumns.status && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                        className={`text-sm rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-houston-500 cursor-pointer font-medium ${
                          lead.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-800' :
                          lead.status === 'QUALIFIED' ? 'bg-green-100 text-green-800' :
                          lead.status === 'CLOSED_WON' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="QUALIFIED">QUALIFIED</option>
                        <option value="PROPOSAL_SENT">PROPOSAL SENT</option>
                        <option value="NEGOTIATING">NEGOTIATING</option>
                        <option value="CLOSED_WON">CLOSED WON</option>
                        <option value="CLOSED_LOST">CLOSED LOST</option>
                        <option value="DISQUALIFIED">DISQUALIFIED</option>
                      </select>
                    </td>
                  )}
                  {visibleColumns.priority && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={lead.priority}
                        onChange={(e) => handlePriorityUpdate(lead.id, e.target.value)}
                        className={`text-sm rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-houston-500 cursor-pointer font-medium ${
                          lead.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                          lead.priority === 'URGENT' ? 'bg-red-200 text-red-900' :
                          lead.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="URGENT">URGENT</option>
                      </select>
                    </td>
                  )}
                  {visibleColumns.budget && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(lead.budget)}
                    </td>
                  )}
                  {visibleColumns.assignedTo && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.user?.name || lead.assignedTo || 'Unassigned'}
                    </td>
                  )}
                  {visibleColumns.created && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                        {formatDate(lead.createdAt)}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link href={`/leads/${lead.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
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
                <Link href="/leads/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Lead
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
} 