'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Manufacturer } from '@/lib/types'
import { Trash2, Edit, Plus } from 'lucide-react'

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchManufacturers()
  }, [])

  const fetchManufacturers = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('manufacturers')
        .select('*')
        .eq('is_active', true)
        .order('company_name', { ascending: true })

      if (fetchError) throw fetchError
      setManufacturers(data || [])
    } catch (err) {
      console.error('Error fetching manufacturers:', err)
      setError('Failed to load manufacturers')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this manufacturer?')) return

    try {
      const { error } = await supabase
        .from('manufacturers')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      setManufacturers(manufacturers.filter((m) => m.id !== id))
    } catch (err) {
      console.error('Error deleting manufacturer:', err)
      setError('Failed to delete manufacturer')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manufacturers</h1>
          <p className="text-gray-600 mt-2">Manage equipment manufacturers</p>
        </div>
        <Link href="/manufacturers/new" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Manufacturer
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
          <p className="text-gray-600">Loading manufacturers...</p>
        </div>
      ) : manufacturers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No manufacturers found</p>
          <Link href="/manufacturers/new" className="btn-primary">
            Add First Manufacturer
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="table-head">Company Name</th>
                <th className="table-head">Country</th>
                <th className="table-head">Phone</th>
                <th className="table-head">Email</th>
                <th className="table-head">Website</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody>
              {manufacturers.map((mfr) => (
                <tr key={mfr.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{mfr.company_name}</td>
                  <td className="table-cell">{mfr.country_origin || '—'}</td>
                  <td className="table-cell">{mfr.phone || '—'}</td>
                  <td className="table-cell text-sm">{mfr.email || '—'}</td>
                  <td className="table-cell text-sm">
                    {mfr.website ? (
                      <a
                        href={mfr.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Link
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <Link
                        href={`/manufacturers/${mfr.id}`}
                        className="btn-small bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(mfr.id)}
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
