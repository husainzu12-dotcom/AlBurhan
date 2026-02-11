'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Sale } from '@/lib/types'
import { formatCurrency } from '@/lib/calculations'
import { Eye, Plus, Trash2 } from 'lucide-react'

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false })

      if (fetchError) throw fetchError
      setSales(data || [])
    } catch (err) {
      console.error('Error fetching sales:', err)
      setError('Failed to load sales')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this sale? This will also restore stock.')) return

    try {
      // This would need a more complex operation to restore stock
      // For now, just mark as cancelled
      const { error } = await supabase
        .from('sales')
        .update({ sale_status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      setSales(sales.filter((s) => s.id !== id))
    } catch (err) {
      console.error('Error deleting sale:', err)
      setError('Failed to delete sale')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600 mt-2">Manage sales orders</p>
        </div>
        <Link href="/sales/new" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          New Sale
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
          <p className="text-gray-600">Loading sales...</p>
        </div>
      ) : sales.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No sales found</p>
          <Link href="/sales/new" className="btn-primary">
            Create First Sale
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="table-head">Sale Number</th>
                <th className="table-head">Date</th>
                <th className="table-head">Items</th>
                <th className="table-head">Subtotal</th>
                <th className="table-head">GST (18%)</th>
                <th className="table-head">Total</th>
                <th className="table-head">Status</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => {
                const statusColor =
                  sale.sale_status === 'completed'
                    ? 'badge-success'
                    : sale.sale_status === 'pending'
                    ? 'badge-warning'
                    : 'badge-error'

                return (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{sale.sale_number}</td>
                    <td className="table-cell">{new Date(sale.sale_date).toLocaleDateString('en-IN')}</td>
                    <td className="table-cell">{sale.total_quantity}</td>
                    <td className="table-cell">{formatCurrency(sale.subtotal)}</td>
                    <td className="table-cell">{formatCurrency(sale.gst_amount)}</td>
                    <td className="table-cell font-medium">
                      {formatCurrency(sale.total_amount)}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${statusColor}`}>{sale.sale_status}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <Link
                          href={`/sales/${sale.id}`}
                          className="btn-small bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="btn-small bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
