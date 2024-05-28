import React from "react";
import { Route, Routes } from "react-router-dom";
import GrapeJSPage from "./pages/GrapeJSPage.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import Select from "./pages/Select.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/editor" element={<GrapeJSPage />} />
      <Route path="/select" element={<Select />} />
    </Routes>
  );
}
