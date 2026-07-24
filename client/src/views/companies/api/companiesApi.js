import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { getAccessToken } from '@/utils/authSession'

const baseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5300'}/api`

export const companiesApi = createApi({
  reducerPath: 'companiesApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: headers => {
      const token = getAccessToken()
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    }
  }),
  tagTypes: ['Company'],
  endpoints: builder => ({
    getAdminCompanies: builder.query({
      query: () => '/companies/admin/all',
      providesTags: result =>
        result?.items
          ? [
              ...result.items.map(item => ({ type: 'Company', id: item.id })),
              { type: 'Company', id: 'LIST' }
            ]
          : [{ type: 'Company', id: 'LIST' }]
    }),
    upsertCompany: builder.mutation({
      query: body => ({
        url: '/companies',
        method: 'POST',
        body
      }),
      invalidatesTags: [{ type: 'Company', id: 'LIST' }]
    }),
    updateCompany: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/companies/${id}`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Company', id: arg.id },
        { type: 'Company', id: 'LIST' }
      ]
    }),
    generateScrapeConfig: builder.mutation({
      query: body => ({
        url: '/companies/generate-scrape-config',
        method: 'POST',
        body
      })
    })
  })
})

export const {
  useGetAdminCompaniesQuery,
  useUpsertCompanyMutation,
  useUpdateCompanyMutation,
  useGenerateScrapeConfigMutation
} = companiesApi
