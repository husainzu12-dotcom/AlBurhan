'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Sale } from '@/lib/types'
import { ArrowLeft } from 'lucide-react'

export default function NewInvoicePage() {
  const router = useRouter()

  const [sales, setSales] = useState<Sale[]>([])
  const [saleId, setSaleId] = useState('')
  const [invoiceType, setInvoiceType] = useState('invoice')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      setLoading(true)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!saleId) {
      setError('Please select a sale')
      return
    }

    try {
      setSaving(true)
      setError('')

      const invoiceNumber = `INV-${Date.now()}`

      const { error: insertError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          sale_id: Number(saleId),
          invoice_type: invoiceType,
          invoice_date: invoiceDate,
          due_date: dueDate || null,
          notes: notes || null,
        })

      if (insertError) throw insertError

      alert('Invoice created successfully')
      router.push('/invoices')
    } catch (err) {
      console.error('Error creating invoice:', err)
      setError('Failed to create invoice')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href="/invoices" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
        <ArrowLeft size={20} />
        Back to Invoices
      </Link>

      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Invoice</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Sale / Order *
            </label>
            <select
              value={saleId}
              onChange={(e) => setSaleId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Choose a sale</option>
              {sales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sale_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type *
            </label>
            <select
              value={invoiceType}
              onChange={(e) => setInvoiceType(e.target.value)}
              className="input-field"
              required
            >
              <option value="invoice">Invoice (with GST 18%)</option>
              <option value="quotation">Quotation (no GST)</option>
            </select>
            {invoiceType === 'quotation' && (
              <p className="text-sm text-blue-600 mt-2">
                ℹ️ Quotation will not include GST charges
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date {invoiceType === 'invoice' ? '*' : '(Optional)'}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment terms, special notes, etc."
              className="input-field"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Invoice'}
            </button>
            <Link href="/invoices" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
