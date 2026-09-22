# Admin Role - Features & Functionality

## Overview

The **Admin** role has full platform access and is responsible for managing users, moderating content, overseeing operations, and maintaining platform integrity. This role is reserved for platform administrators and support staff.

---

## 🎯 Key Responsibilities

Admins are responsible for:
- ✅ User management (all roles)
- ✅ Content moderation
- ✅ Brand approval workflow
- ✅ Product oversight
- ✅ System configuration
- ✅ Analytics & reporting
- ✅ Support ticket management
- ✅ Security monitoring
- ✅ Feature flag management

---

## 🔐 Access & Permissions

### Full Platform Access

Admins have unrestricted access to:

#### User Management
- ✅ View all user accounts
- ✅ Edit user profiles
- ✅ Change user roles
- ✅ Suspend/unsuspend accounts
- ✅ Delete user accounts
- ✅ Reset passwords
- ✅ Verify emails manually
- ✅ View user activity logs

#### Content Management
- ✅ View all products
- ✅ Edit any product
- ✅ Delete products
- ✅ Moderate reviews
- ✅ Edit/remove inappropriate content
- ✅ Feature content
- ✅ Manage media library

#### Brand Management
- ✅ Approve/reject brand applications
- ✅ Edit brand profiles
- ✅ Manage brand subscriptions
- ✅ Override brand limitations
- ✅ Access brand analytics

#### System Management
- ✅ Configure platform settings
- ✅ Manage feature flags
- ✅ View system logs
- ✅ Access database directly
- ✅ Run maintenance tasks
- ✅ Configure integrations

---

## 👥 User Management

### Admin Dashboard

**Access:** `/dashboard/admin` or `/admin`

### User Operations

#### View All Users
**Endpoint:** `GET /api/admin/users`

**Filter Options:**
```typescript
{
  role: "brand" | "tester" | "admin";
  status: "active" | "suspended" | "deleted";
  registeredAfter: Date;
  registeredBefore: Date;
  tier: "explorer" | "trendsetter" | "insider";
  verificationStatus: "verified" | "unverified";
  search: string;           // Name, email, or ID
}
```

**User List View:**
```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  emailVerified: boolean;
  registeredAt: Date;
  lastLogin: Date;
  stats: {
    products?: number;      // For brands
    tests?: number;         // For testers
    reviews?: number;       // For testers
  }
}
```

#### Edit User Profile
**Endpoint:** `PATCH /api/admin/users/[userId]`

Admins can modify:
- Personal information
- Email address
- Role assignment
- Account status
- Email verification status
- Profile images
- Custom fields

#### User Actions

**Suspend User:**
```typescript
POST /api/admin/users/[userId]/suspend
{
  reason: string;
  duration: number;         // Days, or null for permanent
  notifyUser: boolean;
}
```

**Unsuspend User:**
```typescript
POST /api/admin/users/[userId]/unsuspend
{
  reason: string;
  notifyUser: boolean;
}
```

**Delete User:**
```typescript
DELETE /api/admin/users/[userId]
{
  deleteContent: boolean;   // Also delete user's content
  reason: string;
  sendNotification: boolean;
}
```

**Reset Password:**
```typescript
POST /api/admin/users/[userId]/reset-password
{
  sendEmail: boolean;
}
```

#### User Activity Logs
**Endpoint:** `GET /api/admin/users/[userId]/activity`

View:
- Login history
- IP addresses
- Actions performed
- Content created
- Reports filed

---

## 🏢 Brand Management

### Brand Approval Workflow

#### Pending Brands
**Endpoint:** `GET /api/admin/brands?status=pending`

View brands awaiting approval:
```typescript
{
  id: string;
  companyName: string;
  brandName: string;
  website: string;
  industry: string;
  submittedAt: Date;
  documents: Document[];    // Business verification docs
  notes: string;
}
```

#### Review Brand Application

