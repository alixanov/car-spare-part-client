import { apiSlice } from "./api.service";

// `saleApi` xizmatini yaratamiz va endpointlarni qo'shamiz
export const saleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    recordSale: builder.mutation({
      query: (sale) => ({
        url: "/sales",
        method: "POST",
        body: sale,
      }),
      invalidatesTags: ["Sales"]
    }),
    getSalesHistory: builder.query({
      query: () => ({
        url: "/sales",
        method: "GET",
      }),
      providesTags: ["Sales"]
    }),
    getSalesStats: builder.query({
      query: () => ({
        url: "/stat/year",
        method: "GET",
      }),
      providesTags: ["Sales"]
    }),
  }),
});

export const { useRecordSaleMutation, useGetSalesHistoryQuery, useGetSalesStatsQuery } = saleApi;
