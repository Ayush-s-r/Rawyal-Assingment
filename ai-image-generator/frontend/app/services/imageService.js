import axios from "axios";

export const generateImage = async (data) => {
  const res = await axios.post(
    "http://localhost:5000/api/images/generate",
    data,
    {
      responseType: "blob", // 🔥 IMPORTANT
    }
  );

  return URL.createObjectURL(res.data);
};