**Approve Brand:**
```typescript
POST /api/admin/brands/[brandId]/approve
{
  approvedBy: adminId;
  notes: string;
  tier: "free" | "pro" | "enterprise";
  features: string[];       // Enabled features
  sendWelcomeEmail: boolean;
}
```

**Reject Brand:**
```typescript
POST /api/admin/brands/[brandId]/reject
{
  rejectedBy: adminId;
  reason: string;
  feedback: string;         // Feedback for reapplication
  sendNotification: boolean;
}
```

**Request More Information:**
```typescript
POST /api/admin/brands/[brandId]/request-info
{
  requestedFields: string[];
  message: string;
  deadline: Date;
}
```

### Brand Oversight

#### Edit Brand Profile
Admins can modify any brand profile:
- Company information
- Brand details
- Subscription tier
- Feature access
- Product limits

#### Brand Analytics
View detailed analytics for any brand:
- Product performance
- Tester engagement
- Review statistics
- Subscription usage
- Platform activity

#### Subscription Management
- ✅ Upgrade/downgrade tiers
- ✅ Apply discounts
- ✅ Extend trial periods
- ✅ Grant feature access
- ✅ Manage billing

---

## 📦 Product Management

### Product Oversight

#### View All Products
**Endpoint:** `GET /api/admin/products`

**Filter Options:**
```typescript
{
  status: "draft" | "published" | "testing" | "archived";
  brand: brandId;
  category: string;
  flagged: boolean;         // Products with reports
  createdAfter: Date;
  search: string;
}
```

#### Product Moderation

**Flag Product:**
```typescript
POST /api/admin/products/[productId]/flag
{
  reason: "inappropriate" | "misleading" | "copyright" | "other";
  notes: string;
  severity: "low" | "medium" | "high";
}
```

**Approve/Reject Product:**
```typescript
POST /api/admin/products/[productId]/moderate
{
  action: "approve" | "reject" | "request_changes";
  reason: string;
  feedback: string;
  notifyBrand: boolean;
}
```

#### Edit Any Product
Admins can:
- Edit product details
- Change product status
- Assign to different brand
- Override testing limits
- Feature products

#### Product Analytics
View platform-wide product metrics:
- Most tested products
- Highest rated products
- Products with issues
- Testing completion rates
- Category performance

---

## ⭐ Review Moderation

### Review Management

#### View All Reviews
**Endpoint:** `GET /api/admin/reviews`

**Filter Options:**
```typescript
{
  product: productId;
  tester: testerId;
  rating: number;
  flagged: boolean;
  status: "published" | "pending" | "removed";
  createdAfter: Date;
}
```

#### Moderate Reviews

**Approve Review:**
```typescript
POST /api/admin/reviews/[reviewId]/approve
{
  approvedBy: adminId;
  featured: boolean;        // Feature on homepage
}
```

**Remove Review:**
```typescript
POST /api/admin/reviews/[reviewId]/remove
{
  reason: "spam" | "inappropriate" | "fake" | "violation";
  explanation: string;
  notifyTester: boolean;
  notifyBrand: boolean;
}
```

**Edit Review:**
Admins can edit reviews to:
- Remove profanity
- Fix formatting
- Remove personal information
- Correct factual errors
- Add content warnings

#### Review Reports
Handle user-reported reviews:
```typescript
{
  reviewId: string;
  reportedBy: userId;
  reason: string;
  description: string;
  reportedAt: Date;
  status: "pending" | "resolved" | "dismissed";
}
```

---

## 🎯 Testing Campaign Management

### Campaign Oversight

#### View All Campaigns
Monitor active testing campaigns:
```typescript
{
  id: string;
  product: Product;
  brand: Brand;
  status: "active" | "paused" | "completed";
  applicants: number;
  approved: number;
  completed: number;
  completionRate: number;
  startDate: Date;
  endDate: Date;
}
```

#### Campaign Actions

**Pause/Resume Campaign:**
```typescript
POST /api/admin/campaigns/[campaignId]/pause
{
  reason: string;
  notifyBrand: boolean;
  notifyTesters: boolean;
}
```

