## goals

Build a **Division Switcher** component in the sidebar as a top-level selector (below logo), replacing the separate `/divisions` page concept.

### Requirements

- **Location**: Top of sidebar, below the Otter logo header
- **Display**: Show current division name + member count indicator
- **Members**: Show up to 4 member avatar initials (stacked), with overflow count (+N)
- **Behavior**: Clicking opens a dropdown/modal to switch between divisions
- **Create Division**: Provide Add Division action from switcher dropdown
- **Modal standard**: Use shadcn `Dialog` for Create Division modal (portal overlay, not embedded in sidebar container)
- **Post-create behavior**: Stay on current active division after creating a new division
- **Permissions**: All users can create divisions (for current mock phase)
- **Mini-rail**: Collapsed sidebar must show division indicators and allow quick switching
- **Management location**: Division management belongs to Settings page
- **Persistence**: Store division list and active division context in localStorage
- **Styling**: Use glassmorphism with Tailwind v4 CSS variables, no `style={}`, use `cn()` for conditional classes
- **Data**: Static mock divisions (no API calls yet)
