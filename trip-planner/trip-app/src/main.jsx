import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import Dashboard from "./pages/dashboard.jsx";
import CreateTrip from "./pages/CreateTrip.jsx";
import ViewTrips from "./pages/view-trip/[tripId]/ViewTrips.jsx";
import MyTrips from "./pages/myTrips/MyTrips.jsx";
import Navbar from "./components/Navbar.jsx";
import GoogleLoader from "./components/GoogleLoader.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import EditTrips from "./pages/editTrips/EditTrips.jsx";
import ViewPage from "./components/ViewPage.jsx";
import Login from "./components/SignIn.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

import "./index.css";

// ── Root layout: Navbar + ScrollToTop wrap every page ────────────────────────
const RootLayout = () => (
  <>
        <GoogleLoader>

    <ScrollToTop />
    <Navbar />
    <Outlet />
          </GoogleLoader>
   {/* each route renders here */}
  </>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,   // parent layout for all routes
    children: [
      { path: "/",                element: <Dashboard /> },
      { path: "/create-trip",     element: <CreateTrip /> },
      { path: "/view-trip/:tripId", element: <ViewTrips /> },
      { path: "/my-trips",        element: <MyTrips /> },
      { path: "/edit-trip/:tripId", element: <EditTrips /> },
      { path: "/view-place",      element: <ViewPage /> },
      { path: "/login",           element: <Login /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
        <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);

