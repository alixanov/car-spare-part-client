import { apiSlice } from "./api.service";

// `productApi` xizmatini yaratamiz va endpointlarni qo'shamiz
export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createProduct: builder.mutation({
      query: (product) => ({
        url: "/products",
        method: "POST",
        body: product,
      }),
    }),
    getAllProducts: builder.query({
      query: () => ({
        url: "/products",
        method: "GET",
      }),
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
    }),
    getProductByBarcode: builder.query({
      query: (barcode) => ({
        url: `/products/barcode/${barcode}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateProductMutation,
  useGetAllProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useLazyGetProductByBarcodeQuery, // Lazy query hook eksport qilindi
} = productApi;
