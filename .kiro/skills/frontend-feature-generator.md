---
inclusion: manual
---

# Skill: Generate Frontend Feature (Next.js + MUI + Redux)

## Purpose

Scaffold a complete frontend feature module following the team's convention: self-contained modules inside `views/` with co-located components, hooks, api, and utils. Redux store lives globally.

## Input Required

- **Feature name** (e.g., `recommendations`, `comparison`, `advisor`)
- **Page route** (e.g., `/dashboard/recommendations`)
- **Main actions** (list, create, detail, compare, form wizard, etc.)
- **API endpoints** it will consume from the backend

## Output Structure

When asked to generate a new frontend feature, create the following files:

```
client/src/
├── app/(dashboard)/<feature>/
│   └── page.jsx                                  # Thin page — imports view index
├── views/<feature>/
│   ├── index.jsx                                 # Main view entry point
│   ├── components/
│   │   ├── <Feature>Card.jsx                     # Individual item card
│   │   ├── <Feature>List.jsx                     # List/grid of items
│   │   ├── <Feature>Form.jsx                     # Input form (if applicable)
│   │   ├── <Feature>Skeleton.jsx                 # Loading skeleton
│   │   └── <Feature>EmptyState.jsx               # Empty/no-results state
│   ├── hooks/
│   │   ├── use<Feature>List.js                   # Hook for listing/filtering
│   │   ├── use<Feature>Form.js                   # Hook for form state/submission
│   │   └── use<Feature>Detail.js                 # Hook for single item detail
│   ├── api/
│   │   └── <feature>Api.js                       # RTK Query API definition
│   └── utils/                                    # (optional) feature-specific helpers
│       └── <feature>Helpers.js
└── store/
    └── slices/<feature>Slice.js                  # Redux slice (global state)
```

## File Templates

### 1. Page Route (`app/(dashboard)/<feature>/page.jsx`)

```jsx
import <Feature>Page from '@/views/<feature>'

export default function Page() {
  return <<Feature>Page />
}
```

### 2. View Index (`views/<feature>/index.jsx`)

```jsx
'use client'

import { Grid, Typography } from '@mui/material'
import use<Feature>List from './hooks/use<Feature>List'
import <Feature>List from './components/<Feature>List'
import <Feature>Skeleton from './components/<Feature>Skeleton'
import <Feature>EmptyState from './components/<Feature>EmptyState'

const <Feature>Page = () => {
  const { items, isLoading, error } = use<Feature>List()

  if (isLoading) return <<Feature>Skeleton />
  if (!items?.length) return <<Feature>EmptyState />

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4">Feature Title</Typography>
      </Grid>
      <Grid item xs={12}>
        <<Feature>List items={items} />
      </Grid>
    </Grid>
  )
}

export default <Feature>Page
```

### 3. Custom Hook (`views/<feature>/hooks/use<Feature>List.js`)

```javascript
import { useGet<Feature>sQuery } from '../api/<feature>Api'

const use<Feature>List = (filters = {}) => {
  const { data, isLoading, error, refetch } = useGet<Feature>sQuery(filters)

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error: error?.data?.message ?? null,
    refetch,
  }
}

export default use<Feature>List
```

### 4. Feature API (`views/<feature>/api/<feature>Api.js`)

```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const <feature>Api = createApi({
  reducerPath: '<feature>Api',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  tagTypes: ['<Feature>'],
  endpoints: (builder) => ({
    get<Feature>s: builder.query({
      query: (params) => ({ url: '/<features>', params }),
      providesTags: ['<Feature>'],
    }),
    get<Feature>ById: builder.query({
      query: (id) => `/<features>/${id}`,
      providesTags: (result, error, id) => [{ type: '<Feature>', id }],
    }),
    create<Feature>: builder.mutation({
      query: (body) => ({ url: '/<features>', method: 'POST', body }),
      invalidatesTags: ['<Feature>'],
    }),
    update<Feature>: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/<features>/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [{ type: '<Feature>', id }],
    }),
    delete<Feature>: builder.mutation({
      query: (id) => ({ url: `/<features>/${id}`, method: 'DELETE' }),
      invalidatesTags: ['<Feature>'],
    }),
  }),
})

export const {
  useGet<Feature>sQuery,
  useGet<Feature>ByIdQuery,
  useCreate<Feature>Mutation,
  useUpdate<Feature>Mutation,
  useDelete<Feature>Mutation,
} = <feature>Api
```

### 5. Redux Slice (`store/slices/<feature>Slice.js`) — Global

```javascript
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  filters: {},
  selectedId: null,
  dialogOpen: false,
}

const <feature>Slice = createSlice({
  name: '<feature>',
  initialState,
  reducers: {
    setFilters: (state, action) => { state.filters = action.payload },
    setSelectedId: (state, action) => { state.selectedId = action.payload },
    toggleDialog: (state) => { state.dialogOpen = !state.dialogOpen },
    resetState: () => initialState,
  },
})

export const { setFilters, setSelectedId, toggleDialog, resetState } = <feature>Slice.actions
export default <feature>Slice.reducer
```

### 6. Presentational Component (`views/<feature>/components/<Feature>Card.jsx`)

```jsx
import { Card, CardContent, CardActions, Typography, Button } from '@mui/material'

const <Feature>Card = ({ item, onSelect, onCompare }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{item.name}</Typography>
        {/* Render item details */}
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => onSelect(item.id)}>Ver detalle</Button>
        {onCompare && <Button size="small" onClick={() => onCompare(item.id)}>Comparar</Button>}
      </CardActions>
    </Card>
  )
}

export default <Feature>Card
```

## Checklist After Generation

1. Register the RTK Query API in the Redux store (`store/index.js`) — add reducer and middleware
2. Add the slice reducer to the store's root reducer
3. Verify `NEXT_PUBLIC_API_URL` is set in `.env.local`
4. Add the new page route to the navigation config if needed
5. Confirm all logic is in `hooks/`, not in `components/`
6. Confirm components are reusable and accept props (no hardcoded data)
7. Confirm loading and empty states are handled
8. Imports within the feature use relative paths (`./components/`, `./hooks/`, `../api/`)
