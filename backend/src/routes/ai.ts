import { Router } from "express";
import { aiService } from "../services/aiService";
import { processPrivatePayout, createBatch, getAllBatches } from "../services/payrollService";
import { PayrollRecord } from "../models/payroll";
import { evaluatePayrollRisk } from "../services/riskService";

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

    console.log('Processing AI query:', query);

    const aiResponse = await aiService.processQuery(query);
    
    console.log('AI service returned:', JSON.stringify(aiResponse, null, 2));

    // If it's a payroll request, execute it
    if (aiResponse.type === 'payroll' && aiResponse.success && aiResponse.data) {
      try {
        console.log('Executing AI-generated payroll...');
        
        // Safe access to records array - handle multiple field names
        const aiRecords = aiResponse.data.records || 
                         aiResponse.data.payments || 
                         aiResponse.data.transactions || 
                         [];
        
        // Validate that we have records
        if (!Array.isArray(aiRecords) || aiRecords.length === 0) {
          throw new Error(`No valid payroll records found. Data structure: ${JSON.stringify(aiResponse.data)}`);
        }

        // Create payroll records from AI response
        const records: PayrollRecord[] = aiRecords.map((record: any) => ({
          wallet: record.employeeId || record.wallet || record.address,
          amount: record.amount,
          currency: 'SCLO'
        }));

        // Validate that we have valid wallet addresses
        if (records.some(r => !r.wallet || !r.amount)) {
          throw new Error('Invalid record format: missing wallet address or amount');
        }

        // Run risk & compliance checks before creating a batch / calling CRE
        const { approved, violations } = evaluatePayrollRisk(records);

        if (violations.length > 0) {
          console.warn('Risk/compliance violations detected:', violations);
          return res.json({
            ...aiResponse,
            success: false,
            message: `Risk/compliance check failed for ${violations.length} record(s). No transfers executed.`,
            execution: {
              status: 'failed' as const,
              error: 'Risk/compliance check failed',
              // Extra metadata for frontend / logs
              violations,
            },
          });
        }

        // Create batch only for approved records
        const batch = createBatch(approved);
        console.log('Created batch:', batch.id);

        // Execute CRE workflow
        const creResult = await processPrivatePayout(batch.id);
        console.log('CRE execution completed');

        // Return combined response
        res.json({
          ...aiResponse,
          data: {
            ...(aiResponse.data || {}),
            batchId: batch.id,
            records: approved.map(r => ({ employeeId: r.wallet, amount: r.amount })),
          },
          execution: {
            batchId: batch.id,
            records: approved.length,
            creResult: creResult.creResult,
            status: 'completed'
          }
        });

      } catch (executionError) {
        console.error('Payroll execution failed:', executionError);
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
    console.error('AI query error:', error);
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
    const batches = getAllBatches();
    const analytics = await aiService.generatePayrollAnalytics(batches);
    
    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: "Analytics generation failed",
      error: String(error)
    });
  }
});

export default router;