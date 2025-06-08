import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import applicationRoutes from "./routes/application.routes";
import courseRoutes from "./routes/course.routes";
import lecturerCourseRoutes from "./routes/lecturercourse.routes";
import lecturerSelectionRoutes from "./routes/lecturerselection.routes";
import blockedUserRoutes from "./routes/blockeduser.routes";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mount all routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lecturercourses", lecturerCourseRoutes);
app.use("/api/lecturer-selections", lecturerSelectionRoutes);
app.use("/api/blocked-users", blockedUserRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) =>
    console.log("Error during Data Source initialization:", error)
  );
