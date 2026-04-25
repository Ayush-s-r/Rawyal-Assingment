"use client";

import { useSelector } from "react-redux";

export default function ProfilePage() {
  const user = useSelector((state) => state.user.user);

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <h2>No user data found. Please login again.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-lg w-[350px] text-center">
        
        <img
          src={user.profilePicture}
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-gray-700"
        />

        <h2 className="text-xl font-semibold">
          {user.firstName} {user.lastName}
        </h2>

        <p className="text-gray-400 mt-2">{user.email}</p>

        <button
          onClick={() => window.location.href = "/"}
          className="mt-6 w-full bg-white text-black py-2 rounded-lg hover:bg-gray-200 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}