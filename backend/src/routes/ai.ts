import { Router } from "express";
import { aiService } from "../services/aiService";
import { processPrivatePayout, getBatch, createBatch } from "../services/payrollService";
import { PayrollRecord } from "../models/payroll";

const router = Router();

// Main AI endpoint - handles all AI queries
router.post("/query", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: "Query is required" 
      });
    }

    console.log('🤖 Processing AI query:', query);

    const aiResponse = await aiService.processQuery(query);

    // If it's a payroll request, execute it
    if (aiResponse.type === 'payroll' && aiResponse.success && aiResponse.data) {
      try {
        console.log('🚀 Executing AI-generated payroll...');
        
        // Create payroll records from AI response
        const records: PayrollRecord[] = aiResponse.data.records.map((record: any) => ({
          wallet: record.employeeId,
          amount: record.amount,
          currency: 'SCLO'
        }));

        // Create batch
        const batch = createBatch(records);
        console.log('📦 Created batch:', batch.id);

        // Execute CRE workflow
        const creResult = await processPrivatePayout(batch.id);
        console.log('✅ CRE execution completed');

        // Return combined response
        res.json({
          ...aiResponse,
          execution: {
            batchId: batch.id,
            creResult: creResult.creResult,
            status: 'completed'
          }
        });

      } catch (executionError) {
        console.error('❌ Payroll execution failed:', executionError);
        res.json({
          ...aiResponse,
          execution: {
            status: 'failed',
            error: String(executionError)
          }
        });
      }
    } else {
      // For analytics and reports, just return AI response
      res.json(aiResponse);
    }

  } catch (error) {
    console.error('❌ AI query error:', error);
    res.status(500).json({
      success: false,
      message: "AI processing failed",
      error: String(error)
    });
  }
});

// Get AI analytics for existing batches
router.get("/analytics", async (req, res) => {
  try {
    // In a real app, you'd fetch from database
    // For now, we'll use mock data
    const mockBatches = [
      {
        id: "batch-1",
        records: [
          { wallet: "0xA1B2C3D4E5F60123456789012345678901234567", amount: 5000, currency: "SCLO" },
          { wallet: "0xB2C3D4E5F6012345678901234567890123456789", amount: 4000, currency: "SCLO" }
        ],
        status: "processed" as const
      }
    ];

    const analytics = await aiService.generatePayrollAnalytics(mockBatches);
    
    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({
      success: false,
      message: "Analytics generation failed",
      error: String(error)
    });
  }
});

export default router;