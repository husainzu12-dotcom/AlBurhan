-- AL-BURHAN Industrial Drives - Database Schema
-- PostgreSQL (Supabase) - Complete Production Schema
-- GST Rate: 18%

-- ===================================
-- 1. AUTH & USERS (Supabase Built-in)
-- ===================================
-- Using Supabase Auth (auth.users table managed by Supabase)
-- User: Zohair (single owner, hardcoded in app)

-- ===================================
-- 2. CUSTOMERS TABLE
-- ===================================
CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL UNIQUE,
  gst_number VARCHAR(15),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  phone VARCHAR(15),
  email VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- ===================================
-- 3. CUSTOMER POINTS OF CONTACT (POCs)
-- ===================================
CREATE TABLE customer_pocs (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  poc_name VARCHAR(255) NOT NULL,
  poc_phone VARCHAR(15),
  poc_email VARCHAR(100),
  poc_designation VARCHAR(100),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===================================
-- 4. MANUFACTURERS TABLE
-- ===================================
CREATE TABLE manufacturers (
  id BIGSERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL UNIQUE,
  country_origin VARCHAR(100),
  phone VARCHAR(15),
  email VARCHAR(100),
  website VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- ===================================
-- 5. MANUFACTURER POCs
-- ===================================
CREATE TABLE manufacturer_pocs (
  id BIGSERIAL PRIMARY KEY,
  manufacturer_id BIGINT NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  poc_name VARCHAR(255) NOT NULL,
  poc_phone VARCHAR(15),
  poc_email VARCHAR(100),
  poc_designation VARCHAR(100),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===================================
-- 6. EQUIPMENT/INVENTORY TABLE
-- ===================================
CREATE TABLE equipment (
  id BIGSERIAL PRIMARY KEY,
  equipment_name VARCHAR(255) NOT NULL,
  manufacturer_id BIGINT NOT NULL REFERENCES manufacturers(id) ON DELETE RESTRICT,
  model_number VARCHAR(100),
  purchase_price DECIMAL(12, 2) NOT NULL,
  selling_price DECIMAL(12, 2) NOT NULL,
  purchase_date DATE NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  specifications TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- ===================================
-- 7. SALES TABLE
-- ===================================
CREATE TABLE sales (
  id BIGSERIAL PRIMARY KEY,
  sale_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  sale_date DATE NOT NULL,
  total_quantity INTEGER NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL, -- before GST
  gst_amount DECIMAL(12, 2) NOT NULL, -- 18%
  total_amount DECIMAL(12, 2) NOT NULL, -- after GST
  sale_status VARCHAR(50) DEFAULT 'completed', -- completed, pending, cancelled
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===================================
-- 8. SALES LINE ITEMS (Equipment in a Sale)
-- ===================================
CREATE TABLE sale_items (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL, -- selling price at time of sale
  line_total DECIMAL(12, 2) NOT NULL, -- quantity * unit_price
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===================================
-- 9. PAYMENTS TABLE
-- ===================================
CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  payment_number VARCHAR(50) NOT NULL UNIQUE,
  sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE RESTRICT,
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  payment_date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50), -- cash, cheque, bank_transfer, credit_card
  reference_number VARCHAR(100), -- cheque number, transaction ID, etc.
  payment_status VARCHAR(50) DEFAULT 'paid', -- paid, pending, partial, cancelled
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===================================
-- 10. CUSTOMER BALANCE TRACKING (Denormalized for Performance)
-- ===================================
CREATE TABLE customer_balance (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  total_outstanding DECIMAL(12, 2) NOT NULL DEFAULT 0, -- amount pending
  total_paid DECIMAL(12, 2) NOT NULL DEFAULT 0, -- amount recovered
  total_sales DECIMAL(12, 2) NOT NULL DEFAULT 0, -- total sales value (incl GST)
  last_transaction_date DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===================================
-- 11. INVOICES TABLE
-- ===================================
CREATE TABLE invoices (
  id BIGSERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  sale_id BIGINT NOT NULL UNIQUE REFERENCES sales(id) ON DELETE RESTRICT,
  invoice_type VARCHAR(20) NOT NULL, -- invoice, quotation
  invoice_date DATE NOT NULL,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===================================
-- INDEXES FOR PERFORMANCE
-- ===================================
CREATE INDEX idx_customer_pocs_customer_id ON customer_pocs(customer_id);
CREATE INDEX idx_manufacturer_pocs_manufacturer_id ON manufacturer_pocs(manufacturer_id);
CREATE INDEX idx_equipment_manufacturer_id ON equipment(manufacturer_id);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_sale_date ON sales(sale_date);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_equipment_id ON sale_items(equipment_id);
CREATE INDEX idx_payments_sale_id ON payments(sale_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_customer_balance_customer_id ON customer_balance(customer_id);
CREATE INDEX idx_invoices_sale_id ON invoices(sale_id);
CREATE INDEX idx_invoices_invoice_type ON invoices(invoice_type);

-- ===================================
-- TRIGGERS FOR AUTO-UPDATE
-- ===================================

-- Trigger: Auto-update customer_balance after payment
CREATE OR REPLACE FUNCTION update_customer_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customer_balance
  SET 
    total_paid = COALESCE(total_paid, 0) + NEW.amount,
    total_outstanding = COALESCE(total_outstanding, 0) - NEW.amount,
    updated_at = NOW()
  WHERE customer_id = NEW.customer_id
    AND NEW.payment_status = 'paid';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_balance_on_payment
AFTER INSERT ON payments
FOR EACH ROW
EXECUTE FUNCTION update_customer_balance();

-- Trigger: Auto-reduce stock after sale
CREATE OR REPLACE FUNCTION reduce_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE equipment
  SET current_stock = current_stock - NEW.quantity
  WHERE id = NEW.equipment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reduce_stock_on_sale
AFTER INSERT ON sale_items
FOR EACH ROW
EXECUTE FUNCTION reduce_stock_on_sale();

-- Trigger: Initialize customer_balance on new customer
CREATE OR REPLACE FUNCTION initialize_customer_balance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO customer_balance (customer_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_init_balance_on_customer
AFTER INSERT ON customers
FOR EACH ROW
EXECUTE FUNCTION initialize_customer_balance();

-- Trigger: Update customer balance on new sale
CREATE OR REPLACE FUNCTION update_balance_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customer_balance
  SET 
    total_outstanding = COALESCE(total_outstanding, 0) + NEW.total_amount,
    total_sales = COALESCE(total_sales, 0) + NEW.total_amount,
    last_transaction_date = NEW.sale_date,
    updated_at = NOW()
  WHERE customer_id = NEW.customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_balance_on_sale
AFTER INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION update_balance_on_sale();

-- ===================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ===================================
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_pocs ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturer_pocs ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Single user policy - only authenticated users can access
CREATE POLICY "Only authenticated users can read" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can insert" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update" ON customers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete" ON customers FOR DELETE USING (auth.role() = 'authenticated');

-- Apply same policy to all other tables
CREATE POLICY "Only authenticated users can read" ON customer_pocs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can insert" ON customer_pocs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update" ON customer_pocs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete" ON customer_pocs FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can read" ON manufacturers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can insert" ON manufacturers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update" ON manufacturers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete" ON manufacturers FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can read" ON manufacturer_pocs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can insert" ON manufacturer_pocs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update" ON manufacturer_pocs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete" ON manufacturer_pocs FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can read" ON equipment FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can insert" ON equipment FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update" ON equipment FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete" ON equipment FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can read" ON sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can insert" ON sales FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update" ON sales FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete" ON sales FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can read" ON sale_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can insert" ON sale_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update" ON sale_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete" ON sale_items FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can read" ON payments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can insert" ON payments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update" ON payments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete" ON payments FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can read" ON customer_balance FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update" ON customer_balance FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can read" ON invoices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can insert" ON invoices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update" ON invoices FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete" ON invoices FOR DELETE USING (auth.role() = 'authenticated');

-- ===================================
-- SAMPLE DATA (FOR TESTING)
-- ===================================
-- Note: Remove this before production deployment

INSERT INTO manufacturers (company_name, country_origin, phone, email) VALUES
('Siemens India', 'Germany', '+91-9876543210', 'contact@siemens.in'),
('ABB India', 'Switzerland', '+91-9876543211', 'contact@abb.in'),
('Crompton Greaves', 'India', '+91-9876543212', 'contact@crompton.in');

INSERT INTO customers (company_name, gst_number, city, state, phone, email) VALUES
('Steel Manufacturing Ltd', '18AABCS1234B1Z5', 'Mumbai', 'Maharashtra', '+91-8765432100', 'contact@steelmfg.com'),
('Automotive Parts Co', '18AABCT5678B2Z6', 'Pune', 'Maharashtra', '+91-8765432101', 'contact@autoparts.com'),
('Pharma Solutions', '18AABCU9012B3Z7', 'Hyderabad', 'Telangana', '+91-8765432102', 'contact@pharma.com');
