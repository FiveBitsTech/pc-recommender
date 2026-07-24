import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const comparisonApi = createApi({
  reducerPath: 'comparisonApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  tagTypes: ['Comparison'],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => '/products',
    }),
    compareProducts: builder.mutation({
      query: (body) => ({
        url: '/comparisons/compare',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGetProductsQuery,
  useCompareProductsMutation,
} = comparisonApi