**Extend Campaign:**
```typescript
POST /api/admin/campaigns/[campaignId]/extend
{
  newEndDate: Date;
  reason: string;
}
```

**Feature Campaign:**
Promote campaigns on homepage/newsletters

---

## 📊 Analytics & Reporting

### Platform Analytics Dashboard

**Access:** `/admin/analytics`

### Key Metrics

#### User Metrics
```typescript
{
  totalUsers: number;
  activeUsers: number;       // Active in last 30 days
  newUsersToday: number;
  newUsersThisMonth: number;
  usersByRole: {
    brands: number;
    testers: number;
    admins: number;
  };
  userGrowth: number;        // Percentage change
  churnRate: number;
}
```

#### Product Metrics
```typescript
{
  totalProducts: number;
  activeProducts: number;
  productsInTesting: number;
  newProductsThisMonth: number;
  averageReviewsPerProduct: number;
  categoryDistribution: Record<string, number>;
}
```

#### Testing Metrics
```typescript
{
  activeTests: number;
  completedTests: number;
  completionRate: number;
  averageTestDuration: number;
  sampleRequestsPending: number;
  sampleRequestsApproved: number;
}
```

#### Review Metrics
```typescript
{
  totalReviews: number;
  newReviewsToday: number;
  averageRating: number;
  reviewsAwaitingModeration: number;
  flaggedReviews: number;
  featuredReviews: number;
}
```

#### Financial Metrics (If applicable)
```typescript
{
  revenue: {
    today: number;
    thisMonth: number;
    thisYear: number;
  };
  subscriptions: {
    free: number;
    pro: number;
    enterprise: number;
  };
  churnRate: number;
  lifetimeValue: number;
}
```

### Custom Reports

Generate custom reports with:
- Date range selection
- Metric selection
- Export formats (PDF, CSV, Excel)
- Scheduled reports (daily, weekly, monthly)
- Email delivery

---

## 🚨 Content Moderation

### Moderation Queue

**Access:** `/admin/moderation`

#### Queue Types

**1. Pending Approvals**
- New brand applications
- Flagged content
- Reported reviews
- High-risk products

**2. Automatic Flags**
System automatically flags:
- Profanity detection
- Spam detection
- Duplicate content
- Suspicious activity
- Policy violations

**3. User Reports**
Handle reports from users:
```typescript
{
  id: string;
  reportType: "user" | "product" | "review" | "brand";
  targetId: string;
  reportedBy: userId;
  reason: string;
  description: string;
  severity: "low" | "medium" | "high";
  status: "pending" | "reviewed" | "resolved";
  assignedTo: adminId;
}
```

### Moderation Actions

**Approve:**
- Mark content as appropriate
- Publish content
- Clear flags

**Remove:**
- Remove content
- Notify creator
- Log action

**Edit:**
- Modify content
- Remove violations
- Add warnings

**Warn:**
- Send warning to user
- Document violation
- Track warning count

**Suspend:**
- Temporary account suspension
- Specify duration
- Send notification

**Ban:**
- Permanent account ban
- Remove all content
- Block email/IP

---

## ⚙️ System Configuration

### Platform Settings

**Access:** `/admin/settings`

#### General Settings
```typescript
{
  siteName: string;
  siteUrl: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: string;
}
```

#### Feature Flags
Enable/disable features:
```typescript
{
  productTesting: boolean;
  reviews: boolean;
  referralProgram: boolean;
  rewardSystem: boolean;
  messaging: boolean;
  notifications: boolean;
  analytics: boolean;
  socialSharing: boolean;
}
```

#### Testing Configuration
```typescript
{
  defaultTestDuration: number;
  maxActiveTests: {
    explorer: number;
    trendsetter: number;
    insider: number;
  };
  reviewRequirements: {
    minLength: number;
    requirePhotos: boolean;
    minPhotos: number;
  };
}
```

