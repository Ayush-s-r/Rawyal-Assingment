"use client";

import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@/app/redux/slices/userSlice";

export default function ProfileCard() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  if (!user) return null;

  return (
    <div className="w-80 bg-gray-900 border border-gray-700 rounded-2xl shadow-xl overflow-hidden text-center">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6">
        <img
          src={user.profilePicture}
          alt="profile"
          className="w-20 h-20 rounded-full mx-auto border-4 border-gray-900 object-cover"
        />
      </div>

      {/* Body */}
      <div className="p-5">
        <h2 className="text-lg font-semibold text-white">
          {user.firstName} {user.lastName}
        </h2>

        <p className="text-gray-400 text-sm mb-4">
          {user.email}
        </p>

        <button
          onClick={() => dispatch(clearUser())}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}