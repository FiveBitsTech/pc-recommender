import { configureStore } from '@reduxjs/toolkit'

import { requirementApi } from '@/views/requirements/api/requirementApi'
import { comparisonApi } from '@/views/comparisons/api/comparisonApi'
import { historyApi } from '@/views/history/api/historyApi'
import { builderApi } from '@/views/builder/api/builderApi'
import { homeApi } from '@/views/home/api/homeApi'
import { companiesApi } from '@/views/companies/api/companiesApi'
import { scrapingApi } from '@/views/scraping/api/scrapingApi'
import { adminCatalogApi } from '@/views/admin/api/adminCatalogApi'

export const store = configureStore({
  reducer: {
    [requirementApi.reducerPath]: requirementApi.reducer,
    [comparisonApi.reducerPath]: comparisonApi.reducer,
    [historyApi.reducerPath]: historyApi.reducer,
    [builderApi.reducerPath]: builderApi.reducer,
    [homeApi.reducerPath]: homeApi.reducer,
    [companiesApi.reducerPath]: companiesApi.reducer,
    [scrapingApi.reducerPath]: scrapingApi.reducer,
    [adminCatalogApi.reducerPath]: adminCatalogApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(requirementApi.middleware)
      .concat(comparisonApi.middleware)
      .concat(historyApi.middleware)
      .concat(builderApi.middleware)
      .concat(homeApi.middleware)
      .concat(companiesApi.middleware)
      .concat(scrapingApi.middleware)
      .concat(adminCatalogApi.middleware),
})
