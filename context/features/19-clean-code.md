# Feature 19 — Clean Code & Maintainability

Check the skills and define the skills that we need

## Overview

This feature establishes clean code patterns for Otter to ensure maintainability, reusability, and scalability. The guide covers Next.js best practices, service layer separation, component reusability, and existing implementation analysis.

Always check skills to implement so the implementation can be perfect like the examples we're looking at; MCP Next.js makes for good implementation; check skills for Prisma for the best combo of best practices, and other skills

**Goals:**

- Separate API interactions into a services layer
- Pages/components only import utility functions
- Reusable components with clear responsibility boundaries
- Testable code through dependency injection
- Maintainable architecture with single-responsibility principle

---

## Current State Analysis

### ✅ Already Well Implemented

#### 1. **Validation Layer (lib/validations/)**

- **Pattern**: Co-located Zod schemas with feature
- **Files**: `division.ts`, `project.ts`, `credential.ts`
- **Example** (`lib/validations/project.ts`):
  ```typescript
  export const createProjectSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    environment: z.enum(["dev", "staging", "production"]).optional(),
  });
  export type CreateProjectInput = z.infer<typeof createProjectSchema>;
  ```
- **Usage**: Zod schemas are defined once and reused in both API routes and client forms
- **Benefit**: Single source of truth; type safety guaranteed throughout the app

#### 2. **Auth Helper Layer (lib/auth.ts)**

- **Pattern**: Centralized auth utilities
- **Functions**:
  - `getUserDivisionIds(clerkId)` — fetch division memberships
  - `getUserRoleInDivision(clerkId, divisionId)` — role checks
- **Benefit**: Every API route imports these helpers instead of writing auth logic inline
- **Security**: Division isolation enforced consistently

#### 3. **Encryption Service (lib/crypto.ts)**

- **Pattern**: Encapsulated encryption logic
- **Exports**: `encrypt()`, `decrypt()` only
- **Benefit**: Crypto details hidden; all credential value encryption routed through this single module
- **Security Invariant**: No credential value ever written in plaintext

#### 4. **Audit Logging (lib/audit.ts, lib/audit-meta.ts)**

- **Pattern**: Centralized audit trail
- **Function**: `writeAuditLog(action, resource, actorId, metadata)`
- **Benefit**: Consistent audit format; every mutation logged
- **Example**: Projects create logs on: create, update, delete, and credential reveal

#### 5. **Database Client (lib/prisma.ts)**

- **Pattern**: Singleton Prisma client
- **Usage**: `import { prisma } from "@/lib/prisma"`
- **Benefit**: Single DB connection; lifecycle managed in one place

#### 6. **Component Organization (components/)**

- **Pattern**: Feature-based folder structure
  ```
  components/
  ├── audit/          (AuditLogTable, AuditLogRow, AuditLogSkeleton)
  ├── credentials/    (CredentialForm, CredentialCard, DeleteDialog)
  ├── projects/       (ProjectCard, CreateDialog, DeleteDialog)
  ├── layout/         (AppShell, Sidebar, DivisionSwitcher)
  ├── dashboard/      (DivisionCards, MembersList)
  └── ui/            (shadcn primitives only)
  ```
- **Benefit**: Related components grouped; easy to locate feature-specific UI

---

## ⚠️ Patterns That Need Improvement

### 1. **API Logic Mixed in Route Handlers**

**Current State** (`app/api/projects/route.ts`):

```typescript
// ❌ Logic tightly coupled to HTTP layer
export async function POST(req: Request) {
  const { userId } = await auth();
  const divisionIds = await getUserDivisionIds(userId);

  const body = await req.json();
  const parsed = createProjectSchema.parse(body);

  const slug = toSlug(parsed.name);
  const existing = await prisma.project.findUnique({
    where: { slug_divisionId: { slug, divisionId: parsed.divisionId } }
  });

  if (existing) {
    return NextResponse.json({ error: { code: "CONFLICT" } }, { status: 409 });
  }

  // ... more logic
  const project = await prisma.project.create({ data: {...} });
  await writeAuditLog("create", "project", userId, { projectId: project.id });

  return NextResponse.json({ data: project });
}
```

