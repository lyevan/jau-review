import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  res.json({ message: "Get notifications" });
});

export default router;
