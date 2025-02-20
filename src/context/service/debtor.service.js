import { apiSlice } from "./api.service";

// `debtorApi` xizmatini yaratamiz va endpointlarni qo'shamiz
export const debtorApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDebtor: builder.mutation({
      query: (debtor) => ({
        url: "/debtors",
        method: "POST",
        body: debtor,
      }),
    }),
    returnProductDebtor: builder.mutation({
      query: (body) => ({
        url: "/debtors/return",
        method: "POST",
        body,
      }),
    }),
    getDebtors: builder.query({
      query: () => ({
        url: "/debtors",
        method: "GET",
      }),
    }),
    updateDebtor: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/debtors/${id}`, // To'g'ri URL
        method: "PUT",
        body, // Faqat kerakli ma'lumotlar yuboriladi
      }),
    }),
    deleteDebtor: builder.mutation({
      query: (id) => ({
        url: `/debtors/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateDebtorMutation,
  useGetDebtorsQuery,
  useUpdateDebtorMutation,
  useDeleteDebtorMutation,
  useReturnProductDebtorMutation,
} = debtorApi;