**Problem**:

- Route handler contains business logic (slug generation, duplicate check, audit log)
- Hard to test without mocking HTTP
- Logic cannot be reused in other contexts (Server Actions, background jobs)
- Difficult to understand primary responsibility

**Solution**: Extract to service layer

---

## 🎯 Recommended Clean Code Architecture

### Pattern 1: Services Layer for API Interactions

**Structure:**

```
lib/services/
├── project.service.ts       (all project logic)
├── division.service.ts      (all division logic)
├── credential.service.ts    (all credential logic)
├── audit.service.ts         (audit operations)
└── user.service.ts          (user operations)
```

**Example: `lib/services/project.service.ts`**

```typescript
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { toSlug } from "@/lib/slug";
import type { CreateProjectInput } from "@/lib/validations/project";

/**
 * Create a new project in a division.
 * Returns 409 if slug already exists in division (TOCTOU race).
 */
export async function createProject(
  userId: string,
  divisionId: string,
  input: CreateProjectInput,
) {
  // Validate ownership
  const role = await getUserRoleInDivision(userId, divisionId);
  if (!["DIVISION_OWNER", "DIVISION_ADMIN"].includes(role)) {
    throw new UnauthorizedError("Cannot create projects in this division");
  }

  const slug = toSlug(input.name);

  try {
    const project = await prisma.project.create({
      data: {
        name: input.name,
        description: input.description,
        environment: input.environment,
        slug,
        divisionId,
      },
    });

    await writeAuditLog("create", "project", userId, {
      projectId: project.id,
      name: project.name,
    });

    return project;
  } catch (e) {
    // Handle TOCTOU race: slug already created between check and create
    if ((e as any)?.code === "P2002") {
      throw new ConflictError("A project with this name already exists");
    }
    throw e;
  }
}

/**
 * List projects for a user (respecting division scoping).
 */
export async function listProjectsByDivisions(
  userId: string,
  divisionIds: string[],
  options?: { environment?: string },
) {
  const where: any = { divisionId: { in: divisionIds } };
  if (options?.environment) {
    where.environment = options.environment;
  }

  return prisma.project.findMany({
    where,
    include: { _count: { select: { credentials: true } } },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a single project with full audit history.
 */
export async function getProjectWithAudit(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { division: true },
  });

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  // Verify access
  const role = await getUserRoleInDivision(userId, project.divisionId);
  if (!role) {
    throw new ForbiddenError("Access denied");
  }

  // Fetch audit trail
  const auditTrail = await prisma.auditLog.findMany({
    where: {
      resource: "project",
      metadata: { path: ["projectId"], equals: projectId },
    },
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  return { project, auditTrail };
}

/**
 * Delete a project and all child credentials.
 */
export async function deleteProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  const role = await getUserRoleInDivision(userId, project.divisionId);
  if (role !== "DIVISION_OWNER") {
    throw new ForbiddenError("Only division owners can delete projects");
  }

  const deleted = await prisma.$transaction([
    prisma.credential.deleteMany({ where: { projectId } }),
    prisma.project.delete({ where: { id: projectId } }),
  ]);

  await writeAuditLog("delete", "project", userId, {
    projectId,
    name: project.name,
  });

  return deleted[1];
}
```

**Usage in API Route** (`app/api/projects/route.ts`):

```typescript
import {
  createProject,
  listProjectsByDivisions,
} from "@/lib/services/project.service";
import { createProjectSchema } from "@/lib/validations/project";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  const divisionIds = await getUserDivisionIds(userId);
  const body = await req.json();

  try {
    const input = createProjectSchema.parse(body);
    // ✅ Clear responsibility: delegate to service
    const project = await createProject(userId, input.divisionId, input);
    return NextResponse.json({ data: project });
  } catch (e) {
    if (e instanceof ConflictError) {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: e.message } },
        { status: 409 },
      );
    }
    if (e instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: e.message } },
        { status: 403 },
      );
    }
    console.error("[POST /api/projects]", e);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to create project" },
      },
      { status: 500 },
    );
  }
}
```

