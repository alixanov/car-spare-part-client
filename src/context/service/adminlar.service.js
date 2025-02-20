import { apiSlice } from "./api.service";

// `adminApi` xizmatini yaratamiz va endpointlarni qo'shamiz
export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signUpAsAdmin: builder.mutation({
      query: (credentials) => ({
        url: "/register",
        method: "POST",
        body: credentials,
      }),
    }),
    signInAsAdmin: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    getAdmins: builder.query({
      query: () => ({
        url: "/admins",
        method: "GET",
      }),
    }),
    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/admin/${id}`,
        method: "DELETE",
      }),
    }),
    updateAdmin: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useSignUpAsAdminMutation,
  useSignInAsAdminMutation,
  useGetAdminsQuery,
  useDeleteAdminMutation,
  useUpdateAdminMutation,
} = adminApi;
