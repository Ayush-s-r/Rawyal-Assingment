import express from "express";
import cors from "cors";
import imageRoutes from "./routes/imageRoutes.js";
import morgan from "morgan"

const app = express();

app.use(morgan('dev'))
app.use(cors());
app.use(express.json());

app.use("/api/images", imageRoutes);

export default app;