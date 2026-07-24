import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const homeApi = createApi({
  reducerPath: 'homeApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  endpoints: (builder) => ({
    getRecentRequirements: builder.query({
      query: () => '/requirements/recent',
    }),
  }),
})

export const { useGetRecentRequirementsQuery } = homeApi
