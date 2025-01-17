import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
function Index() {
  return <div>Index</div>;
}

const root = ReactDOM.createRoot(document.querySelector("#root")!);
root.render(
  <BrowserRouter>
    <Routes>
      <Route index element={<App />} />
    </Routes>
  </BrowserRouter>,
);
