## goals

make sidebar and topbar is functional

### topbar

Requirements:

- fixed-height top navbar
- left, center, and right sections
- left section contains sidebar toggle button
- use PanelLeftOpen / PanelLeftClose icons based on sidebar state
- right section stays empty for now
- dark background with subtle bottom border

### Project Sidebar

Create `components/layout/Sidebar.tsx`.

Requirements:

- sidebar should float above the editor canvas
- opening it should not push page content
- slides in from the left
- accepts isOpen and onClose props
- sidebar navigation should stay at the division/project level
- do not surface a standalone Credentials item in the main sidebar
- replace current sidebar component with this

### check when done

- sidebar is working correctly can redirect to another page
- new components compile without TypeScript errors
- no lint errors