#### Email Configuration
- SMTP settings
- Email templates
- Automated emails
- Newsletter settings

#### Security Settings
- Rate limit configuration
- CSRF settings
- Session timeout
- Password requirements
- IP blocking
- Login attempt limits

---

## 🔒 Security & Monitoring

### Security Dashboard

**Access:** `/admin/security`

#### Monitor:

**1. Failed Login Attempts**
```typescript
{
  ip: string;
  username: string;
  attempts: number;
  lastAttempt: Date;
  blocked: boolean;
}
```

**2. Suspicious Activity**
- Multiple account creation from same IP
- Unusual API usage
- Bulk operations
- Credential stuffing attempts
- Scraping attempts

**3. Rate Limit Violations**
- IPs exceeding rate limits
- Endpoints being abused
- Bot traffic detection

**4. Database Queries**
- Slow queries
- Failed queries
- Query patterns

### Security Actions

**Block IP Address:**
```typescript
POST /api/admin/security/block-ip
{
  ip: string;
  reason: string;
  duration: number;         // Hours, or null for permanent
}
```

**Whitelist IP:**
```typescript
POST /api/admin/security/whitelist-ip
{
  ip: string;
  reason: string;
}
```

**Clear Rate Limits:**
```typescript
POST /api/admin/security/clear-rate-limit
{
  ip: string;
  route: string;
}
```

### Audit Logs

View all admin actions:
```typescript
{
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  changes: object;
  timestamp: Date;
  ipAddress: string;
}
```

---

## 🎁 Special Offers Management

### Create Platform-Wide Offers

**Endpoint:** `POST /api/admin/special-offers`

```typescript
{
  title: string;
  description: string;
  type: "discount" | "free_product" | "exclusive";
  value: number;
  code: string;
  eligibility: {
    roles: string[];
    tiers: string[];
    minActivity: number;
  };
  validFrom: Date;
  validUntil: Date;
  quantityLimit: number;
  perUserLimit: number;
}
```

### Manage Brand Offers
- Approve brand-created offers
- Override offer limits
- Feature offers
- End offers early

---

## 📧 Communication Management

### Email System

#### Email Templates
Manage templates for:
- Welcome emails
- Password reset
- Email verification
- Product updates
- Testing reminders
- Review requests
- Notifications

#### Bulk Email
Send platform-wide announcements:
```typescript
{
  recipients: "all" | "brands" | "testers" | "tier:trendsetter";
  subject: string;
  content: string;
  scheduleFor: Date;
  trackOpens: boolean;
  trackClicks: boolean;
}
```

### Notification System

#### Push Notifications
Send to specific users or groups:
```typescript
{
  title: string;
  message: string;
  recipients: userId[];
  link: string;
  priority: "low" | "normal" | "high";
  scheduleFor: Date;
}
```

#### In-App Announcements
Create platform announcements:
```typescript
{
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "error";
  dismissible: boolean;
  displayFrom: Date;
  displayUntil: Date;
  targetRoles: string[];
}
```

---

## 📈 Tester Tier Management

### Manual Tier Adjustments

Admins can manually adjust tester tiers:

**Endpoint:** `POST /api/admin/testers/[testerId]/tier`

```typescript
{
  newTier: "explorer" | "trendsetter" | "insider";
  reason: string;
  notifyTester: boolean;
  grantBenefits: boolean;
}
```

### Tier Criteria Configuration

Update tier requirements:
```typescript
{
  trendsetter: {
    minTests: number;
    minReviews: number;
    minMonths: number;
    minCompletionRate: number;
    minRating: number;
  };
  insider: {
    // Same structure
  }
}
```

---

## 🛠️ Maintenance & Operations

### Maintenance Mode

**Enable Maintenance:**
```typescript
POST /api/admin/maintenance/enable
{
  message: string;          // Message to display
  estimatedDuration: number;// Minutes
  allowAdminAccess: boolean;
}
```

**Disable Maintenance:**
```typescript
POST /api/admin/maintenance/disable
```

