import express from "express";
import { runSingleTest, submitAllTests } from "../controller/evaluationController.js";

const router = express.Router();

router.post("/run", runSingleTest);
router.post("/submit", submitAllTests);

export default router;
