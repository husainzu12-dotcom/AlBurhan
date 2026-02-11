'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Invoice, Sale, Customer, SaleItem } from '@/lib/types'
import { formatCurrency } from '@/lib/calculations'
import { ArrowLeft, Printer } from 'lucide-react'

export default function InvoiceDetailPage() {
  const params = useParams()
  const invoiceId = Number(params.id)

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [sale, setSale] = useState<Sale | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [items, setItems] = useState<SaleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchInvoiceDetails()
  }, [invoiceId])

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true)

      // Fetch invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single()

      if (invoiceError) throw invoiceError
      setInvoice(invoiceData)

      // Fetch sale
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', invoiceData.sale_id)
        .single()

      if (saleError) throw saleError
      setSale(saleData)

      // Fetch customer
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', saleData.customer_id)
        .single()

      if (customerError) throw customerError
      setCustomer(customerData)

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', saleData.id)

      if (itemsError) throw itemsError
      setItems(itemsData || [])
    } catch (err) {
      console.error('Error fetching invoice:', err)
      setError('Failed to load invoice')
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

  if (!invoice || !sale || !customer) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Invoice not found</p>
      </div>
    )
  }

  const isQuotation = invoice.invoice_type === 'quotation'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/invoices" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <ArrowLeft size={20} />
          Back to Invoices
        </Link>
        <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
          <Printer size={20} />
          Print
        </button>
      </div>

      {/* Document */}
      <div className="card print:shadow-none print:border-0 bg-white">
        {/* Header */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {isQuotation ? 'QUOTATION' : 'INVOICE'}
            </h1>
            <p className="text-gray-600 mt-1">AL-BURHAN Industrial Drives</p>
            <p className="text-sm text-gray-500">Owner: Zohair</p>
          </div>

          <div className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <p className="font-semibold text-gray-900 mb-2">
                {isQuotation ? 'Quotation' : 'Invoice'} Details
              </p>
              <p className="text-gray-600">
                {isQuotation ? 'Quote' : 'Invoice'} #: {invoice.invoice_number}
              </p>
              <p className="text-gray-600">
                Date: {new Date(invoice.invoice_date).toLocaleDateString('en-IN')}
              </p>
              {invoice.due_date && !isQuotation && (
                <p className="text-gray-600">
                  Due: {new Date(invoice.due_date).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">Bill To</p>
              <p className="text-gray-600 font-medium">{customer.company_name}</p>
              {customer.gst_number && <p className="text-gray-600">GST: {customer.gst_number}</p>}
              {customer.city && <p className="text-gray-600">{customer.city}</p>}
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">Amount Due</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(sale.total_amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
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
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="table-cell">Equipment {item.equipment_id}</td>
                    <td className="table-cell text-center">{item.quantity}</td>
                    <td className="table-cell text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="table-cell text-right font-medium">
                      {formatCurrency(item.line_total)}
                    </td>
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
            {!isQuotation && (
              <div className="flex justify-between text-gray-700">
                <span>GST @ 18%:</span>
                <span>{formatCurrency(sale.gst_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
              <span>Total {isQuotation ? 'Quote' : 'Amount'}:</span>
              <span>{formatCurrency(sale.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-900 mb-2">Notes</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
          <p>
            {isQuotation
              ? 'This is a quotation and is valid for 30 days from the date mentioned above.'
              : 'This is a computer-generated invoice and does not require a signature.'}
          </p>
          <p className="mt-2">Thank you for your business!</p>
        </div>
      </div>
    </div>
  )
}
