import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const historyApi = createApi({
  reducerPath: 'historyApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  tagTypes: ['History'],
  endpoints: (builder) => ({
    getRequirements: builder.query({
      query: () => '/requirements',
      providesTags: ['History'],
    }),
    getRecommendationsByRequirement: builder.query({
      query: (requirementId) => `/recommendations/by-requirement/${requirementId}`,
    }),
  }),
})

export const {
  useGetRequirementsQuery,
  useLazyGetRecommendationsByRequirementQuery,
} = historyApi
