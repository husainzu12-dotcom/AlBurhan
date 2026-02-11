'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Manufacturer, ManufacturerPOC } from '@/lib/types'
import { ArrowLeft, Trash2, Plus } from 'lucide-react'

export default function ManufacturerDetailPage() {
  const params = useParams()
  const manufacturerId = Number(params.id)
  const router = useRouter()

  const [manufacturer, setManufacturer] = useState<Manufacturer | null>(null)
  const [pocs, setPocs] = useState<ManufacturerPOC[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [companyName, setCompanyName] = useState('')
  const [countryOrigin, setCountryOrigin] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [notes, setNotes] = useState('')

  const [pocName, setPocName] = useState('')
  const [pocPhone, setPocPhone] = useState('')
  const [pocEmail, setPocEmail] = useState('')
  const [pocDesignation, setPocDesignation] = useState('')
  const [pocIsPrimary, setPocIsPrimary] = useState(false)

  const [saving, setSaving] = useState(false)
  const [showPocForm, setShowPocForm] = useState(false)

  useEffect(() => {
    fetchManufacturer()
  }, [manufacturerId])

  const fetchManufacturer = async () => {
    try {
      setLoading(true)
      setError('')

      const { data: mfData, error: mfError } = await supabase
        .from('manufacturers')
        .select('*')
        .eq('id', manufacturerId)
        .single()

      if (mfError) throw mfError

      setManufacturer(mfData)
      setCompanyName(mfData.company_name)
      setCountryOrigin(mfData.country_origin || '')
      setPhone(mfData.phone || '')
      setEmail(mfData.email || '')
      setWebsite(mfData.website || '')
      setNotes(mfData.notes || '')

      const { data: pocsData, error: pocsError } = await supabase
        .from('manufacturer_pocs')
        .select('*')
        .eq('manufacturer_id', manufacturerId)
        .order('is_primary', { ascending: false })

      if (pocsError) throw pocsError
      setPocs(pocsData || [])
    } catch (err) {
      console.error('Error fetching manufacturer:', err)
      setError('Failed to load manufacturer details')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveManufacturer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName.trim()) {
      setError('Company name is required')
      return
    }

    try {
      setSaving(true)
      setError('')

      const { error } = await supabase
        .from('manufacturers')
        .update({
          company_name: companyName,
          country_origin: countryOrigin,
          phone,
          email,
          website,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', manufacturerId)

      if (error) throw error
      alert('Manufacturer updated successfully')
      router.push('/manufacturers')
    } catch (err) {
      console.error('Error saving:', err)
      setError('Failed to save manufacturer')
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

      const { error } = await supabase.from('manufacturer_pocs').insert({
        manufacturer_id: manufacturerId,
        poc_name: pocName,
        poc_phone: pocPhone,
        poc_email: pocEmail,
        poc_designation: pocDesignation,
        is_primary: pocIsPrimary,
      })

      if (error) throw error

      setPocName('')
      setPocPhone('')
      setPocEmail('')
      setPocDesignation('')
      setPocIsPrimary(false)
      setShowPocForm(false)

      fetchManufacturer()
    } catch (err) {
      console.error('Error adding POC:', err)
      setError('Failed to add POC')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePOC = async (pocId: number) => {
    if (!confirm('Are you sure?')) return

    try {
      const { error } = await supabase
        .from('manufacturer_pocs')
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
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link href="/manufacturers" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
        <ArrowLeft size={20} />
        Back to Manufacturers
      </Link>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Manufacturer Details</h2>

        <form onSubmit={handleSaveManufacturer} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={countryOrigin}
                onChange={(e) => setCountryOrigin(e.target.value)}
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
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
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
              className="input-field"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>

      {/* POCs */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Points of Contact</h2>
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
                Mark as primary
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
                        '—'
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
