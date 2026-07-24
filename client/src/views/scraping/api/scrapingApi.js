import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { getAccessToken } from '@/utils/authSession'

const baseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5300'}/api`

export const scrapingApi = createApi({
  reducerPath: 'scrapingApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: headers => {
      const token = getAccessToken()
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    }
  }),
  tagTypes: ['ScrapingHistory', 'ScrapingSources'],
  endpoints: builder => ({
    getScrapingSources: builder.query({
      query: () => '/scraping/sources',
      providesTags: ['ScrapingSources']
    }),
    getScrapingHistory: builder.query({
      query: () => '/scraping/history',
      providesTags: ['ScrapingHistory']
    }),
    runScraping: builder.mutation({
      query: body => ({
        url: '/scraping/run',
        method: 'POST',
        body
      }),
      invalidatesTags: ['ScrapingHistory']
    }),
    previewScraping: builder.mutation({
      query: body => ({
        url: '/scraping/preview',
        method: 'POST',
        body
      })
    })
  })
})

export const {
  useGetScrapingSourcesQuery,
  useGetScrapingHistoryQuery,
  useRunScrapingMutation,
  usePreviewScrapingMutation
} = scrapingApi
