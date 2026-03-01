import { useLoadScript } from "@react-google-maps/api";
import React from "react";

const GoogleLoader = ({ children }) => {

 const { isLoaded } = useLoadScript({

   googleMapsApiKey:
     import.meta.env.VITE_GOOGLE_MAP_API_KEY,

   libraries:["places"], // VERY IMPORTANT

 });

 if (!isLoaded) return <div>Loading Google...</div>;

 return children;

};

export default GoogleLoader;
