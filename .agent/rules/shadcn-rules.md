---
trigger: always_on
---

# Antigravity UI Rules — Shadcn-First Policy

These rules are mandatory for the Antigravity AI agent when generating UI code.

---

## 1. Shadcn Is the Single Source of Truth

- Always use existing `shadcn/ui` components available in the project.
- Never recreate a shadcn component manually.
- Never copy shadcn source code to modify or extend it.

If a component exists in shadcn, it **must** be used.

---

## 2. Shadcn Components Are Read-Only

- Do NOT edit any files inside `components/ui/`.
- Do NOT modify:
  - component logic
  - styles
  - variants
  - props
  - structure

All shadcn components are treated as **immutable**.

---

## 3. Composition Over Creation

- Build UI by composing existing components.
- Allowed:
  - wrapping components
  - passing props
  - passing `className`
  - layout and behavior logic

✅ Allowed:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Profile</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>Save</Button>
  </CardContent>
</Card>
````

❌ Not Allowed:

* Rebuilding shadcn markup
* Reimplementing styles
* Creating shadcn-like clones

---

## 4. Custom Components Policy

Custom components may be created **only if**:

* They are composed entirely of:

  * shadcn components
  * existing Antigravity components
* They provide layout, composition, or behavior — not UI primitives

### Allowed Custom Components

* Feature wrappers
* Page sections
* State-handling components

### Forbidden Custom Components

* Button
* Input
* Select
* Modal
* Tooltip
* Tabs
* Any other UI primitive

---

## 5. No New UI Primitives Without Explicit Permission

* The agent must NOT create new base UI components.
* If a required primitive is missing:

  * use the closest existing shadcn component
  * OR stop and request permission

No assumptions. No improvisation.

---

## 6. Styling Rules

* Use Tailwind utility classes **only on composed or wrapper components**.
* Do NOT:

  * override internal shadcn styles
  * use global CSS for UI components
  * modify CSS variables used by shadcn

`className` usage is allowed. CSS files are not.

---

## 7. Import Rules

* Always import UI components from:

```ts
@/components/ui/...
```

* Do NOT import:

  * duplicated components
  * copied UI code
  * third-party UI libraries (MUI, Chakra, Ant, etc.)

---

## 8. Uncertainty Rule (Fail Fast)

If unsure whether:

* a component already exists
* a shadcn component should be extended
* a new component is allowed

The agent must **stop and ask** before generating code.

---

## Enforcement Rule (Non-Negotiable)

> If a UI component exists in shadcn, it must be used as-is.
> If it does not exist, build only by composing existing shadcn components.
> Modifying or recreating shadcn components is forbidden.

---
