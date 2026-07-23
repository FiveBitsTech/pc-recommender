---
inclusion: always
---

# Frontend Architecture Rules — Next.js 15 + MUI + Redux

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **UI Library:** MUI 6 (Material UI) + Emotion
- **State Management:** Redux Toolkit (RTK) + RTK Query for API calls
- **Styling:** Tailwind CSS (utility), Emotion (component-level), MUI `sx` prop
- **Language:** JavaScript (JSX)

## Project Structure

```
client/src/
├── app/                        # Next.js App Router (routing ONLY)
│   └── (dashboard)/
│       └── <feature>/
│           └── page.jsx        # Thin — imports view index and renders it
├── views/                      # Feature modules (self-contained)
│   └── <feature>/
│       ├── index.jsx           # Main view entry point (imported by app page)
│       ├── components/         # Components specific to THIS feature
│       │   ├── <Feature>Card.jsx
│       │   ├── <Feature>List.jsx
│       │   ├── <Feature>Form.jsx
│       │   └── <Feature>Skeleton.jsx
│       ├── hooks/              # Custom hooks specific to THIS feature
│       │   ├── use<Feature>List.js
│       │   ├── use<Feature>Form.js
│       │   └── use<Feature>Detail.js
│       ├── api/                # API calls specific to THIS feature (RTK Query or fetch helpers)
│       │   └── <feature>Api.js
│       └── utils/              # Utilities specific to THIS feature (optional)
│           └── <feature>Helpers.js
├── components/                 # GLOBAL shared/reusable components (cross-feature)
│   └── common/
├── hooks/                      # GLOBAL shared hooks (cross-feature, e.g., useDebounce)
├── store/                      # Redux store (GLOBAL — lives outside features)
│   ├── index.js               # Store setup + root reducer + middleware
│   └── slices/                # Redux slices (one per domain concept)
│       ├── <feature>Slice.js
│       └── ...
├── utils/                      # GLOBAL shared pure utilities
├── configs/                    # App configuration (theme, navigation, routes)
├── assets/                     # Static assets, icons
├── @core/                      # Template core (DO NOT MODIFY unless necessary)
├── @layouts/                   # Layout components (template-provided)
└── @menu/                      # Menu/navigation components (template-provided)
```

## Key Principle: Feature Modules in `views/`

Each feature is a **self-contained module** inside `views/<feature>/`. Everything the feature needs (components, hooks, api, utils) lives together in that folder. This keeps related code close and easy to navigate.

**Global vs Local:**
- `views/<feature>/components/` → components ONLY used by this feature
- `views/<feature>/hooks/` → hooks ONLY used by this feature
- `views/<feature>/api/` → API definitions ONLY for this feature
- `src/components/` → shared components reused across MULTIPLE features
- `src/hooks/` → shared hooks reused across MULTIPLE features
- `src/store/` → Redux store, slices (global state management)

## Rules

### 1. App Router (`app/`)

- Contains ONLY route structure, `page.jsx`, `layout.jsx`, and `loading.jsx`.
- Page files are thin: import the view index and render it. Nothing else.
- **FORBIDDEN:** Business logic, state, API calls, or component definitions in page files.

### 2. Views / Feature Modules (`views/<feature>/`)

- `index.jsx` is the entry point — composes feature components and connects hooks.
- The index orchestrates layout but delegates logic to hooks and rendering to components.
- Each feature folder is self-contained: another developer can understand the feature by reading just this folder.

### 3. Feature Components (`views/<feature>/components/`)

- Components are **purely presentational** — they receive data and callbacks via props.
- **FORBIDDEN:** Writing fetch/API logic directly in components. Use hooks.
- **FORBIDDEN:** Duplicating components. If a pattern repeats within the feature, extract a reusable component.
- If a component is reused by OTHER features, move it to `src/components/common/`.

### 4. Feature Hooks (`views/<feature>/hooks/`)

- **ALL functional/business logic MUST live in custom hooks**, never inside components directly.
- Hooks encapsulate: API calls, state management, form handling, computed values, side effects.
- Components only render UI based on what hooks return.
- Hook naming: `use<Feature><Action>.js` (e.g., `useRecommendationForm.js`).
- Hooks MUST NOT render JSX or contain styling logic.

### 5. Feature API (`views/<feature>/api/`)

- API definitions specific to the feature (RTK Query endpoints or fetch wrappers).
- If using RTK Query, define the API here and register it in the global store.
- **FORBIDDEN:** Calling `fetch` or `axios` raw inside components. Always go through the api layer or hooks.

### 6. Redux Store (`store/` — Global)

- Redux lives OUTSIDE feature folders — it's shared global state.
- Use **Redux Toolkit** for global state and **RTK Query** for server state caching.
- One slice per domain concept: `slices/recommendationSlice.js`, `slices/comparisonSlice.js`.
- Feature API files in `views/<feature>/api/` are registered into the global store.
- **FORBIDDEN:** Using `useState` for data that needs to be shared across features. Use Redux.
- Selectors live in the slice file.

### 7. Global Shared (`components/`, `hooks/`, `utils/`)

- Only put things here if they are reused by **2 or more features**.
- Don't prematurely extract — start local in the feature, promote to global when reused.

## General Rules

- **No code duplication.** If a UI pattern, API call, or logic repeats, abstract it.
- **Reuse components aggressively.** Create flexible components with props, not copies with minor changes.
- **All code in English** (variable names, function names, comments).
- **File naming:** PascalCase for components (`RecommendationCard.jsx`), camelCase for hooks/utils (`useRecommendation.js`, `formatPrice.js`).
- **One component per file.** Do not export multiple components from a single file.
- **Error handling:** Use error boundaries for UI crashes. Handle API errors in hooks with user-friendly messages.
- **Loading states:** Every async operation must show a loading indicator. Use MUI `Skeleton`, `CircularProgress`, or custom loaders.
- **Responsive design:** All components must work on mobile (360px+), tablet, and desktop.
