# Brand Role - Features & Functionality

## Overview

The **Brand** role is designed for Consumer Packaged Goods (CPG) companies and product manufacturers who want to leverage the Consoomers platform to gain consumer insights, test products, and gather authentic feedback.

---

## 🎯 Key Capabilities

Brands have access to:
- ✅ Brand profile management
- ✅ Product creation and management
- ✅ Consumer feedback collection
- ✅ Testing campaign management
- ✅ Analytics and insights dashboard
- ✅ Sample distribution
- ✅ Special offers creation
- ✅ Subscription management

---

## 📋 Registration & Onboarding

### Registration Process

**Endpoint:** `POST /api/auth/register/brand`

**Required Information:**
1. **Personal Details**
   - First Name
   - Last Name
   - Email
   - Password

2. **Company Information**
   - Company Name
   - Brand Name
   - Website URL
   - Industry/Category

3. **Legal**
   - Terms & Conditions acceptance
   - Privacy Policy agreement

### Post-Registration Steps

1. **Email Verification**
   - Verification email sent automatically
   - Click verification link to activate account

2. **Profile Completion**
   - Upload brand logo
   - Add brand description
   - Set brand preferences
   - Configure notification settings

3. **Subscription Selection** (Optional)
   - Free tier: Basic features
   - Pro tier: Advanced analytics
   - Enterprise: Full platform access

---

## 🏢 Brand Profile Management

### Profile Information

**Accessible via:** `/brand/profile` or `/api/auth/register/brand/profile`

Brands can manage:

#### Basic Information
```typescript
{
  name: string;              // Brand display name
  companyName: string;       // Legal company name
  handle: string;            // Unique URL handle (@brandname)
  website: string;           // Brand website URL
  industry: string;          // Industry category
  description: string;       // Brand story/description
}
```

#### Visual Identity
```typescript
{
  logo: MediaId;            // Brand logo
  coverImage: MediaId;      // Profile cover image
  brandColors: string[];    // Brand color palette
}
```

#### Contact & Social
```typescript
{
  contactEmail: string;
  phone: string;
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
    linkedin: string;
  }
}
```

#### Settings
```typescript
{
  preferences: {
    targetAudience: string[];
    testingCategories: string[];
    notificationPreferences: object;
  };
  accessPassword: string;   // Optional password for brand page access
}
```

---

## 📦 Product Management

### Product Creation

**Endpoint:** `POST /api/product/create-product`

Brands can create products with:

#### Product Details
- **Name** (Required)
- **Description** (Required)
- **Category** (Beauty, Food & Beverage, Health & Wellness, etc.)
- **Price** (Optional, for display purposes)
- **Status** (Draft, Published, Testing, Archived)
- **Handle** (Auto-generated from name)

#### Product Media
- **Images** (Up to 10 images)
- **Videos** (YouTube/Vimeo embeds)
- **Documents** (Product specs, ingredients list)

#### Product Options & Variants
```typescript
// Options (e.g., Color, Size)
options: [
  {
    name: "Color",
    values: ["Red", "Blue", "Green"]
  },
  {
    name: "Size",
    values: ["Small", "Medium", "Large"]
  }
]

// Variants (combinations of options)
variants: [
  {
    name: "Red - Small",
    sku: "PROD-RED-SM",
    price: 29.99,
    inventory: 100,
    options: { Color: "Red", Size: "Small" }
  }
]
```

#### Testing Configuration
```typescript
{
  testing: {
    enabled: boolean;
    sampleQuantity: number;
    eligibilityCriteria: {
      minAge: number;
      maxAge: number;
      locations: string[];
      demographics: string[];
      interests: string[];
    };
    testingPeriod: {
      startDate: Date;
      endDate: Date;
    };
  }
}
```

### Product Operations

#### Update Product
**Endpoint:** `PATCH /api/product/create-product`

Modify product details, images, variants, and testing configuration.

#### Delete Product
**Endpoint:** `DELETE /api/product/create-product?productId=uuid`

Soft delete (archived) or hard delete (permanent removal).

#### Product Status Management
- **Draft**: Product being created, not visible to testers
- **Published**: Product visible but not available for testing
- **Testing**: Product available for tester applications
- **Archived**: Product no longer active

---

## 🧪 Testing Campaigns

### Campaign Creation

Brands can create testing campaigns for products:

1. **Define Testing Goals**
   - Product feedback
   - Feature validation
   - Packaging testing
   - Usage testing

2. **Set Eligibility Criteria**
   - Age range
   - Location (state, city, zip code)
   - Demographics (gender, income, household)
   - Interests & preferences
   - Tester tier (Explorer, Trendsetter, Insider)

