## goals

Build `/auditlog` screen using `shadcn/ui` components with no API calls or persistence yet. This page displays a comprehensive audit trail of actions performed on credentials and system resources within the current division context.

### audit log display

- Audit log is displayed as a table using shadcn/ui table component
- Show audit entries with columns: `Timestamp`, `Action`, `Resource`, `Actor`, `Division`, `Details`
- Actions include: `VIEW`, `CREATE`, `UPDATE`, `DELETE`, `COPY` with appropriate icons/badges
- Resources include: `Credential`, `Project`, `Member`, `Division` with type badges
- Actor shows the user's name and email
- Timestamp shows relative time (e.g., "2 hours ago") with full ISO datetime on hover
- Details column shows contextual information (e.g., credential name, old value vs new value for updates)

### filtering & search

- Search by actor name, resource name, or action type
- Filter by date range (Last 24h, Last 7 days, Last 30 days, Custom range)
- Filter by action type (checkboxes: VIEW, CREATE, UPDATE, DELETE, COPY)
- Filter by resource type (checkboxes: Credential, Project, Member, Division)
- Division filter (dropdown) showing only user's divisions — Super Admin sees all divisions
- Active filters should show as chips/badges with clear action

### pagination & sorting

- Table paginated with 25 entries per page (can be adjusted)
- Sort by timestamp (default descending), action, actor, resource
- Show total entry count and current page range ("1-25 of 324 entries")

### shadcn component

Always check skills first

- Install only the components that we need
- Don't change the style from `components/ui/*`
- Customize components only with `className`
- Never use `style={{}}` — use `cn()` function if needed
- Required components:
  - `table` — for audit log entries
  - `input` — for search field
  - `button` — for filter controls and actions
  - `checkbox` — for filter options
  - `select` (or custom select) — for dropdown filters
  - `badge` — for action and resource type indicators
  - `card` — for page container and filter panel

### sidebar

- Wire the sidebar to include a new "Audit Log" navigation item
- Only accessible to users with `DIVISION_ADMIN` or `SUPER_ADMIN` role
- Icon: use Lucide `LogOut`, `ActivitySquare`, or similar

### layout & structure

- **Header**: "Audit Log" title with optional description ("View all actions performed on credentials and resources")
- **Filter Panel**: Sticky or collapsible section above table with:
  - Search input (full-width)
  - Date range picker
  - Action type checkboxes
  - Resource type checkboxes
  - Division dropdown (if user is Super Admin or multi-division member)
  - Clear filters button
- **Table**: Display audit entries in responsive table format
  - Show loading skeleton while data loads (mock for now)
  - Show empty state message if no entries match filters
- **Pagination**: Controls at bottom of table (prev/next buttons, page indicator)

### mock data structure

Each audit log entry should have this shape (for mock purposes):

```typescript
{
  id: string
  timestamp: Date
  action: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'COPY'
  resourceType: 'CREDENTIAL' | 'PROJECT' | 'MEMBER' | 'DIVISION'
  resourceId: string
  resourceName: string
  actorId: string
  actorName: string
  actorEmail: string
  divisionId: string
  divisionName: string
  details?: {
    oldValue?: string
    newValue?: string
    changeDescription?: string
  }
}
```

Generate realistic mock entries covering various action and resource type combinations.

### styling & ux

- Use consistent color coding for action badges:
  - `VIEW` — blue/info
  - `CREATE` — green/success
  - `UPDATE` — amber/warning
  - `DELETE` — red/destructive
  - `COPY` — slate/neutral
- Resource type badges with neutral background
- Hover states on table rows (slight background highlight)
- Responsive design: on mobile, collapse to a card-based list view or horizontal scroll table
- No animations required for this iteration

### out of scope

- API implementation and database queries
- Real data fetching from audit table
- Exporting audit logs (CSV, JSON)
- Advanced analytics or charts
- Real-time updates or WebSocket integration
- Role-based action visibility (assume mock data shows actions the user should see based on their role)
