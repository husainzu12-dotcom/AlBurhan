# Quick Start Guide - AL-BURHAN Business App

## 🚀 Get Running in 5 Minutes

### Step 1: Environment Setup (2 min)
```bash
# Navigate to project
cd c:\Users\Husain\Desktop\BUSINESS\ APP

# Install dependencies
npm install

# Copy and edit .env.local with your Supabase credentials
# See DEPLOYMENT_GUIDE.md for exact values
```

### Step 2: Database Setup (1 min)
1. Create Supabase project (supabase.com)
2. Copy DATABASE_SCHEMA.sql contents
3. Paste in Supabase SQL Editor and run
4. Create user in Auth (email: zohair@example.com)

### Step 3: Start Application (2 min)
```bash
npm run dev
```

Visit http://localhost:3000 and login!

---

## 💼 Using the Application

### First Login
1. Email: `zohair@example.com`
2. Password: (password you set in Supabase)
3. You're now in Dashboard

### Create Your First Sale (5 minutes)

#### Step 1: Add Manufacturer
1. Click "Manufacturers" → "Add Manufacturer"
2. Enter: "Siemens" / "Germany"
3. Save

#### Step 2: Add Equipment
1. Click "Equipment" → "Add Equipment"
2. Enter:
   - Name: "Industrial Motor 5HP"
   - Manufacturer: "Siemens"
   - Purchase Price: 50,000
   - Selling Price: 65,000
   - Stock: 10
3. Save

#### Step 3: Add Customer
1. Click "Customers" → "Add Customer"
2. Enter: Company name "ABC Manufacturing"
3. Save and add POC (optional)

#### Step 4: Create Sale
1. Click "Sales" → "New Sale"
2. Select customer: "ABC Manufacturing"
3. Select date
4. Add equipment to cart:
   - Select "Industrial Motor 5HP"
   - Qty: 2
   - Click "Add to Cart"
5. Observe automatic GST calculation
6. Click "Create Sale"

#### Step 5: Record Payment
1. Click "Payments" → "Record Payment"
2. Select the sale you just created
3. Enter payment amount and method
4. Save

#### Step 6: Generate Invoice
1. Click "Invoices" → "Create Invoice"
2. Select your sale
3. Choose "Invoice" type (with GST)
4. Click "Create Invoice"
5. View and click "Print" for PDF

---

## 🎯 Key Features Overview

| Feature | Location | Time |
|---------|----------|------|
| View Dashboard | Home | 10 sec |
| Add Customer | Customers → New | 1 min |
| Add Equipment | Equipment → New | 2 min |
| Create Sale | Sales → New | 3 min |
| Record Payment | Payments → New | 1 min |
| Generate Invoice | Invoices → New | 1 min |
| View Customer Details | Customers → [Select] | 30 sec |

---

## 📊 Dashboard Metrics

Dashboard automatically shows (current month):
- ✅ Total Revenue
- ✅ Total Profit
- ✅ Active Customers
- ✅ Amount Recovered (paid payments)
- ✅ Amount Pending (unpaid)

**Note**: Metrics calculate automatically from sales and payments

---

## 🧮 Automatic Calculations

The app automatically:
- ✅ Calculates GST (18%) on all sales
- ✅ Calculates profit per equipment
- ✅ Reduces stock when sale created
- ✅ Updates customer balance on payment
- ✅ Generates invoice numbers
- ✅ Creates payment records on sale

---

## 📱 Mobile Access

The app is fully responsive:
- ✅ Works on iPhone
- ✅ Works on Android
- ✅ Works on Tablet
- ✅ Sidebar collapses on mobile

---

## 🖨️ Print Features

All invoices are printable:
1. Open invoice
2. Click "Print" button
3. Choose "Save as PDF" or print directly
4. Professional format with all details

---

## ⚠️ Important Notes

- **Soft Delete**: Deleting records marks them inactive (safe!)
- **Stock**: Automatically reduces when sale created
- **Payments**: Create payment entry when sale created
- **Currency**: All amounts in Indian Rupees (₹)
- **GST**: Fixed at 18% (Indian GST standard)

---

## 🛠️ Common Tasks

### Change Customer Details
1. Click "Customers"
2. Select customer (blue "Edit" button)
3. Modify any field
4. Click "Save"

### Update Equipment Price
1. Click "Equipment"
2. Select equipment (blue "Edit" button)
3. Update "Selling Price" or "Purchase Price"
4. Click "Save"

### View Customer Sales
1. Click "Customers"
2. Select customer (blue "Edit" button)
3. View company details and POCs
4. Go back and check "Sales" for that customer

### Track Outstanding Payments
1. Click "Dashboard"
2. See "Amount Pending" metric
3. Click "Payments" to see payment status
4. Can mark as "Partial" if needed

---

## 🔍 Troubleshooting

### Can't Login
- [ ] Check email is exactly right
- [ ] Check password is exactly right
- [ ] Try resetting password in Supabase

### Stock Not Reducing
- [ ] Refresh page after creating sale
- [ ] Check Equipment page - stock should be less

### Calculations Wrong
- [ ] GST should be 18% of subtotal
- [ ] Profit = Selling Price - Purchase Price
- [ ] Total = Subtotal + GST

### Can't Add to Cart
- [ ] Equipment must have stock > 0
- [ ] Quantity must be ≤ available stock
- [ ] Customer must be selected first

---

## 📞 Support

**Issue**: Database connection error  
**Solution**: Check NEXT_PUBLIC_SUPABASE_URL in .env.local

**Issue**: Auth not working  
**Solution**: Verify user exists in Supabase Auth

**Issue**: No data showing up  
**Solution**: Add sample data (see "Create Your First Sale")

---

## ⏱️ Typical Usage Time

- **Daily**: 30 min (enter sales, payments)
- **Weekly**: 30 min (check outstanding)
- **Monthly**: 1 hour (review dashboard, generate reports)

---

## 🚀 Next Steps

1. **Immediate**: Add your actual manufacturers
2. **Today**: Add your equipment inventory
3. **This Week**: Add your customer list
4. **Ongoing**: Record daily sales and payments

---

**Ready to go!** 🎉

Questions? Check [README.md](README.md) or [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
