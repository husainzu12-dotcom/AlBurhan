'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Customer } from '@/lib/types'
import { formatCurrency } from '@/lib/calculations'
import { Trash2, Edit, Plus } from 'lucide-react'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setCustomers(data || [])
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      const { error } = await supabase
        .from('customers')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      setCustomers(customers.filter((c) => c.id !== id))
    } catch (err) {
      console.error('Error deleting customer:', err)
      setError('Failed to delete customer')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-2">Manage customer companies and contacts</p>
        </div>
        <Link href="/customers/new" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Customer
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
          <p className="text-gray-600">Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No customers found</p>
          <Link href="/customers/new" className="btn-primary">
            Add First Customer
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="table-head">Company Name</th>
                <th className="table-head">GST Number</th>
                <th className="table-head">City</th>
                <th className="table-head">Phone</th>
                <th className="table-head">Email</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{customer.company_name}</td>
                  <td className="table-cell text-xs">{customer.gst_number || '—'}</td>
                  <td className="table-cell">{customer.city || '—'}</td>
                  <td className="table-cell">{customer.phone || '—'}</td>
                  <td className="table-cell">{customer.email || '—'}</td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="btn-small bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(customer.id)}
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
