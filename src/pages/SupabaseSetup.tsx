import React from 'react'
import SupabaseSetupWizard from '../components/SupabaseSetupWizard'

const SupabaseSetup: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Cài đặt Supabase cho Comment System
          </h1>
          <p className="text-lg text-gray-600">
            Hướng dẫn từng bước để cài đặt và cấu hình Supabase
          </p>
        </div>

        {/* Setup Wizard */}
        <SupabaseSetupWizard />
      </div>
    </div>
  )
}

export default SupabaseSetup
