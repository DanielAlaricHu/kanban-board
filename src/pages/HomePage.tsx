import React from "react";
import { useAuth } from "../context/AuthContext";

const HomePage: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row justify-center items-center p-8 bg-white relative">
      {/* Left: Main content */}
      <div className="w-full max-w-lg z-10">
        <h1 className="font-KuaiLe text-4xl font-bold mb-4 text-left">
          看板·板 <br />
          <span className="text-6xl font-pacifico my-6 block orange-purple-gradient-text">Kanban Board</span>
        </h1>
        <p className="text-lg text-gray-700 mb-8 text-left">
          A personal Kanban board built with React, Firebase, MUI, Tailwind CSS, and Redux for efficient task management.
        </p>
        {/* Sign in button */}
        <div className="w-full max-w-xs">
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded shadow hover:bg-gray-50 transition"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-6 h-6"
            />
            <span className="font-medium">Continue with Google</span>
          </button>
        </div>
      </div>

      {/* Right: TODO: Have some interesting graphics here  */}
    </div>
  );
};

export default HomePage;