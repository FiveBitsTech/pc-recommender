import { configureStore } from '@reduxjs/toolkit'

import { requirementApi } from '@/views/requirements/api/requirementApi'

export const store = configureStore({
  reducer: {
    [requirementApi.reducerPath]: requirementApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(requirementApi.middleware),
})
