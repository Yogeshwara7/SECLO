import { Router } from "express";
import { upload } from "../utils/upload";
import { parseCSV } from "../services/csvService";
import { createBatch, getBatch, updateStatus } from "../services/payrollService";
import { processPrivatePayout } from "../services/payrollService";

const router = Router();

router.post("/upload", upload.single("file"), (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const records = parseCSV(file.buffer);

    const batch = createBatch(records);

    res.json({
      message: "Payroll uploaded successfully",
      batchId: batch.id,
      totalRecords: records.length,
    });
  } catch (err) {
    res.status(500).json({ message: "CSV processing failed" });
  }
});

router.post("/start", async (req, res) => {
  const { batchId } = req.body;

  console.log("Start endpoint hit with batchId:", batchId);

  try {
    const result = await processPrivatePayout(batchId);

    console.log("CRE execution finished:", result);

    res.json({
      message: "CRE Workflow executed successfully",
      ...result
    });

  } catch (err) {
    console.error("CRE execution error:", err);

    res.status(500).json({
      message: "CRE execution failed",
      error: String(err)
    });
  }
});


router.get("/status", (req, res) => {
  const { batchId } = req.query;

  const batch = getBatch(batchId as string);

  if (!batch) {
    return res.status(404).json({ message: "Batch not found" });
  }

  res.json({
    batchId: batch.id,
    status: batch.status,
    records: batch.records.length,
  });
});

export default router;
