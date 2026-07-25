import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { getAccessToken } from '@/utils/authSession'

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5300/api'

const withListParams = (path, params = {}) => {
  const search = new URLSearchParams()

  if (params.q) search.set('q', params.q)
  if (params.companyId) search.set('companyId', String(params.companyId))
  if (params.page != null) search.set('page', String(params.page))
  if (params.pageSize != null) search.set('pageSize', String(params.pageSize))

  const qs = search.toString()

  return `${path}${qs ? `?${qs}` : ''}`
}

export const adminCatalogApi = createApi({
  reducerPath: 'adminCatalogApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: headers => {
      const token = getAccessToken()

      if (token) headers.set('Authorization', `Bearer ${token}`)

      return headers
    }
  }),
  tagTypes: ['AdminProduct', 'AdminTag', 'AdminPrice', 'AdminSpec', 'AdminComparison', 'AdminRecommendation'],
  endpoints: builder => ({
    getAdminProducts: builder.query({
      query: (params = {}) => withListParams('/products/admin', params),
      providesTags: result =>
        result?.items
          ? [
              ...result.items.map(item => ({ type: 'AdminProduct', id: item.id })),
              { type: 'AdminProduct', id: 'LIST' }
            ]
          : [{ type: 'AdminProduct', id: 'LIST' }]
    }),
    getAdminProduct: builder.query({
      query: id => `/products/admin/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'AdminProduct', id }]
    }),
    updateAdminProduct: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/products/admin/${id}`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'AdminProduct', id: arg.id },
        { type: 'AdminProduct', id: 'LIST' },
        { type: 'AdminSpec', id: 'LIST' },
        { type: 'AdminPrice', id: 'LIST' }
      ]
    }),
    deleteAdminProduct: builder.mutation({
      query: id => ({
        url: `/products/admin/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [
        { type: 'AdminProduct', id: 'LIST' },
        { type: 'AdminTag', id: 'LIST' },
        { type: 'AdminPrice', id: 'LIST' },
        { type: 'AdminSpec', id: 'LIST' },
        { type: 'AdminComparison', id: 'LIST' },
        { type: 'AdminRecommendation', id: 'LIST' }
      ]
    }),
    getAdminTags: builder.query({
      query: (params = {}) => withListParams('/products/admin/tags', params),
      providesTags: [{ type: 'AdminTag', id: 'LIST' }]
    }),
    deleteAdminTag: builder.mutation({
      query: id => ({
        url: `/products/admin/tags/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [
        { type: 'AdminTag', id: 'LIST' },
        { type: 'AdminProduct', id: 'LIST' }
      ]
    }),
    getAdminPrices: builder.query({
      query: (params = {}) => withListParams('/products/admin/prices', params),
      providesTags: [{ type: 'AdminPrice', id: 'LIST' }]
    }),
    getAdminSpecs: builder.query({
      query: (params = {}) => withListParams('/products/admin/specs', params),
      providesTags: [{ type: 'AdminSpec', id: 'LIST' }]
    }),
    getAdminComparisons: builder.query({
      query: (params = {}) => withListParams('/products/admin/comparisons', params),
      providesTags: [{ type: 'AdminComparison', id: 'LIST' }]
    }),
    deleteAdminComparison: builder.mutation({
      query: id => ({
        url: `/products/admin/comparisons/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'AdminComparison', id: 'LIST' }]
    }),
    getAdminRecommendations: builder.query({
      query: (params = {}) => withListParams('/products/admin/recommendations', params),
      providesTags: [{ type: 'AdminRecommendation', id: 'LIST' }]
    }),
    deleteAdminRecommendation: builder.mutation({
      query: id => ({
        url: `/products/admin/recommendations/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'AdminRecommendation', id: 'LIST' }]
    })
  })
})

export const {
  useGetAdminProductsQuery,
  useGetAdminProductQuery,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,
  useGetAdminTagsQuery,
  useDeleteAdminTagMutation,
  useGetAdminPricesQuery,
  useGetAdminSpecsQuery,
  useGetAdminComparisonsQuery,
  useDeleteAdminComparisonMutation,
  useGetAdminRecommendationsQuery,
  useDeleteAdminRecommendationMutation
} = adminCatalogApi
