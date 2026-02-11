# AL-BURHAN Industrial Drives - Business Management System

A production-ready internal business management web application for AL-BURHAN Industrial Drives, an Indian industrial trading company.

## 📋 Features

### Authentication
- Single-owner login (Zohair)
- Secure session management with Supabase Auth
- No public signup

### Dashboard
- Total revenue (current month)
- Total profit (current month)
- Active customers count
- Amount recovered (payments)
- Amount pending (outstanding)
- Quick action buttons

### Customers Management
- Company-based customer profiles
- Multiple Points of Contact (POCs) per customer
- GST number tracking
- Contact information & address
- Complete CRUD operations

### Equipment & Inventory
- Equipment catalog with manufacturer details
- Purchase and selling prices
- Stock management with reorder levels
- Automatic profit calculation (Selling Price - Purchase Price)
- Stock auto-reduction on sales

### Manufacturers
- Manufacturer company profiles
- Multiple POCs per manufacturer
- Origin country, phone, email, website
- Purchase bill tracking capabilities

### Sales Management
- Add-to-cart system for sales orders
- Automatic GST calculation (18%)
- Equipment selection with stock validation
- Automatic payment entry creation
- Sale numbering system
- Invoice generation capability

### Payments
- Track paid/unpaid/partial/cancelled payments
- Payment method tracking (Cash, Cheque, Bank Transfer, Credit Card)
- Reference number storage (cheque no., transaction ID)
- Auto-update of customer balance
- Payment history per customer

### Invoicing
- **Tax Invoice**: Full invoice with 18% GST
- **Quotation**: Without GST charges
- Printable format (PDF/Print-ready)
- Professional invoice header with business details
- Item-wise breakdown
- Due date tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + React 18
- **Styling**: Tailwind CSS
- **Backend & Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Language**: TypeScript

## 📦 Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── globals.css                # Global styles
│   ├── page.tsx                   # Login page
│   ├── dashboard/
│   │   ├── layout.tsx             # Dashboard layout with sidebar
│   │   └── page.tsx               # Dashboard metrics
│   ├── customers/
│   │   ├── page.tsx               # Customers list
│   │   ├── new/page.tsx           # Create customer
│   │   └── [id]/page.tsx          # Customer details & POCs
│   ├── equipment/
│   │   ├── page.tsx               # Equipment list
│   │   ├── new/page.tsx           # Add equipment
│   │   └── [id]/page.tsx          # Edit equipment
│   ├── manufacturers/
│   │   ├── page.tsx               # Manufacturers list
│   │   ├── new/page.tsx           # Add manufacturer
│   │   └── [id]/page.tsx          # Manufacturer details & POCs
│   ├── sales/
│   │   ├── page.tsx               # Sales list
│   │   ├── new/page.tsx           # Create sale (with cart)
│   │   └── [id]/page.tsx          # Sale invoice view
│   ├── payments/
│   │   ├── page.tsx               # Payments list
│   │   ├── new/page.tsx           # Record payment
│   │   └── [id]/page.tsx          # Edit payment
│   └── invoices/
│       ├── page.tsx               # Invoices & quotations list
│       ├── new/page.tsx           # Create invoice/quotation
│       └── [id]/page.tsx          # View invoice/quotation
└── lib/
    ├── supabase.ts                # Supabase client
    ├── auth.ts                    # Auth utilities
    ├── calculations.ts            # GST and profit calculations
    └── types.ts                   # TypeScript interfaces
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   cd c:\Users\Husain\Desktop\BUSINESS\ APP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Copy the Database URL and Anon Key
   - Run the SQL schema from [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql) in Supabase SQL Editor
   - Create a user in Supabase Auth (email: zohair@example.com)

4. **Configure environment variables**
   Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_NAME=AL-BURHAN Industrial Drives
   NEXT_PUBLIC_OWNER_NAME=Zohair
   NEXT_PUBLIC_GST_RATE=18
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 💼 Business Logic

### Calculations
- **Profit**: Selling Price - Purchase Price
- **GST**: 18% of subtotal (automatic)
- **Total Amount**: Subtotal + GST

### Automatic Operations
- Sale creation auto-creates payment entry
- Inventory stock auto-reduces on sale
- Payment updates customer balance
- Monthly dashboard metrics auto-calculate

### Data Integrity
- ROW-LEVEL SECURITY enabled for all tables
- Triggers for auto-updates and calculations
- Cascade deletes for dependent records
- Unique constraints on company names and GST numbers

## 📊 Database Schema

Core tables:
- `customers` - Customer company profiles
- `customer_pocs` - Customer contacts
- `manufacturers` - Manufacturer profiles
- `manufacturer_pocs` - Manufacturer contacts
- `equipment` - Inventory items
- `sales` - Sales orders
- `sale_items` - Line items in sales
- `payments` - Payment records
- `customer_balance` - Denormalized balance tracking
- `invoices` - Invoice/quotation records

## 🔐 Security

- Single-user authentication (Zohair only)
- Row-Level Security (RLS) policies
- Authenticated users only
- Environment variables for sensitive data
- No public data exposure

## 📱 UI/UX

- Mobile-first responsive design
- Clean industrial theme
- Professional minimal interface
- Tables over charts (data-focused)
- Intuitive navigation
- Dark gray industrial colors with blue accents

## 🛒 Sales Flow

1. **Create Sale**
   - Select customer
   - Set sale date
   - Add equipment to cart
   - Automatic GST calculation

2. **Stock Management**
   - Stock validates during cart add
   - Auto-reduces on sale completion
   - Reorder level warnings

3. **Payment Recording**
   - Automatic payment entry on sale
   - Manual payment updates
   - Balance tracking

4. **Invoicing**
   - Generate tax invoice with GST
   - Generate quotation without GST
   - Printable format
   - Professional header with business details

## 📧 Deployment

### For Vercel:
```bash
git push origin main
# Auto-deploys via GitHub integration
```

### For other platforms:
```bash
npm run build
npm run start
```

Environment variables must be set on the deployment platform.

## 🔧 Customization

### Add New Field to Database
1. Modify [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql)
2. Run migration in Supabase
3. Update types.ts
4. Update forms/components

### Change GST Rate
- Update `NEXT_PUBLIC_GST_RATE` in `.env.local`
- Update calculation in `src/lib/calculations.ts`

### Modify Business Rules
- Edit trigger functions in database schema
- Update calculation utilities
- Modify dashboard metrics query

## 📝 Notes

- No charts included (table-focused design)
- No unnecessary features
- Clean code with clear comments
- Extensible architecture
- Production-ready
- GST hardcoded for India (18%)

## 📄 License

Private internal business application for AL-BURHAN Industrial Drives.

## 🤝 Support

For issues or questions, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Owner**: Zohair, AL-BURHAN Industrial Drives
