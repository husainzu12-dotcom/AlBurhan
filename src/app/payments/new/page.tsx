'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Sale, Customer } from '@/lib/types'
import { formatCurrency } from '@/lib/calculations'
import { ArrowLeft } from 'lucide-react'

export default function NewPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const saleIdParam = searchParams.get('sale_id')

  const [sales, setSales] = useState<Sale[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  const [saleId, setSaleId] = useState(saleIdParam || '')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [customerId, setCustomerId] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('paid')
  const [notes, setNotes] = useState('')

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      const { data: salesData } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false })

      const { data: customersData } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('company_name', { ascending: true })

      setSales(salesData || [])
      setCustomers(customersData || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setSaleId(id)
    const sale = sales.find((s) => s.id === Number(id))
    setSelectedSale(sale || null)
    if (sale) {
      setCustomerId(String(sale.customer_id))
      setAmount(String(sale.total_amount))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!saleId || !customerId || !amount) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      setError('')

      const paymentNumber = `PAY-${Date.now()}`

      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          payment_number: paymentNumber,
          sale_id: Number(saleId),
          customer_id: Number(customerId),
          payment_date: paymentDate,
          amount: Number(amount),
          payment_method: paymentMethod || null,
          reference_number: referenceNumber || null,
          payment_status: paymentStatus,
          notes: notes || null,
        })

      if (insertError) throw insertError

      alert('Payment recorded successfully')
      router.push('/payments')
    } catch (err) {
      console.error('Error creating payment:', err)
      setError('Failed to record payment')
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
      <Link href="/payments" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
        <ArrowLeft size={20} />
        Back to Payments
      </Link>

      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Record Payment</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sale / Invoice *
            </label>
            <select
              value={saleId}
              onChange={handleSaleChange}
              className="input-field"
              required
            >
              <option value="">Select a sale</option>
              {sales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sale_number} - {formatCurrency(s.total_amount)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select a customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="input-field"
              >
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Cheque no. or transaction ID"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="input-field"
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional information"
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
              {saving ? 'Recording...' : 'Record Payment'}
            </button>
            <Link href="/payments" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
