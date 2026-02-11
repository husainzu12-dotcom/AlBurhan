'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Payment } from '@/lib/types'
import { formatCurrency } from '@/lib/calculations'
import { Edit, Trash2, Plus } from 'lucide-react'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false })

      if (fetchError) throw fetchError
      setPayments(data || [])
    } catch (err) {
      console.error('Error fetching payments:', err)
      setError('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this payment?')) return

    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id)

      if (error) throw error
      setPayments(payments.filter((p) => p.id !== id))
    } catch (err) {
      console.error('Error deleting payment:', err)
      setError('Failed to delete payment')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColor =
      status === 'paid'
        ? 'badge-success'
        : status === 'pending'
        ? 'badge-warning'
        : 'badge-error'
    return <span className={`badge ${statusColor}`}>{status}</span>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-2">Track customer payments</p>
        </div>
        <Link href="/payments/new" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Record Payment
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading payments...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No payments recorded</p>
          <Link href="/payments/new" className="btn-primary">
            Record First Payment
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="table-head">Payment #</th>
                <th className="table-head">Date</th>
                <th className="table-head">Amount</th>
                <th className="table-head">Method</th>
                <th className="table-head">Status</th>
                <th className="table-head">Reference</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{payment.payment_number}</td>
                  <td className="table-cell">{new Date(payment.payment_date).toLocaleDateString('en-IN')}</td>
                  <td className="table-cell font-medium">{formatCurrency(payment.amount)}</td>
                  <td className="table-cell">{payment.payment_method || '—'}</td>
                  <td className="table-cell">{getStatusBadge(payment.payment_status)}</td>
                  <td className="table-cell text-sm">{payment.reference_number || '—'}</td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <Link
                        href={`/payments/${payment.id}`}
                        className="btn-small bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(payment.id)}
                        className="btn-small bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
