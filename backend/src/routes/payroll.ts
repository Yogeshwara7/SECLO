import { Router } from "express";
import { upload } from "../utils/upload";
import { parseCSV } from "../services/csvService";
import { createBatch, getBatch, updateStatus, getAllBatches } from "../services/payrollService";
import { processPrivatePayout } from "../services/payrollService";
import db from "../db/database";

const router = Router();

router.post("/upload", upload.single("file"), (req, res) => {
  console.log("===================================================");
  console.log("PAYROLL UPLOAD ENDPOINT HIT");
  console.log("===================================================");
  
  try {
    const file = req.file;
    console.log("File received:", file ? file.originalname : "NO FILE");
    console.log("File size:", file ? file.size : "N/A");

    if (!file) {
      console.log("ERROR: No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Parsing CSV...");
    const records = parseCSV(file.buffer);
    console.log(`Parsed ${records.length} records from CSV`);

    console.log("Creating batch...");
    const batch = createBatch(records);
    console.log(`Batch created with ID: ${batch.id}`);

    console.log("===================================================");
    res.json({
      message: "Payroll uploaded successfully",
      batchId: batch.id,
      totalRecords: records.length,
    });
  } catch (err: any) {
    console.error("CSV processing error:", err);
    console.error("Error message:", err.message);
    console.error("===================================================");
    res.status(500).json({ 
      message: "CSV processing failed",
      error: err.message || String(err)
    });
  }
});

router.post("/start", async (req, res) => {
  const { batchId } = req.body;

  console.log("Start endpoint hit with batchId:", batchId);

  if (!batchId) {
    return res.status(400).json({ 
      message: "Missing batchId in request body" 
    });
  }

  try {
    const result = await processPrivatePayout(batchId);

    console.log("CRE execution finished successfully");

    res.json({
      message: "CRE Workflow executed successfully",
      ...result
    });

  } catch (err: any) {
    console.error("CRE execution error:", err);

    res.status(500).json({
      message: "CRE execution failed",
      error: err.message || String(err)
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

// New endpoint to get all batches for Status dashboard
router.get("/batches", (req, res) => {
  try {
    const allBatches = getAllBatches();
    
    const batchSummaries = allBatches.map(batch => {
      // Try to get authorized and rejected counts from database
      // Handle case where columns don't exist in older databases
      let authorized_count = 0;
      let rejected_count = 0;
      
      try {
        const batchData = db.prepare(`
          SELECT authorized_count, rejected_count 
          FROM payroll_batches 
          WHERE id = ?
        `).get(batch.id) as { authorized_count: number; rejected_count: number } | undefined;
        
        authorized_count = batchData?.authorized_count || 0;
        rejected_count = batchData?.rejected_count || 0;
      } catch (err) {
        // Columns don't exist yet, use defaults
        console.log('authorized_count/rejected_count columns not found, using defaults');
      }
      
      return {
        id: batch.id,
        status: batch.status,
        records: batch.records,
        createdAt: batch.createdAt || new Date().toISOString(),
        authorized_count,
        rejected_count
      };
    });

    res.json(batchSummaries);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ message: 'Failed to fetch batches', error: String(error) });
  }
});

export default router;
