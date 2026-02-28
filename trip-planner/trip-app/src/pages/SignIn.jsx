import React, { useState } from "react";
import { useNavigate } from "react-router";

const SignIn = () => {
  const navigate = useNavigate()

  const [open, setOpen] = useState(true); // dialog visible initially

  const onClose = () => {
    setOpen(false);
    navigate("/") // navigate to home after closing dialog
    console.log("close");
  };

  // Hide dialog when closed
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">

      {/* Dialog Box */}
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-indigo-950 mb-6">
          Sign In
        </h2>

        {/* Google Button */}
        <button className="flex items-center justify-center gap-3 w-full border rounded-lg py-3 hover:bg-gray-100 transition">

          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-5 h-5"
          />

          <span className="font-medium cursor-pointer">
            Sign in with Google
          </span>

        </button>

      </div>
    </div>
  );
};

export default SignIn;