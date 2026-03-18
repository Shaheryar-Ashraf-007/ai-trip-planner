import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Router, RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import Dashboard from "./pages/dashboard.jsx";
import CreateTrip from "./pages/CreateTrip.jsx";
import ViewTrips from "./pages/view-trip/[tripId]/ViewTrips.jsx";
import MyTrips from "./pages/myTrips/MyTrips.jsx";
import Navbar from "./components/Navbar.jsx";
import GoogleLoader from "./components/GoogleLoader.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import EditTrips from "./pages/editTrips/EditTrips.jsx";
import ViewPage from "./components/ViewPage.jsx";

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
    path: "/view-trip/:tripId",
    element: <ViewTrips/>
  },
  {
    path: "/my-trips",
    element: <MyTrips/>
  },
  {
  path: "/edit-trip/:tripId",
  element: <EditTrips />
},

 {
  path: "/view-place",
  element: <ViewPage />
}
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <GoogleLoader>
        <BrowserRouter>
    <Navbar/>
    </BrowserRouter>
        <RouterProvider router={router} />
      </GoogleLoader>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
