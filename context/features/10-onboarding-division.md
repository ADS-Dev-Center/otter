## Goals

check the relevant skills

create onboarding flow after sign-in/up, real implementation and using prisma, prisma is already installed check the skills first before implement prisma.

### onboarding page

onboarding page is the page that only show once after sign-in/up at the first time,
onboarding is the step to create division, because when user sign in user dont have division yet.
this step is cannot be skip, after create division user go to next step is invite member(this process can be skip and this step dont implement for the future so dont implement, just make the ui)

### ui

- this is multistep onboarding with 2 process (create division & invite member)
- using shadcn card in the middle of the screen
- add title, description, input workspace name (by default the field is filled with name of logged in user).
- install shadcn components when needed

### default division when user exit the web

- user can redirect to previous seleted division if loged in back or opening the web

### its done when

- user can create division
- user redirect to the division
- user can switch to different division
