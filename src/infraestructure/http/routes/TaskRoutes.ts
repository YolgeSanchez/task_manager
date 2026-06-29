import { Router } from "express";
import { taskController } from "../containers/task.index.js";
const router = Router();

router.get("/tasks", taskController.findAllTasks);
router.get("/tasks/:id", taskController.findTaskById);
router.post("/tasks", taskController.createTask);
router.patch("/tasks/:id", taskController.updateTask);
router.delete("/tasks/:id", taskController.deleteTask);

export default router;