### Database Operations

**Run Migrations:**
```bash
POST /api/admin/database/migrate
```

**Backup Database:**
```bash
POST /api/admin/database/backup
```

**Clear Cache:**
```bash
POST /api/admin/cache/clear
{
  type: "all" | "user" | "product" | "review";
}
```

### System Health

Monitor:
- Server uptime
- Database performance
- API response times
- Error rates
- Storage usage
- Memory usage
- Active connections

---

## 📊 Support Ticket Management

### Ticket System

**Access:** `/admin/support`

#### View Tickets
```typescript
{
  id: string;
  userId: string;
  subject: string;
  category: "technical" | "account" | "billing" | "other";
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo: adminId;
  createdAt: Date;
  lastUpdated: Date;
}
```

#### Ticket Actions

**Assign Ticket:**
```typescript
POST /api/admin/support/[ticketId]/assign
{
  assignTo: adminId;
}
```

**Update Status:**
```typescript
POST /api/admin/support/[ticketId]/status
{
  status: string;
  resolution: string;
  notifyUser: boolean;
}
```

**Add Note:**
```typescript
POST /api/admin/support/[ticketId]/note
{
  content: string;
  internal: boolean;        // Not visible to user
}
```

---

## 🎯 Best Practices for Admins

### User Management
1. ✅ Review user reports promptly
2. ✅ Document all moderation actions
3. ✅ Communicate clearly with users
4. ✅ Be consistent with policies
5. ✅ Escalate complex issues

### Content Moderation
1. ✅ Follow moderation guidelines
2. ✅ Check context before removal
3. ✅ Provide clear feedback
4. ✅ Use warnings before bans
5. ✅ Review appeals fairly

### Brand Management
1. ✅ Verify brands thoroughly
2. ✅ Respond to applications quickly
3. ✅ Provide helpful feedback
4. ✅ Monitor brand behavior
5. ✅ Support brand success

### System Maintenance
1. ✅ Schedule maintenance during low-traffic hours
2. ✅ Communicate maintenance windows
3. ✅ Test changes in staging first
4. ✅ Monitor system health regularly
5. ✅ Keep backups current

---

## 🔐 Admin Security

### Admin Account Security

Admins must:
- ✅ Use strong, unique passwords
- ✅ Enable two-factor authentication
- ✅ Never share credentials
- ✅ Log out when finished
- ✅ Use secure networks
- ✅ Report suspicious activity

### Access Logging

All admin actions are logged:
- Login/logout times
- IP addresses
- Actions performed
- Data accessed
- Changes made

### Permission Levels

**Super Admin:**
- Full access to all features
- Can manage other admins
- System configuration access

**Content Moderator:**
- Content moderation only
- Cannot access user management
- Cannot change system settings

**Support Admin:**
- Support tickets only
- Limited user management
- View-only analytics

---

## 📞 Admin Support

### Internal Resources
- Admin documentation
- Policy handbook
- Training materials
- Escalation procedures

### Support Channels
- **Emergency**: emergency@consoomers.com
- **Technical Issues**: tech-admin@consoomers.com
- **Policy Questions**: policy@consoomers.com

---

## 🚨 Emergency Procedures

### Platform Issues
1. Enable maintenance mode
2. Notify users
3. Investigate issue
4. Implement fix
5. Test thoroughly
6. Disable maintenance mode
7. Post-mortem report

### Security Breaches
1. Immediately block affected accounts/IPs
2. Notify security team
3. Force password resets if needed
4. Investigate breach
5. Patch vulnerabilities
6. Notify affected users
7. Document incident

### Data Issues
1. Stop all write operations
2. Restore from backup if needed
3. Verify data integrity
4. Resume operations
5. Investigate cause
6. Implement preventive measures

---

**Admin Dashboard:** `/admin`  
**Emergency Contact:** ravinwebsurgeon@gmail.com
**Admin Documentation:** `/admin/docs`
