'use client'

import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import VirtualizationTest from '@/components/test/VirtualizationTest'

export default function VirtualizationTestPage() {
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">仮想化スクロールテスト</h1>
        <VirtualizationTest />
      </div>
    </AuthenticatedLayout>
  )
}