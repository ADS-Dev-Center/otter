## goals

The global `/credentials` route is no longer a standalone surface. It should redirect into `/projects` so credentials stay scoped to the selected project.

Inside project detail pages, credentials should be grouped by environment such as Production, Development, and Staging, and each group should render as a collapsible accordion item so larger vaults stay readable.

### shadcn component

- install shadcn component only the components that we need
- dont change the style from `component/ui/*`
- customize the components only with `className`
- dont you ever usinf `style={{}}` and use `cn()` function if needed

### sidebar

- wire the sidebar to the page
