import dotenv from "dotenv";
dotenv.config(); // ❗ MUST be at top

import app from "./src/app.js";

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});