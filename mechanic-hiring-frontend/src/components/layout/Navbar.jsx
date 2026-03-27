import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-2xl px-6 py-4 sticky top-0 z-50 border-b border-blue-500/20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
        >
          ⚙️ GEARGO
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 text-gray-300 font-semibold">
          <li>
            <Link
              to="/"
              className="hover:text-cyan-400 transition-all duration-300 relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link
              to="/services"
              className="hover:text-cyan-400 transition-all duration-300 relative group"
            >
              Services
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link
              to="/hire-mechanics"
              className="hover:text-cyan-400 transition-all duration-300 relative group"
            >
              Hire Mechanic
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className="hover:text-cyan-400 transition-all duration-300 relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="hover:text-cyan-400 transition-all duration-300 relative group"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
        </ul>

        {/* Auth Buttons / User Menu */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 border-2 border-cyan-400 text-cyan-400 rounded-lg font-semibold hover:bg-cyan-400/10 transition-all duration-300 transform hover:scale-105"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="relative group">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                👤 {user.name || user.email}
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-blue-500/30 rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                  <Link
                    to={
                      user.role === "admin"
                        ? "/admin/dashboard"
                        : user.role === "mechanic"
                          ? "/mechanic/dashboard"
                          : "/customer/dashboard"
                    }
                    className="block px-4 py-3 text-gray-300 hover:bg-blue-600/30 hover:text-cyan-400 transition-all duration-200"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    📊 Dashboard
                  </Link>
                  <Link
                    to={
                      user.role === "mechanic"
                        ? "/mechanic/profile"
                        : "/customer/profile"
                    }
                    className="block px-4 py-3 text-gray-300 hover:bg-blue-600/30 hover:text-cyan-400 transition-all duration-200"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    ⚙️ Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-gray-300 hover:bg-red-600/30 hover:text-red-400 transition-all duration-200 border-t border-slate-700"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-cyan-400 text-2xl focus:outline-none transition-transform duration-300 transform hover:scale-110"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <ul className="flex flex-col gap-3 text-gray-300 font-semibold">
            <li>
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 rounded-lg hover:bg-blue-600/30 hover:text-cyan-400 transition-all duration-200"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 rounded-lg hover:bg-blue-600/30 hover:text-cyan-400 transition-all duration-200"
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                to="/hire-mechanics"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 rounded-lg hover:bg-blue-600/30 hover:text-cyan-400 transition-all duration-200"
              >
                Hire Mechanic
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 rounded-lg hover:bg-blue-600/30 hover:text-cyan-400 transition-all duration-200"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 rounded-lg hover:bg-blue-600/30 hover:text-cyan-400 transition-all duration-200"
              >
                Contact
              </Link>
            </li>

            <div className="border-t border-slate-700 pt-3 mt-3 flex gap-3">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-center hover:bg-blue-700 transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2.5 border-2 border-cyan-400 text-cyan-400 rounded-lg font-semibold text-center hover:bg-cyan-400/10 transition-all duration-300"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={
                      user.role === "admin"
                        ? "/admin/dashboard"
                        : user.role === "mechanic"
                          ? "/mechanic/dashboard"
                          : "/customer/dashboard"
                    }
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-center hover:bg-blue-700 transition-all duration-300"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </ul>
        </div>
      )}
    </nav>
  );
}
