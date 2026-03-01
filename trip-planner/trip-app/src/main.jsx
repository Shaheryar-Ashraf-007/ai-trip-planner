import React from "react";
import ReactDOM from "react-dom/client";
import { Router, RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import Dashboard from "./pages/dashboard.jsx";
import CreateTrip from "./pages/CreateTrip.jsx";
import ViewTrips from "./pages/viewTrips/ViewTrips.jsx";
import MyTrips from "./pages/myTrips/MyTrips.jsx";
import Navbar from "./components/navbar.jsx";
import GoogleLoader from "./components/GoogleLoader.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/create-trip",
    element: <CreateTrip />,
  },
 
  {
    path: "/view-trips",
    element: <ViewTrips/>
  },
  {
    path: "/my-trips",
    element: <MyTrips/>
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <Navbar/>
      <GoogleLoader>
        <RouterProvider router={router} />
      </GoogleLoader>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
