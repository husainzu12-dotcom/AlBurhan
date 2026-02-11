'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Manufacturer } from '@/lib/types'
import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'

export default function NewEquipmentPage() {
  const router = useRouter()

  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [manufacturerId, setManufacturerId] = useState('')

  const [equipmentName, setEquipmentName] = useState('')
  const [modelNumber, setModelNumber] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [currentStock, setCurrentStock] = useState('0')
  const [reorderLevel, setReorderLevel] = useState('10')
  const [specifications, setSpecifications] = useState('')
  const [notes, setNotes] = useState('')

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchManufacturers()
  }, [])

  const fetchManufacturers = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('manufacturers')
        .select('*')
        .eq('is_active', true)
        .order('company_name', { ascending: true })

      if (fetchError) throw fetchError
      setManufacturers(data || [])
    } catch (err) {
      console.error('Error fetching manufacturers:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!equipmentName.trim()) {
      setError('Equipment name is required')
      return
    }
    if (!manufacturerId) {
      setError('Manufacturer is required')
      return
    }
    if (!purchasePrice || !sellingPrice || !purchaseDate) {
      setError('Purchase price, selling price, and purchase date are required')
      return
    }

    try {
      setSaving(true)
      setError('')

      const { error: insertError } = await supabase
        .from('equipment')
        .insert({
          equipment_name: equipmentName,
          manufacturer_id: Number(manufacturerId),
          model_number: modelNumber || null,
          purchase_price: Number(purchasePrice),
          selling_price: Number(sellingPrice),
          purchase_date: purchaseDate,
          current_stock: Number(currentStock),
          reorder_level: Number(reorderLevel),
          specifications: specifications || null,
          notes: notes || null,
          is_active: true,
        })

      if (insertError) throw insertError

      alert('Equipment added successfully')
      router.push('/equipment')
    } catch (err) {
      console.error('Error creating equipment:', err)
      setError('Failed to create equipment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <Link href="/equipment" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
        <ArrowLeft size={20} />
        Back to Equipment
      </Link>

      {/* Form */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Equipment</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment Name *
            </label>
            <input
              type="text"
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
              placeholder="e.g., Industrial Motor"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manufacturer *
            </label>
            <select
              value={manufacturerId}
              onChange={(e) => setManufacturerId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select a manufacturer</option>
              {manufacturers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.company_name}
                </option>
              ))}
            </select>
            {manufacturers.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                No manufacturers found.{' '}
                <Link href="/manufacturers/new" className="text-blue-600 hover:underline">
                  Add one first
                </Link>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model Number
              </label>
              <input
                type="text"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date *
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Stock
              </label>
              <input
                type="number"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Level
              </label>
              <input
                type="number"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specifications
            </label>
            <textarea
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              placeholder="Technical specifications"
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
              placeholder="Additional information"
              className="input-field"
              rows={2}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Equipment'}
            </button>
            <Link href="/equipment" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
