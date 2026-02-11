'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Customer, CustomerPOC } from '@/lib/types'
import { ArrowLeft, Trash2, Plus } from 'lucide-react'

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = Number(params.id)
  const router = useRouter()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [pocs, setPocs] = useState<CustomerPOC[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [companyName, setCompanyName] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')

  const [pocName, setPocName] = useState('')
  const [pocPhone, setPocPhone] = useState('')
  const [pocEmail, setPocEmail] = useState('')
  const [pocDesignation, setPocDesignation] = useState('')
  const [pocIsPrimary, setPocIsPrimary] = useState(false)

  const [saving, setSaving] = useState(false)
  const [showPocForm, setShowPocForm] = useState(false)

  useEffect(() => {
    fetchCustomer()
  }, [customerId])

  const fetchCustomer = async () => {
    try {
      setLoading(true)
      setError('')

      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single()

      if (customerError) throw customerError

      setCustomer(customerData)
      setCompanyName(customerData.company_name)
      setGstNumber(customerData.gst_number || '')
      setAddress(customerData.address || '')
      setCity(customerData.city || '')
      setState(customerData.state || '')
      setPincode(customerData.pincode || '')
      setPhone(customerData.phone || '')
      setEmail(customerData.email || '')
      setNotes(customerData.notes || '')

      // Fetch POCs
      const { data: pocsData, error: pocsError } = await supabase
        .from('customer_pocs')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_primary', { ascending: false })

      if (pocsError) throw pocsError
      setPocs(pocsData || [])
    } catch (err) {
      console.error('Error fetching customer:', err)
      setError('Failed to load customer details')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName.trim()) {
      setError('Company name is required')
      return
    }

    try {
      setSaving(true)
      setError('')

      const { error } = await supabase
        .from('customers')
        .update({
          company_name: companyName,
          gst_number: gstNumber,
          address,
          city,
          state,
          pincode,
          phone,
          email,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customerId)

      if (error) throw error
      alert('Customer updated successfully')
      router.push('/customers')
    } catch (err) {
      console.error('Error saving customer:', err)
      setError('Failed to save customer')
    } finally {
      setSaving(false)
    }
  }

  const handleAddPOC = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pocName.trim()) {
      setError('POC name is required')
      return
    }

    try {
      setSaving(true)

      const { error } = await supabase.from('customer_pocs').insert({
        customer_id: customerId,
        poc_name: pocName,
        poc_phone: pocPhone,
        poc_email: pocEmail,
        poc_designation: pocDesignation,
        is_primary: pocIsPrimary,
      })

      if (error) throw error

      // Reset form
      setPocName('')
      setPocPhone('')
      setPocEmail('')
      setPocDesignation('')
      setPocIsPrimary(false)
      setShowPocForm(false)

      // Refresh POCs
      fetchCustomer()
    } catch (err) {
      console.error('Error adding POC:', err)
      setError('Failed to add POC')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePOC = async (pocId: number) => {
    if (!confirm('Are you sure you want to delete this POC?')) return

    try {
      const { error } = await supabase
        .from('customer_pocs')
        .delete()
        .eq('id', pocId)

      if (error) throw error
      setPocs(pocs.filter((p) => p.id !== pocId))
    } catch (err) {
      console.error('Error deleting POC:', err)
      setError('Failed to delete POC')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading customer details...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Link href="/customers" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
        <ArrowLeft size={20} />
        Back to Customers
      </Link>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Customer Form */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Details</h2>

        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Number
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="18AABCT5678B2Z6"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              rows={2}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Customer'}
          </button>
        </form>
      </div>

      {/* POCs Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Points of Contact (POCs)</h2>
          <button
            onClick={() => setShowPocForm(!showPocForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add POC
          </button>
        </div>

        {showPocForm && (
          <form onSubmit={handleAddPOC} className="mb-6 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={pocName}
                  onChange={(e) => setPocName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={pocDesignation}
                  onChange={(e) => setPocDesignation(e.target.value)}
                  placeholder="e.g., Procurement Manager"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={pocPhone}
                  onChange={(e) => setPocPhone(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={pocEmail}
                  onChange={(e) => setPocEmail(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={pocIsPrimary}
                onChange={(e) => setPocIsPrimary(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="isPrimary" className="text-sm font-medium text-gray-700">
                Mark as primary contact
              </label>
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Adding...' : 'Add POC'}
              </button>
              <button
                type="button"
                onClick={() => setShowPocForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {pocs.length === 0 ? (
          <p className="text-gray-600">No POCs added yet</p>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="table-head">Name</th>
                  <th className="table-head">Designation</th>
                  <th className="table-head">Phone</th>
                  <th className="table-head">Email</th>
                  <th className="table-head">Primary</th>
                  <th className="table-head">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pocs.map((poc) => (
                  <tr key={poc.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{poc.poc_name}</td>
                    <td className="table-cell">{poc.poc_designation || '—'}</td>
                    <td className="table-cell">{poc.poc_phone || '—'}</td>
                    <td className="table-cell text-sm">{poc.poc_email || '—'}</td>
                    <td className="table-cell">
                      {poc.is_primary ? (
                        <span className="badge badge-success">Yes</span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => handleDeletePOC(poc.id)}
                        className="btn-small bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
