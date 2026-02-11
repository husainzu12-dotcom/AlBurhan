'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Equipment } from '@/lib/types'
import { formatCurrency } from '@/lib/calculations'
import { Trash2, Edit, Plus } from 'lucide-react'

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('equipment')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setEquipment(data || [])
    } catch (err) {
      console.error('Error fetching equipment:', err)
      setError('Failed to load equipment')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return

    try {
      const { error } = await supabase
        .from('equipment')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      setEquipment(equipment.filter((e) => e.id !== id))
    } catch (err) {
      console.error('Error deleting equipment:', err)
      setError('Failed to delete equipment')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipment & Inventory</h1>
          <p className="text-gray-600 mt-2">Manage inventory and track stock</p>
        </div>
        <Link href="/equipment/new" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Equipment
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
          <p className="text-gray-600">Loading equipment...</p>
        </div>
      ) : equipment.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No equipment found</p>
          <Link href="/equipment/new" className="btn-primary">
            Add First Equipment
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="table-head">Equipment Name</th>
                <th className="table-head">Model</th>
                <th className="table-head">Purchase Price</th>
                <th className="table-head">Selling Price</th>
                <th className="table-head">Stock</th>
                <th className="table-head">Profit/Unit</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item) => {
                const profitPerUnit = item.selling_price - item.purchase_price
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{item.equipment_name}</td>
                    <td className="table-cell text-sm">{item.model_number || '—'}</td>
                    <td className="table-cell">{formatCurrency(item.purchase_price)}</td>
                    <td className="table-cell">{formatCurrency(item.selling_price)}</td>
                    <td className="table-cell">
                      <span className={`badge ${item.current_stock > 0 ? 'badge-success' : 'badge-error'}`}>
                        {item.current_stock} units
                      </span>
                    </td>
                    <td className="table-cell font-medium text-green-600">
                      {formatCurrency(profitPerUnit)}
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <Link
                          href={`/equipment/${item.id}`}
                          className="btn-small bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
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
