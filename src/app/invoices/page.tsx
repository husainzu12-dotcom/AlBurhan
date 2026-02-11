'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Invoice, Sale, Customer } from '@/lib/types'
import { formatCurrency } from '@/lib/calculations'
import { Eye, Trash2, Plus } from 'lucide-react'

interface InvoiceWithDetails extends Invoice {
  sale?: Sale
  customer?: Customer
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .order('invoice_date', { ascending: false })

      if (fetchError) throw fetchError

      // Fetch sales and customers for each invoice
      const enrichedInvoices: InvoiceWithDetails[] = []
      for (const invoice of data || []) {
        const { data: saleData } = await supabase
          .from('sales')
          .select('*')
          .eq('id', invoice.sale_id)
          .single()

        const { data: customerData } = await supabase
          .from('customers')
          .select('*')
          .eq('id', saleData?.customer_id)
          .single()

        enrichedInvoices.push({
          ...invoice,
          sale: saleData,
          customer: customerData,
        })
      }

      setInvoices(enrichedInvoices)
    } catch (err) {
      console.error('Error fetching invoices:', err)
      setError('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this invoice?')) return

    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)

      if (error) throw error
      setInvoices(invoices.filter((i) => i.id !== id))
    } catch (err) {
      console.error('Error deleting invoice:', err)
      setError('Failed to delete invoice')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices & Quotations</h1>
          <p className="text-gray-600 mt-2">Manage invoices and quotations</p>
        </div>
        <Link href="/invoices/new" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Create Invoice
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
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No invoices found</p>
          <Link href="/invoices/new" className="btn-primary">
            Create First Invoice
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="table-head">Invoice #</th>
                <th className="table-head">Type</th>
                <th className="table-head">Date</th>
                <th className="table-head">Customer</th>
                <th className="table-head">Amount</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const typeColor =
                  invoice.invoice_type === 'invoice'
                    ? 'badge-success'
                    : 'badge-warning'

                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{invoice.invoice_number}</td>
                    <td className="table-cell">
                      <span className={`badge ${typeColor}`}>
                        {invoice.invoice_type}
                      </span>
                    </td>
                    <td className="table-cell">
                      {new Date(invoice.invoice_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="table-cell">{invoice.customer?.company_name || '—'}</td>
                    <td className="table-cell font-medium">
                      {invoice.sale
                        ? formatCurrency(invoice.sale.total_amount)
                        : '—'}
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="btn-small bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(invoice.id)}
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
