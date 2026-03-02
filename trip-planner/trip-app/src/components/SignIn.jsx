import React from "react";
import { useGoogleLogin } from "@react-oauth/google";

const SignIn = ({ open, onClose, onLoginSuccess }) => {
  
  // ✅ Correctly declare login at top level inside component
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (!tokenResponse.access_token) {
        console.error("Google login did not return access_token");
        return;
      }
      
      const user = {
        access_token: tokenResponse.access_token,
        token_type: tokenResponse.token_type,
      };

      // Save user in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      
      // Notify parent
      onLoginSuccess(user);
      onClose?.();
    },
    onError: (error) => {
      console.error("Google login failed:", error);
    },
  });
  
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-96 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-center">Sign in to continue</h2>
        <button
          onClick={() => login()}
          className="bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition"
        >
          Sign in with Google
        </button>
        <button
          onClick={onClose}
          className="text-slate-600 hover:text-slate-900 font-medium text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SignIn;