**Benefits:**

- ✅ Logic can be tested in isolation (no HTTP mocking needed)
- ✅ Reusable in Server Actions, webhooks, cron jobs, CLI tools
- ✅ Clear error handling (custom exception classes)
- ✅ Route handler focuses on HTTP concerns only (parsing, auth, response formatting)

---

### Pattern 2: Custom Error Classes

**File: `lib/errors.ts`**

```typescript
/**
 * Base error class for domain errors.
 * All service errors extend this for consistent error handling.
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public issues: Record<string, string[]>,
  ) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string = "Not found") {
    super(message, "NOT_FOUND", 404);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string = "Conflict") {
    super(message, "CONFLICT", 409);
  }
}

export class RateLimitError extends DomainError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, "RATE_LIMIT", 429);
  }
}

export class InternalError extends DomainError {
  constructor(message: string = "Internal server error") {
    super(message, "INTERNAL_ERROR", 500);
  }
}
```

**Usage in Service:**

```typescript
if (!project) {
  throw new NotFoundError(`Project ${projectId} not found`);
}

if (role !== "DIVISION_OWNER") {
  throw new ForbiddenError("Only owners can delete projects");
}

if (e instanceof PrismaError && e.code === "P2002") {
  throw new ConflictError("Project name already exists in this division");
}
```

**Usage in Route Handler:**

```typescript
try {
  const project = await createProject(userId, divisionId, input);
  return NextResponse.json({ data: project });
} catch (e) {
  if (e instanceof DomainError) {
    return NextResponse.json(
      { error: { code: e.code, message: e.message } },
      { status: e.statusCode },
    );
  }
  // Unexpected error
  console.error("Unexpected error:", e);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "An error occurred" } },
    { status: 500 },
  );
}
```

---

### Pattern 3: Reusable Hooks for Common Operations

**File: `hooks/useProjectMutation.ts`**

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query"; // or SWR
import { useState } from "react";

interface ProjectMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for create/update/delete project mutations.
 * Handles loading, error states, and cache invalidation.
 */
export function useCreateProject(options?: ProjectMutationOptions) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  return useMutation(
    async (input: CreateProjectInput) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to create project");
      }

      return response.json();
    },
    {
      onSuccess: (data) => {
        // Invalidate project list cache
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        setServerError(null);
        options?.onSuccess?.(data);
      },
      onError: (error: Error) => {
        setServerError(error.message);
        options?.onError?.(error);
      },
    },
  );
}

export function useDeleteProject(options?: ProjectMutationOptions) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  return useMutation(
    async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to delete project");
      }

      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        setServerError(null);
        options?.onSuccess?.();
      },
      onError: (error: Error) => {
        setServerError(error.message);
        options?.onError?.(error);
      },
    },
  );
}
```

**Usage in Component:**

```typescript
"use client";

import { useCreateProject } from "@/hooks/useProjectMutation";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";

export function ProjectList() {
  const createMutation = useCreateProject({
    onSuccess: (data) => {
      toast.success(`Project "${data.name}" created`);
    },
  });

  return (
    <CreateProjectDialog
      onSubmit={(input) => createMutation.mutate(input)}
      isLoading={createMutation.isPending}
      error={createMutation.error?.message}
    />
  );
}
```

---

### Pattern 4: Reusable Components with Composition

**Current State:**

```typescript
// ❌ Hard to reuse if you only need part of the form
<CredentialForm
  mode="create"
  projectId={projectId}
  initialFields={{}}
  onSuccess={handleSuccess}
/>
```

**Better Approach:**

```
components/credentials/
├── CredentialForm.tsx           (full form logic)
├── CredentialNameField.tsx      (reusable field)
├── CredentialTypeSelect.tsx     (reusable field)
├── CredentialValueInput.tsx     (reusable field)
├── CredentialTagsInput.tsx      (reusable field)
└── CredentialFormDialog.tsx     (form wrapped in dialog)
```

**Example: `components/credentials/CredentialNameField.tsx`**

```typescript
"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateCredentialInput } from "@/lib/validations/credential";

