import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const requirementApi = createApi({
  reducerPath: 'requirementApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  tagTypes: ['Requirement', 'Recommendation'],
  endpoints: (builder) => ({
    getRequirements: builder.query({
      query: () => '/requirements',
      providesTags: ['Requirement'],
    }),
    getRequirementById: builder.query({
      query: (id) => `/requirements/${id}`,
      providesTags: (result, error, id) => [{ type: 'Requirement', id }],
    }),
    createRequirement: builder.mutation({
      query: (body) => ({
        url: '/requirements',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Requirement'],
    }),
    getRecommendationsByRequirement: builder.query({
      query: (requirementId) => `/recommendations/by-requirement/${requirementId}`,
      providesTags: (result, error, requirementId) => [
        { type: 'Recommendation', id: requirementId },
      ],
    }),
  }),
})

export const {
  useGetRequirementsQuery,
  useGetRequirementByIdQuery,
  useCreateRequirementMutation,
  useGetRecommendationsByRequirementQuery,
  useLazyGetRecommendationsByRequirementQuery,
} = requirementApi
