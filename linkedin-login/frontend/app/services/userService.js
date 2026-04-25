import axios from "axios";

const BASE_URL = "http://localhost:5000/api/users";

export const saveUser = async (userData) => {
  try {
    const response = await axios.post(BASE_URL, userData);
    return response.data;
  } catch (error) {
    console.error("Error saving user:", error);
    throw error;
  }
};