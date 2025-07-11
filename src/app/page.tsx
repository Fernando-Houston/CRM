'use client'

import React from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Building2, Users, TrendingUp, MapPin } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  React.useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        console.error('Login failed:', result.error)
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-houston-50 to-houston-100">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-houston-50 to-houston-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="h-12 w-12 text-houston-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">
                Houston Development Intelligence
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Custom CRM Platform for Real Estate Development Lead Management
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Login Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Sign In to Your CRM
              </h2>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="input-field"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    className="input-field"
                    placeholder="Enter your password"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full btn-primary py-3 text-lg"
                >
                  Sign In
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Demo Credentials: admin@houstonlandguy.com / password123
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Transform Your Real Estate Development Business
                </h3>
                <p className="text-lg text-gray-600 mb-8">
                  Streamline lead management, track deals, and maximize your development opportunities with our specialized CRM platform.
                </p>
              </div>

              <div className="grid gap-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-houston-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Lead Management</h4>
                    <p className="text-gray-600">Capture, qualify, and track leads from website engagement to deal closure.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-houston-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Pipeline Analytics</h4>
                    <p className="text-gray-600">Monitor conversion rates, track performance, and forecast revenue.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <MapPin className="h-8 w-8 text-houston-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Property Database</h4>
                    <p className="text-gray-600">Manage development properties with detailed specifications and market data.</p>
                  </div>
                </div>
              </div>

              <div className="bg-houston-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-houston-900 mb-2">
                  Key Features
                </h4>
                <ul className="space-y-2 text-sm text-houston-800">
                  <li>• Automated lead capture from houstonlandguy.com</li>
                  <li>• Visual pipeline management with drag-and-drop</li>
                  <li>• Financial modeling and deal profitability analysis</li>
                  <li>• Document management and contract tracking</li>
                  <li>• Site visit scheduling and coordination</li>
                  <li>• Real-time analytics and reporting</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 