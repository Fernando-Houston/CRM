'use client'

import React, { useState } from 'react'
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

    try {
      // TODO: Replace with actual API call
      console.log('Submitting lead:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to leads list
      router.push('/leads')
    } catch (error) {
      console.error('Error creating lead:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/leads"
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Lead</h1>
            <p className="text-gray-600">Capture a new real estate development lead</p>
          </div>
        </div>
      </div>

      {/* Lead Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact Information */}
        <div className="card">
          <div className="flex items-center mb-6">
            <User className="h-5 w-5 text-houston-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          </div>
          
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
        </div>

        {/* Company Information */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Building2 className="h-5 w-5 text-houston-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
          </div>
          
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
                className="input-field"
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
                className="input-field"
                placeholder="Enter job title"
              />
            </div>
          </div>
        </div>

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
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 