interface CredentialNameFieldProps {
  required?: boolean;
  placeholder?: string;
}

/**
 * Reusable credential name field.
 * Works with any React Hook Form form.
 */
export function CredentialNameField({
  required = true,
  placeholder = "e.g., Production DB Password",
}: CredentialNameFieldProps) {
  const { control, formState: { errors } } = useFormContext<CreateCredentialInput>();

  return (
    <div className="space-y-2">
      <Label htmlFor="name" required={required}>
        Name
      </Label>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Input
            id="name"
            placeholder={placeholder}
            {...field}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
        )}
      />
      {errors.name && (
        <p id="name-error" className="text-xs text-red-500">
          {errors.name.message}
        </p>
      )}
    </div>
  );
}
```

**Example: `components/credentials/CredentialForm.tsx` using composition**

```typescript
"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCredentialSchema } from "@/lib/validations/credential";
import { CredentialNameField } from "./CredentialNameField";
import { CredentialTypeSelect } from "./CredentialTypeSelect";
import { CredentialValueInput } from "./CredentialValueInput";
import { CredentialTagsInput } from "./CredentialTagsInput";
import { Button } from "@/components/ui/button";

interface CredentialFormProps {
  mode: "create" | "edit";
  projectId: string;
  initialValues?: any;
  onSuccess?: (credential: any) => void;
}

