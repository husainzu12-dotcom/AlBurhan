# Implementation Notes - AL-BURHAN Business App

## Architecture Overview

### Frontend Architecture
- **Next.js 14 App Router**: Modern React server/client components
- **Layout Hierarchy**: Root → Dashboard Layout → Module Pages
- **Authentication Guard**: Protected routes redirect to login
- **State Management**: React hooks (useState, useEffect)
- **Data Fetching**: Supabase client-side with React hooks

### Backend Architecture
- **Supabase Database**: PostgreSQL with advanced features
- **Row-Level Security**: Enforced at database level
- **Triggers & Functions**: Automated business logic
- **Indexes**: Performance optimization for queries

## Key Implementation Details

### 1. Authentication Flow
```
Login Page → Validate Credentials → Supabase Auth → Dashboard
                                         ↓
                                    Session Stored
                                         ↓
                              Verified on Each Page Load
```

**Code Location**: `src/lib/auth.ts`

### 2. Sales & GST Calculation
```
Add Equipment to Cart
        ↓
Calculate Line Total (Qty × Unit Price)
        ↓
Sum All Items → Subtotal
        ↓
Calculate GST: Subtotal × 0.18
        ↓
Total: Subtotal + GST
        ↓
Create Sale → Auto-create Payment → Auto-reduce Stock
```

**Code Location**: `src/lib/calculations.ts`, `src/app/sales/new/page.tsx`

### 3. Stock Management
- Stock validation before cart add
- Auto-reduction on sale_items INSERT (database trigger)
- Reorder level warnings (can be extended)

**Database Trigger**: `reduce_stock_on_sale`

### 4. Customer Balance Tracking
```
Customer Created → Initialize Balance (Trigger)
        ↓
Sale Created → Add to Outstanding (Trigger)
        ↓
Payment Recorded → Reduce Outstanding, Add to Paid (Trigger)
```

**Database Table**: `customer_balance`  
**Update Triggers**: `update_balance_on_sale`, `update_customer_balance`

### 5. Invoice Generation
- **Two Types**:
  - **Invoice**: With 18% GST, for actual sales
  - **Quotation**: Without GST, for price estimation
- **Print Format**: CSS `@media print` rules
- **Data Source**: Sale + Customer information

**Code Location**: `src/app/sales/[id]/page.tsx`, `src/app/invoices/[id]/page.tsx`

## Database Relationships

```
Customers (1) ←→ (M) Customer POCs
         ↓
    Customer Balance
         ↓
      Sales (1) ←→ (M) Sale Items ← → Equipment
                                           ↓
                                    Manufacturers (1)
                                           ↓
                                  Manufacturer POCs

Sales (1) ←→ (M) Payments → Customer
Sales (1) ←→ (1) Invoices
```

## Important Code Patterns

### 1. Protected Page Pattern
```typescript
'use client'
useEffect(() => {
  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession()
    if (!data?.session) {
      router.push('/')
      return
    }
    // Load data
  }
  checkAuth()
}, [])
```

### 2. CRUD Pattern
```typescript
// Create
await supabase.from('table').insert(data)

// Read
await supabase.from('table').select('*').eq('id', id)

// Update
await supabase.from('table').update(data).eq('id', id)

// Delete (Soft - set is_active to false)
await supabase.from('table').update({ is_active: false })
```

### 3. Error Handling Pattern
```typescript
try {
  // Operation
} catch (err) {
  console.error('Error:', err)
  setError('User-friendly message')
} finally {
  setSaving(false)
}
```

## Performance Considerations

### Optimizations Made
1. **Indexes**: Pre-created on frequently queried columns
2. **Denormalization**: `customer_balance` table for dashboard
3. **Lazy Loading**: Components load data on mount
4. **Memoization**: Calculations cached in state

### Future Optimizations
1. Implement pagination for large datasets
2. Add caching layer (Redis)
3. Implement query result caching
4. Use incremental static regeneration (ISR)

## Security Measures

### Implemented
1. **RLS Policies**: All tables have "authenticated only" policies
2. **No Direct SQL**: All queries through Supabase client
3. **Environment Variables**: Secrets in .env.local
4. **Input Validation**: Required fields in forms
5. **HTTPS Recommended**: For production

### Not Implemented (For Scope)
- IP Whitelisting
- Advanced audit logging
- Rate limiting
- DDoS protection
- Encryption at rest

## Scalability Notes

### Current Limits
- Supports 1000s of records efficiently
- Real-time updates not enabled (can be added)
- File uploads not supported (can be added)

### For Growth
1. Add caching layer (Redis)
2. Implement pagination throughout
3. Add background jobs (Bull/Agenda)
4. Consider database replication
5. Implement CDN for static assets

## Testing Notes

### Manual Testing Checklist
- [ ] Login/Logout flow
- [ ] Customer CRUD operations
- [ ] Equipment add/edit/delete
- [ ] Sale creation with cart
- [ ] GST calculation accuracy
- [ ] Stock reduction verification
- [ ] Payment recording
- [ ] Invoice/Quotation generation
- [ ] Print functionality
- [ ] Mobile responsiveness
- [ ] Dashboard metrics calculation

### Unit Testing (Future)
- Calculation utilities
- Form validation
- Auth flow

### E2E Testing (Future)
- Complete sales flow
- Payment processing
- Invoice generation

## Known Limitations

1. **Single User**: Designed for single owner (Zohair)
2. **No Multi-currency**: Only INR supported
3. **No Partial Payments Split**: Payments are per sale
4. **No Inventory History**: Only current stock tracked
5. **No Audit Trail**: No change history recorded
6. **No Recurring Sales**: Each sale is independent

## Future Enhancements

### Short Term
- [ ] Search functionality across modules
- [ ] Export data to Excel
- [ ] Advanced filtering and sorting
- [ ] Bulk operations
- [ ] Customer payment history view

### Medium Term
- [ ] Multi-user support with roles
- [ ] Recurring sales/subscriptions
- [ ] Email reminders for pending payments
- [ ] SMS notifications
- [ ] Advanced reporting

### Long Term
- [ ] Mobile app (React Native)
- [ ] Multi-location support
- [ ] Vendor management
- [ ] Purchase order system
- [ ] Financial reconciliation
- [ ] Integration with accounting software

## Maintenance Guidelines

### Code Updates
1. Test locally before deploying
2. Backup database before major changes
3. Update dependencies monthly
4. Run security audits quarterly

### Data Maintenance
1. Archive old sales annually
2. Clean up test data monthly
3. Verify data integrity quarterly
4. Review customer records semi-annually

### Performance Monitoring
1. Monitor Supabase metrics weekly
2. Check query performance monthly
3. Review error logs weekly
4. Track storage usage

## Deployment Checklist

- [ ] All modules tested
- [ ] Database schema deployed
- [ ] Auth user created
- [ ] Environment variables set
- [ ] Mobile responsiveness verified
- [ ] Print functionality tested
- [ ] Calculations verified
- [ ] Backup strategy configured
- [ ] Monitoring alerts set up
- [ ] Documentation complete

## Support Contacts

- **Database Issues**: Supabase Support
- **Hosting Issues**: Vercel Support (if used)
- **Development Support**: Internal team

---

**Version**: 1.0.0  
**Date**: February 2026  
**Status**: Production Ready
