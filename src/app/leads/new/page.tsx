'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  User, 
  Building2, 
  MapPin, 
  DollarSign,
  Calendar,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

const propertyTypes = [
  'RESIDENTIAL',
  'COMMERCIAL', 
  'INDUSTRIAL',
  'MIXED_USE',
  'LAND',
  'MULTIFAMILY',
  'OFFICE',
  'RETAIL',
  'WAREHOUSE',
  'HOTEL'
]

const sources = [
  'WEBSITE',
  'REFERRAL',
  'COLD_CALL',
  'SOCIAL_MEDIA',
  'EMAIL_CAMPAIGN',
  'TRADE_SHOW',
  'OTHER'
]

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

export default function NewLeadPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    source: 'WEBSITE',
    priority: 'MEDIUM',
    budget: '',
    timeline: '',
    propertyTypes: [] as string[],
    location: '',
    notes: '',
    assignedTo: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePropertyTypeChange = (propertyType: string) => {
    setFormData(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(propertyType)
        ? prev.propertyTypes.filter(pt => pt !== propertyType)
        : [...prev.propertyTypes, propertyType]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Show loading toast
    const loadingToast = toast.loading('Creating lead...')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          jobTitle: formData.jobTitle,
          source: formData.source,
          priority: formData.priority,
          budget: formData.budget ? parseFloat(formData.budget.replace(/[^0-9.]/g, '')) : null,
          timeline: formData.timeline,
          propertyType: formData.propertyTypes,
          location: formData.location,
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast)
        toast.success(`Lead created successfully! ${formData.firstName} ${formData.lastName} has been added to your leads.`)
        
        // Redirect to leads list
        router.push('/leads')
      } else {
        const errorData = await response.json()
        toast.dismiss(loadingToast)
        toast.error(errorData.message || 'Failed to create lead. Please try again.')
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error('Network error. Please check your connection and try again.')
      console.error('Error creating lead:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in inputs/textareas
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      // Cmd/Ctrl + S: Save form
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault()
        if (!isSubmitting) {
          const form = document.querySelector('form')
          if (form) {
            form.requestSubmit()
          }
        }
      }

      // Escape: Go back to leads list
      if (event.key === 'Escape') {
        router.push('/leads')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, isSubmitting])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/leads"
            className="flex items-center text-gray-600 hover:text-houston-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Back to Leads</span>
          </Link>
          <div className="border-l pl-4 ml-4">
            <h1 className="text-2xl font-bold text-gray-900">Add New Lead</h1>
            <p className="text-gray-600">Capture a new real estate development lead</p>
          </div>
        </div>
      </div>

      {/* Lead Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 text-houston-600 mr-2" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter phone number"
              />
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 text-houston-600 mr-2" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-houston-500 focus:border-transparent"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-houston-500 focus:border-transparent"
                  placeholder="Enter job title"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Details */}
        <div className="card">
          <div className="flex items-center mb-6">
            <FileText className="h-5 w-5 text-houston-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Lead Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                Lead Source *
              </label>
              <select
                id="source"
                name="source"
                required
                value={formData.source}
                onChange={handleInputChange}
                className="input-field"
              >
                {sources.map(source => (
                  <option key={source} value={source}>
                    {source.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                id="priority"
                name="priority"
                required
                value={formData.priority}
                onChange={handleInputChange}
                className="input-field"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="e.g., $1M - $5M"
                />
              </div>
            </div>

            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                Timeline
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="e.g., 6-12 months"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Property Types of Interest
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {propertyTypes.map(propertyType => (
                <label key={propertyType} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.propertyTypes.includes(propertyType)}
                    onChange={() => handlePropertyTypeChange(propertyType)}
                    className="h-4 w-4 text-houston-600 focus:ring-houston-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {propertyType.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="input-field pl-10"
                placeholder="e.g., Downtown Houston, Houston Heights"
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Additional notes about the lead..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            href="/leads"
            className="btn-secondary"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Lead
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">⌘+S</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 