export function CredentialForm({
  mode,
  projectId,
  initialValues,
  onSuccess,
}: CredentialFormProps) {
  const form = useForm({
    resolver: zodResolver(createCredentialSchema),
    defaultValues: initialValues || { projectId },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const url = mode === "create"
      ? `/api/credentials`
      : `/api/credentials/${data.id}`;

    const response = await fetch(url, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      form.setError("root", { message: error.error?.message });
      return;
    }

    const result = await response.json();
    onSuccess?.(result.data);
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* ✅ Compose reusable fields */}
        <CredentialNameField />
        <CredentialTypeSelect />
        <CredentialValueInput />
        <CredentialTagsInput />

        {form.formState.errors.root && (
          <p className="text-sm text-red-500">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {mode === "create" ? "Create" : "Update"} Credential
        </Button>
      </form>
    </FormProvider>
  );
}
```

---

### Pattern 5: Server Actions for Form Submissions

**File: `app/actions/projects.ts`**

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";
import { createProject, deleteProject } from "@/lib/services/project.service";
import { createProjectSchema } from "@/lib/validations/project";
import { DomainError } from "@/lib/errors";
import { revalidatePath } from "next/cache";

/**
 * Server Action for creating a project.
 * Called from form component via `action` prop.
 */
export async function createProjectAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const input = createProjectSchema.parse({
      name: formData.get("name"),
      description: formData.get("description"),
      divisionId: formData.get("divisionId"),
      environment: formData.get("environment"),
    });

    const project = await createProject(userId, input.divisionId, input);
    revalidatePath("/projects");
    return { success: true, data: project };
  } catch (e) {
    if (e instanceof DomainError) {
      return { error: e.message, code: e.code };
    }
    console.error("Unexpected error in createProjectAction:", e);
    return { error: "An error occurred" };
  }
}

export async function deleteProjectAction(projectId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    await deleteProject(projectId, userId);
    revalidatePath("/projects");
    return { success: true };
  } catch (e) {
    if (e instanceof DomainError) {
      return { error: e.message, code: e.code };
    }
    return { error: "An error occurred" };
  }
}
```

**Usage in Form Component:**

```typescript
"use client";

import { createProjectAction } from "@/app/actions/projects";
import { useTransition } from "react";

export function CreateProjectForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createProjectAction(formData);
      if (result.error) {
        setError(result.error);
      } else {
        toast.success("Project created");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <input name="name" type="text" required />
      <input name="description" type="text" />
      <select name="environment">
        <option value="dev">Development</option>
        <option value="staging">Staging</option>
        <option value="production">Production</option>
      </select>

      {error && <p className="text-red-500">{error}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Project"}
      </button>
    </form>
  );
}
```

---

## 📋 Implementation Checklist

### Phase 1: Create Service Layer (Week 1)

- [x] Create `lib/errors.ts` with custom error classes
- [x] Create `lib/services/` folder
- [x] Extract `project.service.ts` with CRUD operations
- [x] Extract `division.service.ts` with CRUD operations
- [x] Extract `credential.service.ts` with CRUD operations
- [x] Extract `member.service.ts` with membership operations
- [x] Update all API routes to use services
- [x] Verify `npm run build` passes

### Phase 2: Add Server Actions (Week 2)

- [ ] Create `app/actions/` folder
- [ ] Add `projects.ts` with Server Actions
- [ ] Add `divisions.ts` with Server Actions
- [ ] Add `credentials.ts` with Server Actions
- [ ] Add `members.ts` with Server Actions
- [ ] Update forms to use Server Actions instead of fetch
- [ ] Test form submissions work

### Phase 3: Extract Reusable Components (Week 3)

- [ ] Split `CredentialForm.tsx` into field components
- [ ] Split `ProjectCard.tsx` into smaller components
- [ ] Create dialog wrapper components
- [ ] Extract modal dialogs into reusable components
- [ ] Document component composition patterns
- [ ] Add Storybook stories for components

### Phase 4: Add Data Fetching Hooks (Week 4)

- [ ] Create `hooks/useProjects.ts` for fetching project list
- [ ] Create `hooks/useDivisions.ts` for fetching divisions
- [ ] Create `hooks/useCredentials.ts` for fetching credentials
- [ ] Create `hooks/useMembers.ts` for fetching members
- [ ] Add mutation hooks for all CRUD operations
- [ ] Integrate SWR or React Query for caching

---

## 🔍 File Structure After Refactoring

```
otter/
├── app/
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── credentials/page.tsx
│   │   ├── members/page.tsx
│   │   └── settings/page.tsx
│   ├── actions/                    # ✨ NEW
│   │   ├── projects.ts
│   │   ├── divisions.ts
│   │   ├── credentials.ts
│   │   └── members.ts
│   ├── api/
│   │   ├── projects/route.ts      # ✅ Now uses services
│   │   ├── divisions/route.ts     # ✅ Now uses services
│   │   ├── credentials/route.ts   # ✅ Now uses services
│   │   └── members/route.ts       # ✅ Now uses services
│   ├── layout.tsx
│   ├── page.tsx
│   └── middleware.ts
├── components/
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectNameField.tsx       # ✨ NEW
│   │   ├── ProjectForm.tsx            # ✨ REFACTORED
│   │   ├── CreateProjectDialog.tsx    # ✨ NEW
│   │   └── DeleteProjectDialog.tsx
│   ├── credentials/
│   │   ├── CredentialForm.tsx         # ✨ REFACTORED
│   │   ├── CredentialNameField.tsx    # ✨ NEW
│   │   ├── CredentialTypeSelect.tsx   # ✨ NEW
│   │   ├── CredentialValueInput.tsx   # ✨ NEW
│   │   ├── CredentialCard.tsx
│   │   └── DeleteCredentialDialog.tsx
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   └── DivisionSwitcher.tsx
│   └── ui/
│       └── (shadcn primitives)
├── hooks/
│   ├── useProjects.ts               # ✨ NEW
│   ├── useDivisions.ts              # ✨ NEW
│   ├── useCredentials.ts            # ✨ NEW
│   ├── useProjectMutation.ts        # ✨ NEW
│   ├── useProjectDelete.ts          # ✨ NEW
│   └── use-mobile.ts
├── lib/
│   ├── services/                    # ✨ NEW
│   │   ├── project.service.ts
│   │   ├── division.service.ts
│   │   ├── credential.service.ts
│   │   ├── member.service.ts
│   │   └── audit.service.ts
│   ├── errors.ts                    # ✨ NEW
│   ├── auth.ts
│   ├── crypto.ts
│   ├── prisma.ts
│   ├── audit.ts
│   └── validations/
│       ├── project.ts
│       ├── division.ts
│       └── credential.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── code-standards.md
│   └── features/
│       ├── 01-dashboard.md
│       ├── ...
│       └── 19-clean-code.md         # ← You are here
└── package.json
```

---

## 🧪 Testing Clean Code

### Unit Testing Services

**Example: `lib/services/project.service.test.ts`**

```typescript
import { createProject } from "./project.service";
import { UnauthorizedError, ConflictError } from "@/lib/errors";
import * as auth from "@/lib/auth";
import * as db from "@/lib/prisma";

jest.mock("@/lib/auth");
jest.mock("@/lib/prisma");

describe("createProject", () => {
  it("should create a project with valid inputs", async () => {
    const userId = "user_123";
    const divisionId = "div_123";
    const input = { name: "New Project" };

    jest
      .spyOn(auth, "getUserRoleInDivision")
      .mockResolvedValue("DIVISION_OWNER");

    jest.spyOn(db.prisma.project, "create").mockResolvedValue({
      id: "proj_123",
      name: "New Project",
      slug: "new-project",
      divisionId,
      createdAt: new Date(),
    });

    const result = await createProject(userId, divisionId, input);

    expect(result.id).toBe("proj_123");
  });

  it("should throw UnauthorizedError if user is not owner", async () => {
    jest.spyOn(auth, "getUserRoleInDivision").mockResolvedValue("MEMBER");

    await expect(
      createProject("user_123", "div_123", { name: "Project" }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("should throw ConflictError on duplicate slug", async () => {
    jest
      .spyOn(auth, "getUserRoleInDivision")
      .mockResolvedValue("DIVISION_OWNER");

    jest
      .spyOn(db.prisma.project, "create")
      .mockRejectedValue({ code: "P2002" });

    await expect(
      createProject("user_123", "div_123", { name: "Project" }),
    ).rejects.toThrow(ConflictError);
  });
});
```

---

## 📚 References & Best Practices

### General Next.js Clean Code

1. **Separate concerns**: Pages/components should not contain business logic
2. **Single Responsibility**: Each file should do one thing well
3. **Dependency Injection**: Pass dependencies as function arguments, not via globals
4. **Error Handling**: Use typed error classes, not generic strings
5. **Validation at Boundaries**: Validate all external input at system edges
6. **Type Safety**: Use TypeScript strict mode; avoid `any`
7. **Testing**: Services should be easily testable

### Next.js Specific Patterns

1. **Use Server Components by default** — add `use client` only when needed
2. **Server Actions for mutations** — cleaner than fetch-based forms
3. **Route Handlers for complex logic** — not every mutation needs a Server Action
4. **Middleware for auth/logging** — single choke point for cross-cutting concerns
5. **Revalidation for cache busting** — use `revalidatePath()` after mutations
6. **Type-safe fetch** — use Zod to validate API responses
7. **Error boundaries** — wrap async operations in try/catch

### Performance

1. **Avoid waterfalls** — fetch independent data in parallel
2. **Use `Promise.all()`** — fetch multiple resources concurrently
3. **Lazy load components** — use `dynamic()` for heavy components
4. **Server-side pagination** — fetch only what you need
5. **Memoization** — cache expensive computations in services

---

## 🎯 Next Steps

1. **Review existing code** — run `npm run build` to ensure current state compiles
2. **Create `lib/errors.ts`** — define all custom error classes
3. **Refactor first service** — start with `lib/services/project.service.ts`
4. **Update API routes** — migrate to use new services
5. **Test thoroughly** — ensure all endpoints still work
6. **Document patterns** — add comments to new services explaining the pattern
7. **Gradual rollout** — apply pattern to other features incrementally

---

## Summary

Clean code in Otter means:

- ✅ **API logic lives in services**, not route handlers
- ✅ **Pages only call services**, never directly access database
- ✅ **Components are small and reusable**
- ✅ **Errors are typed and handled consistently**
- ✅ **Tests are possible without mocking HTTP**
- ✅ **Business logic is reusable across contexts** (API, Server Actions, webhooks, CLI)

This architecture ensures Otter remains maintainable, scalable, and testable as it grows.
