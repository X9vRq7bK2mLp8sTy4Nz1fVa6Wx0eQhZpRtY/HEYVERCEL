# Design Guidelines: Lua Script Protection Platform

## Design Approach
**Hybrid System**: Linear's minimal data-focused aesthetic + Material Design component patterns + Developer tool conventions (GitHub, Vercel)

**Justification**: This is a security-focused developer tool requiring information density, data visualization, and professional credibility. The design must prioritize clarity, efficiency, and trustworthiness over visual flair.

---

## Typography System

**Font Stack**:
- Primary: Inter (Google Fonts) - for UI, body text, data
- Monospace: JetBrains Mono (Google Fonts) - for code snippets, script names, IDs

**Hierarchy**:
- Page Titles: 2.5rem (40px), font-weight 700, letter-spacing -0.02em
- Section Headers: 1.75rem (28px), font-weight 600
- Card Titles: 1.125rem (18px), font-weight 600
- Body Text: 0.875rem (14px), font-weight 400, line-height 1.5
- Captions/Meta: 0.75rem (12px), font-weight 500, uppercase tracking-wide
- Code/Data: 0.8125rem (13px), JetBrains Mono, font-weight 400

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-4 to p-6
- Section spacing: py-12 to py-20
- Card gaps: gap-4 to gap-6
- Element margins: m-2, m-4, m-6

**Grid Structure**:
- Dashboard layout: Sidebar (16rem fixed) + Main content (flex-1)
- Content max-width: max-w-7xl for data tables, max-w-4xl for forms
- Card grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for stats

---

## Component Library

### Landing Page Structure
**Hero Section** (h-screen, centered):
- Large headline: "Enterprise-Grade Lua Script Protection"
- Subheadline: Feature bullets (Real-time obfuscation, Executor-only access, Advanced analytics)
- Primary CTA: "Get Started" + Secondary: "View Documentation"
- Trust indicators: "Processing 10K+ scripts daily" with icon badges
- Background: Subtle code pattern overlay or abstract geometric shapes

**Features Grid** (3-column on desktop):
- Icon + Title + Description format
- Features: Real-time Obfuscation, Executor Verification, Analytics Dashboard, Watermarking, Admin Controls, API Access
- Each card: p-6, rounded-lg, with icon (Heroicons)

**How It Works** (3-step timeline):
- Horizontal step indicators (numbered)
- Step 1: Upload Script → Step 2: Automatic Protection → Step 3: Secure Distribution
- Visual connectors between steps

**Security Features** (2-column layout):
- Left: Text content explaining security measures
- Right: Code snippet mockup showing protected script example

**Pricing/Plans** (if applicable, 3-card layout):
- Plan cards with feature lists, prominent CTA buttons

**Footer**:
- 4-column layout: Product, Company, Resources, Legal
- Social links, copyright notice
- Newsletter signup form (horizontal layout)

### Authentication Pages
**Login/Register** (centered, max-w-md):
- Logo at top
- Card container with form fields
- Email/password inputs with labels above
- "Remember me" checkbox + "Forgot password?" link
- Full-width submit button
- Divider with "or" text
- Link to alternate action ("Don't have an account? Sign up")

### Dashboard Layout (User & Admin)
**Sidebar Navigation** (w-64, fixed left):
- Logo/branding at top
- Navigation items with icons (Heroicons):
  - Dashboard Overview
  - Scripts (with count badge)
  - Analytics
  - Settings
  - (Admin only: User Management, System Logs)
- User profile dropdown at bottom

**Top Bar** (h-16, fixed top):
- Breadcrumb navigation
- Search bar (flex-1, max-w-xl)
- Notifications bell icon (with badge)
- User avatar dropdown

**Main Content Area**:
- Page header: Title + action buttons (right-aligned)
- Stats cards row (4 columns on desktop):
  - Total Scripts, Active Links, Executions (24h), Protected Size
  - Each card: Icon, metric (large bold number), label, trend indicator
- Data table or content sections below

### Script Management Interface
**Upload Section**:
- Dropzone area (border-2 border-dashed, h-48):
  - Upload icon (centered)
  - "Drag and drop or click to upload"
  - File size limit indicator
- OR code editor (Monaco Editor integration placeholder)
- Settings panel (right side, w-80):
  - Obfuscation strength slider
  - Watermark options
  - Executor whitelist checkbox
- "Protect Script" button (prominent, full-width in settings panel)

**Scripts List Table**:
- Columns: Script Name (with icon), Size, Created Date, Executions, Raw Link (with copy button), Actions (dropdown)
- Row actions: View Analytics, Download, Regenerate Link, Delete
- Pagination at bottom
- Search/filter controls above table

### Analytics Dashboard
**Charts Section** (grid-cols-1 lg:grid-cols-2):
- Execution timeline (line chart placeholder)
- Geographic distribution (map placeholder)
- Executor type breakdown (pie chart placeholder)
- Top scripts table

**Execution Log Table**:
- Columns: Timestamp, Script, Executor Type, HWID (truncated), IP, Status
- Real-time update indicator
- Export button (top-right)

### Admin Dashboard Additions
**User Management Table**:
- Columns: Username, Email, Scripts Count, Join Date, Status, Actions
- Filters: Status (Active/Suspended), Plan Type
- Bulk actions toolbar

**User Detail Modal/Page**:
- User info card (left side)
- User's scripts list (center)
- Activity timeline (right side)

---

## Interaction Patterns

**Buttons**:
- Primary: Rounded-md, px-6 py-2.5, font-semibold
- Secondary: Outlined variant
- Icon buttons: p-2, rounded-md
- No custom hover states needed (rely on component defaults)

**Forms**:
- Labels above inputs (text-sm font-medium, mb-2)
- Input fields: rounded-md, px-4 py-2.5, border
- Validation: Red border + error text below field
- Success states: Green checkmark icon appended

**Cards**:
- Rounded-lg, p-6, subtle shadow
- Hover: Slight shadow increase (transition-shadow)

**Tables**:
- Striped rows (alternate subtle background)
- Hover: Row highlight
- Sticky header on scroll
- Responsive: Stack columns on mobile

**Modals**:
- Overlay with semi-transparent backdrop
- Card centered (max-w-2xl)
- Header with title + close button
- Content area with scroll if needed
- Footer with action buttons (right-aligned)

**Notifications/Toasts**:
- Top-right position
- Icon + message + dismiss button
- Auto-dismiss after 5s
- Types: Success, Error, Warning, Info

---

## Icons
**Library**: Heroicons (via CDN)
- Use outline style for navigation
- Use solid style for status indicators, badges
- Consistent sizing: w-5 h-5 for inline, w-6 h-6 for standalone

---

## Images
**Hero Section**: Abstract background - geometric patterns or code visualization (subtle, low opacity)
**Documentation/Features**: Code editor screenshots showing before/after obfuscation
**Testimonials**: No user photos (focus on developer tool credibility)

---

## Accessibility
- All interactive elements keyboard accessible
- Form inputs with proper labels and aria-labels
- Focus indicators (ring-2 ring-offset-2)
- Color contrast meeting WCAG AA standards
- Table headers properly marked
- Modal focus trapping

---

## Responsive Behavior
- Mobile (< 768px): Sidebar collapses to hamburger menu, single-column layouts, horizontal scrolling tables
- Tablet (768px - 1024px): 2-column grids, persistent top bar
- Desktop (> 1024px): Full layout with sidebar, 3-4 column grids