"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/app/redux/slices/userSlice";
import { getAccessToken, getLinkedInUser } from "@/app/services/authService";
import { saveUser } from "@/app/services/userService";
import { useRouter } from "next/navigation";

export default function Callback() {
  const dispatch = useDispatch();
  const router = useRouter(); 
  const hasRun = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = new URLSearchParams(window.location.search).get("code");

    if (!code) {
      setError("Authorization code missing");
      return;
    }

    const login = async () => {
      try {
       
        const tokenData = await getAccessToken(code);
        console.log("TOKEN:", tokenData);

        const accessToken = tokenData?.access_token;

        if (!accessToken) {
          throw new Error("No access token received");
        }

        
        const user = await getLinkedInUser(accessToken);
        console.log("USER:", user);

        if (!user) {
          throw new Error("Failed to fetch user");
        }

        const userData = {
          firstName: user.given_name || "",
          lastName: user.family_name || "",
          email: user.email || "Not provided",
          profilePicture: user.picture || "",
        };

        await saveUser(userData);

      
        dispatch(setUser(userData));

        console.log("LOGIN SUCCESS");

        router.replace("/profile"); 

      } catch (err) {
        console.error("LOGIN ERROR :", err);
        setError("Login failed. Please try again.");
      }
    };

    login();
  }, [dispatch, router]);


  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
        <h2 className="text-xl mb-4 text-red-500">{error}</h2>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-white text-black rounded-lg"
        >
          Go Home
        </button>
      </div>
    );
  }

 
  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <h2 className="text-xl animate-pulse">Logging you in...</h2>
    </div>
  );
}