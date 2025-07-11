'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  MapPin,
  DollarSign,
  Building2,
  Calendar,
  Square,
  Image
} from 'lucide-react'
import Link from 'next/link'

// Mock data - will be replaced with API calls
const mockProperties = [
  {
    id: '1',
    name: 'Downtown Mixed-Use Development',
    address: '1200 Main Street',
    city: 'Houston',
    state: 'TX',
    zipCode: '77002',
    propertyType: 'MIXED_USE',
    landSize: 2.5,
    buildingSize: 150000,
    price: 8500000,
    pricePerSqFt: 56.67,
    capRate: 6.5,
    condition: 'NEEDS_RENOVATION',
    yearBuilt: null,
    features: ['Downtown Location', 'Transit Access', 'Parking Available'],
    images: [],
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Heights Residential Development',
    address: '4500 Yale Street',
    city: 'Houston',
    state: 'TX',
    zipCode: '77018',
    propertyType: 'RESIDENTIAL',
    landSize: 1.2,
    buildingSize: 8000,
    price: 1200000,
    pricePerSqFt: 150.00,
    capRate: 5.2,
    condition: 'FAIR',
    yearBuilt: 1950,
    features: ['Historic District', 'Walkable Location', 'Good Schools'],
    images: [],
    createdAt: '2024-01-14',
  },
  {
    id: '3',
    name: 'Medical Center Office Complex',
    address: '7500 Fannin Street',
    city: 'Houston',
    state: 'TX',
    zipCode: '77054',
    propertyType: 'OFFICE',
    landSize: 3.0,
    buildingSize: 250000,
    price: 15000000,
    pricePerSqFt: 60.00,
    capRate: 7.2,
    condition: 'GOOD',
    yearBuilt: 1985,
    features: ['Medical Center Location', 'High Traffic', 'Modern Infrastructure'],
    images: [],
    createdAt: '2024-01-13',
  },
]

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

const conditions = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'NEEDS_RENOVATION']

export default function PropertiesPage() {
  const [properties, setProperties] = useState(mockProperties)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [conditionFilter, setConditionFilter] = useState('ALL')
  const [showFilters, setShowFilters] = useState(false)

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'ALL' || property.propertyType === typeFilter
    const matchesCondition = conditionFilter === 'ALL' || property.condition === conditionFilter

    return matchesSearch && matchesType && matchesCondition
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

  const getTypeColor = (type: string) => {
    const colors = {
      RESIDENTIAL: 'bg-blue-100 text-blue-800',
      COMMERCIAL: 'bg-green-100 text-green-800',
      INDUSTRIAL: 'bg-purple-100 text-purple-800',
      MIXED_USE: 'bg-orange-100 text-orange-800',
      LAND: 'bg-yellow-100 text-yellow-800',
      MULTIFAMILY: 'bg-indigo-100 text-indigo-800',
      OFFICE: 'bg-pink-100 text-pink-800',
      RETAIL: 'bg-teal-100 text-teal-800',
      WAREHOUSE: 'bg-gray-100 text-gray-800',
      HOTEL: 'bg-red-100 text-red-800',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getConditionColor = (condition: string) => {
    const colors = {
      EXCELLENT: 'bg-green-100 text-green-800',
      GOOD: 'bg-blue-100 text-blue-800',
      FAIR: 'bg-yellow-100 text-yellow-800',
      POOR: 'bg-red-100 text-red-800',
      NEEDS_RENOVATION: 'bg-orange-100 text-orange-800',
    }
    return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const totalValue = filteredProperties.reduce((sum, property) => sum + property.price, 0)
  const averagePricePerSqFt = filteredProperties.length > 0 
    ? filteredProperties.reduce((sum, property) => sum + property.pricePerSqFt, 0) / filteredProperties.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">Manage your real estate development property database</p>
        </div>
        <Link
          href="/properties/new"
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Property
        </Link>
      </div>

      {/* Property Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-houston-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Square className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Price/Sq Ft</p>
              <p className="text-2xl font-semibold text-gray-900">${averagePricePerSqFt.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Properties</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredProperties.length}</p>
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
                placeholder="Search properties by name, address, or city..."
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="ALL">All Types</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="ALL">All Conditions</option>
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>
                      {condition.replace('_', ' ')}
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
        <span>Showing {filteredProperties.length} of {properties.length} properties</span>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <div key={property.id} className="card hover:shadow-lg transition-shadow">
            {/* Property Image Placeholder */}
            <div className="relative h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
              <Image className="h-12 w-12 text-gray-400" />
              <span className="text-sm text-gray-500">Property Image</span>
            </div>

            {/* Property Details */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {property.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.address}, {property.city}, {property.state} {property.zipCode}
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(property.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price/Sq Ft</p>
                  <p className="text-lg font-semibold text-gray-900">${property.pricePerSqFt}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Land Size</p>
                  <p className="text-sm font-medium text-gray-900">{property.landSize} acres</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Building Size</p>
                  <p className="text-sm font-medium text-gray-900">{property.buildingSize?.toLocaleString()} sq ft</p>
                </div>
              </div>

              {/* Property Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(property.propertyType)}`}>
                  {property.propertyType.replace('_', ' ')}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConditionColor(property.condition)}`}>
                  {property.condition.replace('_', ' ')}
                </span>
                {property.capRate && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {property.capRate}% Cap Rate
                  </span>
                )}
              </div>

              {/* Features */}
              {property.features.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Key Features</p>
                  <div className="flex flex-wrap gap-1">
                    {property.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        {feature}
                      </span>
                    ))}
                    {property.features.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        +{property.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Link
                  href={`/properties/${property.id}`}
                  className="text-houston-600 hover:text-houston-900 text-sm font-medium"
                >
                  View Details
                </Link>
                <div className="text-xs text-gray-500">
                  Added {formatDate(property.createdAt)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || typeFilter !== 'ALL' || conditionFilter !== 'ALL'
              ? 'Try adjusting your search or filters.'
              : 'Get started by adding a new property.'}
          </p>
          {!searchTerm && typeFilter === 'ALL' && conditionFilter === 'ALL' && (
            <div className="mt-6">
              <Link href="/properties/new" className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add New Property
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 