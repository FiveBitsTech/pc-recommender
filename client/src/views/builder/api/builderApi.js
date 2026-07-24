import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const builderApi = createApi({
  reducerPath: 'builderApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  endpoints: (builder) => ({
    buildPC: builder.mutation({
      query: (body) => ({
        url: '/builder',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useBuildPCMutation } = builderApi
