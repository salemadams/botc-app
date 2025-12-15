import { Request, Response } from "express";
import { ScriptService } from "../../services/ScriptService";

const scriptService = new ScriptService();

export async function getScripts(req: Request, res: Response) {
  try {
    const scripts = await scriptService.getAllScripts();
    res.json(scripts);
  } catch (err: any) {
    console.error("Error in getScripts:", err.message);
    res.status(500).json({ error: "Failed to load scripts" });
  }
}
