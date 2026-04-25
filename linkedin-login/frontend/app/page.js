"use client";

import { useState } from "react";
import LinkedInLoginButton from "./components/auth/LinkedInLoginButton";
import ProfileCard from "./components/profile/ProfileCard";

export default function Home() {
  const [showProfile, setShowProfile] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setShowProfile(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center px-4">
      
      {/* Login Card */}
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-lg border border-gray-700 p-8 rounded-2xl shadow-xl">
        
        <h1 className="text-2xl font-semibold text-white text-center mb-6">
          Welcome Back
        </h1>

      
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />

          <input
            type="password"
            placeholder="Enter your password"
            className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Login
          </button>
        </form>

       
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="px-3 text-sm text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

       
        <LinkedInLoginButton />
      </div>

    
      <div className="mt-8">
        <ProfileCard />
      </div>
    </div>
  );
}