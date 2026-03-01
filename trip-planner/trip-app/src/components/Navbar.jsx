import HeroSection from "./HeroSection";

const Navbar = () => {

  return (
    <>
      {/* Navbar */}
      <nav className="w-full px-6 py-4 flex items-center justify-between bg-white shadow-md">

        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"   // logo inside public folder
            alt="logo"
            className="w-10 h-10 object-contain"
          />

          <h1 className="text-2xl font-bold text-blue-600">
            AI Trip Planner
          </h1>
        </div>

        {/* Menu */}
        <div className="flex items-center gap-6 font-medium">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Login
          </button>
        </div>


      </nav>
    </>
  );
};

export default Navbar;