3. **Sample Distribution**
   - Sample quantity available
   - Shipping requirements
   - Delivery timeline

4. **Feedback Collection**
   - Required surveys
   - Photo/video submissions
   - Rating scales
   - Open-ended questions

### Campaign Management

**Dashboard:** `/dashboard/campaigns`

Monitor:
- Application count
- Approved testers
- Samples shipped
- Feedback received
- Response rate
- Campaign completion

---

## 📊 Analytics & Insights

### Dashboard Access

**Route:** `/dashboard` or `/brand/dashboard`

### Available Metrics

#### Product Performance
```typescript
{
  views: number;              // Product page views
  applications: number;       // Tester applications
  reviews: number;           // Reviews received
  averageRating: number;     // Average star rating
  completion: number;        // Testing completion rate
}
```

#### Tester Insights
```typescript
{
  demographics: {
    age: Distribution;
    gender: Distribution;
    location: Distribution;
    income: Distribution;
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  engagement: {
    averageResponseTime: number;
    photoSubmissions: number;
    detailedReviews: number;
  }
}
```

#### Feedback Analytics
- **Rating Distribution**: Star rating breakdown
- **Key Themes**: AI-extracted themes from reviews
- **Sentiment Analysis**: Overall sentiment trends
- **Comparison**: Compare against similar products
- **Word Cloud**: Most frequently mentioned terms

### Export Options
- PDF reports
- CSV data export
- Excel spreadsheets
- Custom date ranges

---

## 💰 Sample Requests Management

### Sample Request Workflow

**Endpoint:** `GET /api/dashboard/sample-request`

1. **Tester Applies**
   - Tester requests product sample
   - Application includes profile info

2. **Brand Reviews**
   - View applicant profile
   - Check eligibility
   - Review testing history

3. **Approval/Rejection**
   - Approve: Tester receives shipping form
   - Reject: Tester notified with reason (optional)

4. **Sample Shipping**
   - Export shipping labels
   - Tracking integration (future)
   - Delivery confirmation

5. **Testing Period**
   - Automated reminders
   - Progress tracking
   - Mid-test check-ins

6. **Review Collection**
   - Tester submits feedback
   - Brand receives notification
   - Review appears on dashboard

### Sample Request Statuses
- **Pending**: Awaiting brand review
- **Approved**: Tester approved, awaiting shipment
- **Shipped**: Sample sent to tester
- **Testing**: Tester has product, testing in progress
- **Completed**: Feedback submitted
- **Rejected**: Application not approved

---

## 🎁 Special Offers

### Creating Special Offers

**Endpoint:** `POST /api/special-offers`

Brands can create special offers for testers:

```typescript
{
  title: string;
  description: string;
  offerType: "discount" | "free_product" | "exclusive_access";
  value: number;              // Discount percentage or dollar amount
  code: string;               // Promo code (optional)
  eligibility: {
    testerTiers: ["insider", "trendsetter"];
    minReviews: number;
    categories: string[];
  };
  validFrom: Date;
  validUntil: Date;
  quantityLimit: number;      // Max redemptions
}
```

### Offer Types

1. **Discount Codes**
   - Percentage or fixed amount
   - Single use or multi-use
   - Expiration dates

2. **Free Products**
   - Sample products
   - Full-size products
   - Limited quantities

3. **Exclusive Access**
   - Early product launches
   - Beta testing
   - VIP events

---

## 🔔 Notifications

Brands receive notifications for:

### Product Activity
- ✅ New tester applications
- ✅ Sample requests
- ✅ Reviews submitted
- ✅ Product milestones (100 views, 50 reviews, etc.)

### System Updates
- ✅ Platform announcements
- ✅ Feature releases
- ✅ Maintenance schedules

### Admin Actions
- ✅ Brand profile approval
- ✅ Product moderation results
- ✅ Policy updates

**Notification Settings:** `/brand/settings/notifications`

Configure:
- Email notifications
- In-app notifications
- SMS alerts (premium)
- Frequency (instant, daily digest, weekly)

---

## 🔒 Permissions & Access Control

### What Brands CAN Do

✅ **Own Brand Profile**
- View and edit brand profile
- Upload brand media
- Manage brand settings

✅ **Own Products**
- Create, edit, delete own products
- Manage product testing
- View product analytics

✅ **Tester Interaction**
- View tester applications
- Approve/reject sample requests
- View tester profiles (limited)
- Respond to reviews (future)

✅ **Analytics Access**
- View own product analytics
- Export reports
- Access insights dashboard

