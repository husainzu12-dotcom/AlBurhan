'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Customer, Equipment } from '@/lib/types'
import { calculateGST, calculateTotal, formatCurrency } from '@/lib/calculations'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

interface CartItem {
  equipment_id: number
  equipment_name: string
  quantity: number
  unit_price: number
  line_total: number
}

export default function NewSalePage() {
  const router = useRouter()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  
  const [customerId, setCustomerId] = useState('')
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState('')
  const [selectedQuantity, setSelectedQuantity] = useState('1')

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      const { data: customersData } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('company_name', { ascending: true })

      const { data: equipmentData } = await supabase
        .from('equipment')
        .select('*')
        .eq('is_active', true)
        .order('equipment_name', { ascending: true })

      setCustomers(customersData || [])
      setEquipment(equipmentData || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedEquipment || !selectedQuantity) {
      setError('Please select equipment and quantity')
      return
    }

    const eq = equipment.find((e) => e.id === Number(selectedEquipment))
    if (!eq) return

    const quantity = Number(selectedQuantity)
    if (quantity <= 0) {
      setError('Quantity must be greater than 0')
      return
    }

    if (quantity > eq.current_stock) {
      setError(`Only ${eq.current_stock} units available in stock`)
      return
    }

    // Check if already in cart
    const existingItem = cart.find((item) => item.equipment_id === eq.id)
    if (existingItem) {
      setError('Item already in cart. Remove it first if you want to change quantity.')
      return
    }

    const lineTotal = quantity * eq.selling_price

    setCart([
      ...cart,
      {
        equipment_id: eq.id,
        equipment_name: eq.equipment_name,
        quantity,
        unit_price: eq.selling_price,
        line_total: lineTotal,
      },
    ])

    setSelectedEquipment('')
    setSelectedQuantity('1')
    setError('')
  }

  const handleRemoveFromCart = (equipmentId: number) => {
    setCart(cart.filter((item) => item.equipment_id !== equipmentId))
  }

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.line_total, 0)
    const gst = calculateGST(subtotal)
    const total = calculateTotal(subtotal)

    return { subtotal, gst, total }
  }

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerId) {
      setError('Please select a customer')
      return
    }

    if (cart.length === 0) {
      setError('Please add items to the cart')
      return
    }

    try {
      setSaving(true)
      setError('')

      const { subtotal, gst, total } = calculateTotals()
      const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)

      // Generate sale number
      const saleNumber = `SAL-${Date.now()}`

      // Create sale
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          sale_number: saleNumber,
          customer_id: Number(customerId),
          sale_date: saleDate,
          total_quantity: totalQuantity,
          subtotal,
          gst_amount: gst,
          total_amount: total,
          sale_status: 'completed',
        })
        .select()

      if (saleError) throw saleError

      const saleId = saleData[0].id

      // Create sale items
      const saleItems = cart.map((item) => ({
        sale_id: saleId,
        equipment_id: item.equipment_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)

      if (itemsError) throw itemsError

      // Auto-create payment entry
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          payment_number: `PAY-${Date.now()}`,
          sale_id: saleId,
          customer_id: Number(customerId),
          payment_date: saleDate,
          amount: total,
          payment_status: 'pending',
        })

      if (paymentError) throw paymentError

      alert('Sale created successfully!')
      router.push(`/sales/${saleId}`)
    } catch (err) {
      console.error('Error creating sale:', err)
      setError('Failed to create sale')
    } finally {
      setSaving(false)
    }
  }

  const { subtotal, gst, total } = calculateTotals()

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link href="/sales" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
        <ArrowLeft size={20} />
        Back to Sales
      </Link>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sale Header */}
          <div className="card">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Sale</h1>

            <form className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Date *
                </label>
                <input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </form>
          </div>

          {/* Add Items Form */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Items</h2>

            <form onSubmit={handleAddToCart} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment
                </label>
                <select
                  value={selectedEquipment}
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select equipment</option>
                  {equipment
                    .filter((e) => e.current_stock > 0)
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.equipment_name} - {formatCurrency(e.selling_price)} ({e.current_stock} in stock)
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(e.target.value)}
                  className="input-field"
                />
              </div>

              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                <Plus size={20} />
                Add to Cart
              </button>
            </form>
          </div>

          {/* Cart Items */}
          {cart.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cart Items</h2>

              <div className="table-container">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="table-head">Equipment</th>
                      <th className="table-head">Qty</th>
                      <th className="table-head">Unit Price</th>
                      <th className="table-head">Total</th>
                      <th className="table-head">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.equipment_id} className="hover:bg-gray-50">
                        <td className="table-cell font-medium">{item.equipment_name}</td>
                        <td className="table-cell">{item.quantity}</td>
                        <td className="table-cell">{formatCurrency(item.unit_price)}</td>
                        <td className="table-cell font-medium">{formatCurrency(item.line_total)}</td>
                        <td className="table-cell">
                          <button
                            onClick={() => handleRemoveFromCart(item.equipment_id)}
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
            </div>
          )}
        </div>

        {/* Summary */}
        <div>
          <div className="card sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            {cart.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-700">
                    <span>Items:</span>
                    <span className="font-medium">{cart.reduce((sum, i) => sum + i.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>GST (18%):</span>
                    <span className="font-medium text-blue-600">{formatCurrency(gst)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCreateSale}
                  disabled={saving || !customerId}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {saving ? 'Creating Sale...' : 'Create Sale'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
