import React, { memo } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./layout/layout";
import { Login } from "./pages/auth/login";
import { Admin } from "./pages/admin/admin";
// import KassaNew from "./pages/kassa/kassa2.0/Kassa"; // Unikal nom berildi
// import KassaOld from "./pages/kassa-sotuv/Kassa"; // Unikal nom berildi
import Kassa from "./pages/kassa-sotuv/Kassa";
import Vazvrat from "./pages/vazvrat/Vazvrat";
// import Debt from "./pages/debt/debt";

export const Routera = memo(() => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("access_token") || null;

  // Dummy data for demonstration purposes
  const dummyData = [
    { id: 1, property: "Example Data 1" },
    { id: 2, property: "Example Data 2" },
  ];

  return (
    <>
      {token ? (
        <Routes>
          {/* Layout komponentini asosiy tarkib sifatida qo'shamiz */}
          <Route path="/vazvrat" element={<Vazvrat />} />

          <Route path="/" element={<Layout />}>
            {/* Kassa sahifalari */}
            {/* <Route path="/kassa" element={<KassaNew />} /> */}
            {/* <Route path="/kassa-old" element={<KassaOld />} /> */}

            {/* Admin yoki Seller roli bo'yicha farqlash */}
            <Route
              index
              element={role === "user" ? <Kassa data={dummyData} /> : <Admin />}
            />

            {/* Not Found sahifasi */}
            <Route path="*" element={<h1>Page Not Found</h1>} />
          </Route>
        </Routes>
      ) : (
        <Login />
      )}
    </>
    // 
  );
});