### What Brands CANNOT Do

❌ **Other Brands**
- View other brands' profiles (unless public)
- Access other brands' products
- View other brands' analytics

❌ **Tester Data**
- Access full tester contact info
- View tester data outside of applications
- Export tester email lists

❌ **Admin Functions**
- Approve other brands
- Moderate content
- Access system settings
- View platform-wide analytics

❌ **System Operations**
- Delete other users
- Modify user roles
- Access admin dashboard

---

## 🚀 Brand Features by Subscription Tier

### Free Tier
- ✅ 1 brand profile
- ✅ 5 products
- ✅ Basic analytics
- ✅ 10 sample requests/month
- ✅ Email support

### Pro Tier ($99/month)
- ✅ Everything in Free
- ✅ Unlimited products
- ✅ Advanced analytics
- ✅ 50 sample requests/month
- ✅ Priority support
- ✅ Custom surveys
- ✅ Export reports

### Enterprise Tier (Custom)
- ✅ Everything in Pro
- ✅ Multiple brand profiles
- ✅ Unlimited sample requests
- ✅ API access
- ✅ Dedicated account manager
- ✅ Custom integrations
- ✅ White-label options

---

## 📖 Common Workflows

### Workflow 1: Product Launch Testing

1. **Create Product**
   - Add product details
   - Upload product images
   - Set as "Draft" status

2. **Configure Testing**
   - Enable testing
   - Set eligibility criteria
   - Define sample quantity

3. **Launch Testing Campaign**
   - Change status to "Testing"
   - Campaign goes live
   - Testers can apply

4. **Review Applications**
   - Approve suitable testers
   - Reject others with feedback

5. **Ship Samples**
   - Export shipping info
   - Ship products to testers
   - Update status to "Shipped"

6. **Collect Feedback**
   - Monitor submissions
   - View real-time analytics
   - Respond to questions

7. **Analyze Results**
   - Review sentiment
   - Export reports
   - Make product improvements

8. **Product Launch**
   - Incorporate feedback
   - Update product
   - Change status to "Published"

### Workflow 2: Ongoing Feedback Collection

1. **Published Product**
   - Product already launched
   - Available to consumers

2. **Enable Reviews**
   - Allow verified purchases to review
   - Encourage tester reviews

3. **Monitor Feedback**
   - Track review submissions
   - Respond to concerns
   - Thank positive reviewers

4. **Iterate Product**
   - Use insights for improvements
   - Create new variants
   - Update product based on feedback

---

## 🛡️ Security & Privacy

### Data Protection

Brands must:
- ✅ Protect tester information
- ✅ Not misuse tester contact data
- ✅ Follow platform guidelines
- ✅ Respect intellectual property

### Brand Data Security

Platform provides:
- ✅ Secure data storage
- ✅ Encrypted communications
- ✅ Role-based access control
- ✅ Audit logs
- ✅ GDPR compliance

---

## 📞 Support & Resources

### Help Center
- **URL**: `/help/brands`
- Knowledge base
- Video tutorials
- Best practices guides

### Contact Support
- **Email**: ravinwebsurgeon@gmail.com
- **Chat**: In-app messaging
- **Response Time**: 
  - Free tier: 48 hours
  - Pro tier: 24 hours
  - Enterprise: 4 hours

### Community
- Brand community forum
- Monthly webinars
- Success stories
- Networking events

---

## 📈 Success Tips

### Maximize Tester Engagement
1. **Clear Product Descriptions**
   - Detailed information
   - High-quality images
   - Honest representation

2. **Fair Selection Process**
   - Clear criteria
   - Timely decisions
   - Respectful communication

3. **Quality Samples**
   - Full-size products when possible
   - Proper packaging
   - Include instructions

4. **Engagement**
   - Thank testers
   - Show feedback impact
   - Build relationships

### Get Better Feedback
1. **Ask Specific Questions**
   - Targeted surveys
   - Open-ended questions
   - Scale ratings

2. **Set Clear Expectations**
   - Testing timeline
   - Required feedback
   - Submission format

3. **Follow Up**
   - Mid-test check-ins
   - Remind about deadlines
   - Answer questions promptly

### Build Brand Reputation
1. **Consistent Testing**
   - Regular campaigns
   - Multiple products
   - Ongoing engagement

2. **Act on Feedback**
   - Show improvements
   - Acknowledge testers
   - Share success stories

3. **Transparency**
   - Honest communication
   - Clear processes
   - Fair treatment

---

**Need help? Contact ravinwebsurgeon@gmail.com**
