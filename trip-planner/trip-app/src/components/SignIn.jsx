import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router";

const SignIn = ({ open, onClose }) => {

  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: (codeResp) => {
    console.log(codeResp);
      onClose?.();   // close from parent
    },
    onError: (error) => {
      console.log("Login failed:", error);
    }
  });

  
  // hide dialog when not open
  if (!open) return null;

  const handleClose = () => {
    onClose?.();   // close from parent
    navigate("/"); // go home
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">

      {/* Dialog Box */}
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center relative">

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-3 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-indigo-950 mb-6">
          Sign In
        </h2>

        {/* Google Button */}
        <button className="flex items-center justify-center gap-3 cursor-pointer w-full border rounded-lg py-3 hover:bg-gray-100 transition">

          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-5 h-5"
          />

          <span className="font-medium cursor-pointer" onClick={login}>
            Sign in with Google
          </span>

        </button>

      </div>
    </div>
  );
};

export default SignIn;