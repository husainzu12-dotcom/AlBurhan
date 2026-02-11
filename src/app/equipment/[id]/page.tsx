'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Equipment, Manufacturer } from '@/lib/types'
import { formatCurrency } from '@/lib/calculations'
import { ArrowLeft } from 'lucide-react'

export default function EquipmentDetailPage() {
  const params = useParams()
  const equipmentId = Number(params.id)
  const router = useRouter()

  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [manufacturerId, setManufacturerId] = useState('')
  const [equipmentName, setEquipmentName] = useState('')
  const [modelNumber, setModelNumber] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [currentStock, setCurrentStock] = useState('')
  const [reorderLevel, setReorderLevel] = useState('')
  const [specifications, setSpecifications] = useState('')
  const [notes, setNotes] = useState('')

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEquipmentAndManufacturers()
  }, [equipmentId])

  const fetchEquipmentAndManufacturers = async () => {
    try {
      setLoading(true)

      const { data: eqData, error: eqError } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', equipmentId)
        .single()

      if (eqError) throw eqError

      setEquipment(eqData)
      setEquipmentName(eqData.equipment_name)
      setManufacturerId(String(eqData.manufacturer_id))
      setModelNumber(eqData.model_number || '')
      setPurchasePrice(String(eqData.purchase_price))
      setSellingPrice(String(eqData.selling_price))
      setPurchaseDate(eqData.purchase_date)
      setCurrentStock(String(eqData.current_stock))
      setReorderLevel(String(eqData.reorder_level))
      setSpecifications(eqData.specifications || '')
      setNotes(eqData.notes || '')

      const { data: mfData } = await supabase
        .from('manufacturers')
        .select('*')
        .eq('is_active', true)
        .order('company_name', { ascending: true })

      setManufacturers(mfData || [])
    } catch (err) {
      console.error('Error fetching:', err)
      setError('Failed to load equipment details')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!equipmentName.trim()) {
      setError('Equipment name is required')
      return
    }

    try {
      setSaving(true)
      setError('')

      const { error } = await supabase
        .from('equipment')
        .update({
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', equipmentId)

      if (error) throw error
      alert('Equipment updated successfully')
      router.push('/equipment')
    } catch (err) {
      console.error('Error saving:', err)
      setError('Failed to save equipment')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading equipment details...</p>
      </div>
    )
  }

  const profitPerUnit = Number(sellingPrice) - Number(purchasePrice)

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <Link href="/equipment" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
        <ArrowLeft size={20} />
        Back to Equipment
      </Link>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Details Card */}
      <div className="card">
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
          <div>
            <p className="text-xs font-medium text-gray-600 uppercase">Profit per Unit</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatCurrency(profitPerUnit)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 uppercase">Current Stock</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{currentStock} units</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Equipment</h1>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment Name
            </label>
            <input
              type="text"
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manufacturer
            </label>
            <select
              value={manufacturerId}
              onChange={(e) => setManufacturerId(e.target.value)}
              className="input-field"
            >
              <option value="">Select a manufacturer</option>
              {manufacturers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.company_name}
                </option>
              ))}
            </select>
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
                Purchase Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="input-field"
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

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
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
