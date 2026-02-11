/**
 * Type definitions for the application
 */

// Customers
export interface Customer {
  id: number
  company_name: string
  gst_number?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  phone?: string
  email?: string
  notes?: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface CustomerPOC {
  id: number
  customer_id: number
  poc_name: string
  poc_phone?: string
  poc_email?: string
  poc_designation?: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

// Manufacturers
export interface Manufacturer {
  id: number
  company_name: string
  country_origin?: string
  phone?: string
  email?: string
  website?: string
  notes?: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface ManufacturerPOC {
  id: number
  manufacturer_id: number
  poc_name: string
  poc_phone?: string
  poc_email?: string
  poc_designation?: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

// Equipment/Inventory
export interface Equipment {
  id: number
  equipment_name: string
  manufacturer_id: number
  model_number?: string
  purchase_price: number
  selling_price: number
  purchase_date: string
  current_stock: number
  reorder_level?: number
  specifications?: string
  notes?: string
  created_at: string
  updated_at: string
  is_active: boolean
}

// Sales
export interface Sale {
  id: number
  sale_number: string
  customer_id: number
  sale_date: string
  total_quantity: number
  subtotal: number
  gst_amount: number
  total_amount: number
  sale_status: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface SaleItem {
  id: number
  sale_id: number
  equipment_id: number
  quantity: number
  unit_price: number
  line_total: number
  created_at: string
}

// Payments
export interface Payment {
  id: number
  payment_number: string
  sale_id: number
  customer_id: number
  payment_date: string
  amount: number
  payment_method?: string
  reference_number?: string
  payment_status: string
  notes?: string
  created_at: string
  updated_at: string
}

// Customer Balance
export interface CustomerBalance {
  id: number
  customer_id: number
  total_outstanding: number
  total_paid: number
  total_sales: number
  last_transaction_date?: string
  updated_at: string
}

// Invoices
export interface Invoice {
  id: number
  invoice_number: string
  sale_id: number
  invoice_type: 'invoice' | 'quotation'
  invoice_date: string
  due_date?: string
  notes?: string
  created_at: string
  updated_at: string
}
