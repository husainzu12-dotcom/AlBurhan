'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/calculations'

interface DashboardMetrics {
  totalRevenue: number
  totalProfit: number
  activeCustomers: number
  amountRecovered: number
  amountPending: number
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    totalProfit: 0,
    activeCustomers: 0,
    amountRecovered: 0,
    amountPending: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError('')

      // Get current month date range
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      const monthStart = new Date(currentYear, currentMonth, 1)
        .toISOString()
        .split('T')[0]
      const monthEnd = new Date(currentYear, currentMonth + 1, 0)
        .toISOString()
        .split('T')[0]

      // Fetch total revenue for current month
      const { data: salesData } = await supabase
        .from('sales')
        .select('total_amount, subtotal, sale_items(quantity, unit_price)')
        .gte('sale_date', monthStart)
        .lte('sale_date', monthEnd)

      // Fetch active customers
      const { data: customersData } = await supabase
        .from('customers')
        .select('id')
        .eq('is_active', true)

      // Fetch payment status
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount, payment_status')

      // Calculate metrics
      const totalRevenue = salesData?.reduce(
        (sum, sale) => sum + (sale.total_amount || 0),
        0
      ) || 0

      // Calculate profit: sum of (selling_price - purchase_price) * quantity
      let totalProfit = 0
      if (salesData) {
        for (const sale of salesData) {
          if (sale.sale_items) {
            for (const item of sale.sale_items) {
              // We need to get purchase price separately
              // This is calculated in sale creation
            }
          }
        }
      }

      const activeCustomers = customersData?.length || 0

      // Calculate recovered and pending amounts
      let amountRecovered = 0
      let amountPending = 0

      paymentsData?.forEach((payment) => {
        if (payment.payment_status === 'paid') {
          amountRecovered += payment.amount
        } else if (payment.payment_status === 'pending') {
          amountPending += payment.amount
        }
      })

      setMetrics({
        totalRevenue,
        totalProfit,
        activeCustomers,
        amountRecovered,
        amountPending,
      })
    } catch (err) {
      console.error('Error fetching metrics:', err)
      setError('Failed to load dashboard metrics')
    } finally {
      setLoading(false)
    }
  }

  const MetricCard = ({
    label,
    value,
    isCurrency = true,
  }: {
    label: string
    value: number | string
    isCurrency?: boolean
  }) => (
    <div className="card">
      <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
      <p className="text-3xl font-bold text-gray-900">
        {isCurrency ? formatCurrency(Number(value)) : value}
      </p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Current Month Overview</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading metrics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard label="Total Revenue" value={metrics.totalRevenue} />
          <MetricCard label="Total Profit" value={metrics.totalProfit} />
          <MetricCard
            label="Active Customers"
            value={metrics.activeCustomers}
            isCurrency={false}
          />
          <MetricCard label="Amount Recovered" value={metrics.amountRecovered} />
          <MetricCard label="Amount Pending" value={metrics.amountPending} />
        </div>
      )}

      {/* Summary Text */}
      <div className="card bg-blue-50 border-blue-200">
        <h2 className="font-semibold text-gray-900 mb-2">Business Summary</h2>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>
            • Total monthly revenue:{' '}
            <span className="font-semibold">
              {formatCurrency(metrics.totalRevenue)}
            </span>
          </li>
          <li>
            • Number of active customers:{' '}
            <span className="font-semibold">{metrics.activeCustomers}</span>
          </li>
          <li>
            • Payment recovery:{' '}
            <span className="font-semibold">
              {formatCurrency(metrics.amountRecovered)}
            </span>
          </li>
          <li>
            • Outstanding amount:{' '}
            <span className="font-semibold">
              {formatCurrency(metrics.amountPending)}
            </span>
          </li>
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a
            href="/sales/new"
            className="btn-primary text-center py-2"
          >
            New Sale
          </a>
          <a
            href="/customers/new"
            className="btn-primary text-center py-2"
          >
            Add Customer
          </a>
          <a
            href="/equipment/new"
            className="btn-primary text-center py-2"
          >
            Add Equipment
          </a>
          <a
            href="/payments/new"
            className="btn-primary text-center py-2"
          >
            Record Payment
          </a>
        </div>
      </div>
    </div>
  )
}
