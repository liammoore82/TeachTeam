import { Router } from "express";
import { UserController } from "../controller/UserController";

const router = Router();
const userController = new UserController();

router.get("/", async (req, res) => {
  await userController.all(req, res);
});

router.get("/:id", async (req, res) => {
  await userController.one(req, res);
});

router.post("/", async (req, res) => {
  await userController.save(req, res);
});

router.put("/:id", async (req, res) => {
  await userController.update(req, res);
});

router.delete("/:id", async (req, res) => {
  await userController.remove(req, res);
});

export default router;
