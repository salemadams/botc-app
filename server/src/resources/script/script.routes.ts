import { Router } from "express";
import { getScripts } from "./script.controller";

const router = Router();

router.get("/", getScripts);

export default router;
