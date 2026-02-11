'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Sale, SaleItem, Customer } from '@/lib/types'
import { formatCurrency } from '@/lib/calculations'
import { ArrowLeft, Printer } from 'lucide-react'

export default function SaleDetailPage() {
  const params = useParams()
  const saleId = Number(params.id)

  const [sale, setSale] = useState<Sale | null>(null)
  const [items, setItems] = useState<SaleItem[]>([])
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSaleDetails()
  }, [saleId])

  const fetchSaleDetails = async () => {
    try {
      setLoading(true)

      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', saleId)
        .single()

      if (saleError) throw saleError
      setSale(saleData)

      const { data: itemsData, error: itemsError } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', saleId)

      if (itemsError) throw itemsError
      setItems(itemsData || [])

      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', saleData.customer_id)
        .single()

      if (customerError) throw customerError
      setCustomer(customerData)
    } catch (err) {
      console.error('Error fetching sale:', err)
      setError('Failed to load sale details')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!sale || !customer) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Sale not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/sales" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <ArrowLeft size={20} />
          Back to Sales
        </Link>
        <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
          <Printer size={20} />
          Print
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Invoice */}
      <div className="card print:shadow-none print:border-0 bg-white">
        {/* Header */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
            <p className="text-gray-600 mt-1">AL-BURHAN Industrial Drives</p>
            <p className="text-sm text-gray-500">Owner: Zohair</p>
          </div>

          <div className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <p className="font-semibold text-gray-900 mb-2">Invoice Details</p>
              <p className="text-gray-600">Invoice #: {sale.sale_number}</p>
              <p className="text-gray-600">Date: {new Date(sale.sale_date).toLocaleDateString('en-IN')}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">Bill To</p>
              <p className="text-gray-600 font-medium">{customer.company_name}</p>
              {customer.gst_number && <p className="text-gray-600">GST: {customer.gst_number}</p>}
              {customer.city && <p className="text-gray-600">{customer.city}</p>}
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">Amount Due</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(sale.total_amount)}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <div className="table-container print:border-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="table-head">Description</th>
                  <th className="table-head text-center">Qty</th>
                  <th className="table-head text-right">Unit Price</th>
                  <th className="table-head text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="table-cell">{item.equipment_id === null ? 'Item' : `Equipment ID: ${item.equipment_id}`}</td>
                    <td className="table-cell text-center">{item.quantity}</td>
                    <td className="table-cell text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="table-cell text-right font-medium">{formatCurrency(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-xs space-y-2 border-t border-gray-200 pt-4">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>GST @ 18%:</span>
              <span>{formatCurrency(sale.gst_amount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
              <span>Total Amount:</span>
              <span>{formatCurrency(sale.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
          <p>This is a computer-generated invoice and does not require a signature.</p>
          <p className="mt-2">Thank you for your business!</p>
        </div>
      </div>

      {/* Payment Status */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Payment Status</h3>
        <p className="text-sm text-gray-600">
          Total Amount Due: <span className="font-bold">{formatCurrency(sale.total_amount)}</span>
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Status: <span className="badge badge-warning">Pending</span>
        </p>
        <Link href={`/payments/new?sale_id=${saleId}`} className="btn-primary mt-4 block text-center">
          Record Payment
        </Link>
      </div>
    </div>
  )
}
