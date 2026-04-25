import axios from "axios";

const BASE_URL = "http://localhost:5000/api/auth";

export const getAccessToken = async (code) => {
  try {
        const response = await axios.post(`${BASE_URL}/linkedin`, {
      code,
    });

    console.log(response.data)
    return response.data; // contains access_token
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
};

export const getLinkedInUser = async (token) => {
  const response = await axios.get(
    "http://localhost:5000/api/auth/linkedin/user",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};