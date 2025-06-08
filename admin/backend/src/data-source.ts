import "reflect-metadata";
import { DataSource } from "typeorm";
import { Profile } from "./entity/Profile";
import { Admin } from "./entity/Admin";
import { User } from "./entity/User";
import { Course } from "./entity/Course";
import { Application } from "./entity/Application";
import { LecturerCourse } from "./entity/LecturerCourse";
import { LecturerSelection } from "./entity/LecturerSelection";
import { BlockedUser } from "./entity/BlockedUser";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "209.38.26.237",
  port: 3306,
  username: "S4062985",
  password: "4062985",
  database: "S4062985",
  // synchronize: true will automatically create database tables based on entity definitions
  // and update them when entity definitions change. This is useful during development
  // but should be disabled in production to prevent accidental data loss.
  synchronize: true,
  logging: true,
  entities: [Profile, Admin, User, Course, Application, LecturerCourse, LecturerSelection, BlockedUser],
  migrations: [],
  subscribers: [],
});
