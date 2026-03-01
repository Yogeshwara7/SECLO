import { Router } from "express";
import { simulatePayrollTransaction } from "../services/tenderlyService";

const router = Router();

router.post("/simulate", async (req, res) => {
  try {
    const { employees, amounts, tokenAddress, consumerAddress } = req.body;

    if (!employees || !amounts || !tokenAddress || !consumerAddress) {
      return res.status(400).json({
        message: "Missing required fields: employees, amounts, tokenAddress, consumerAddress"
      });
    }

    if (!Array.isArray(employees) || !Array.isArray(amounts)) {
      return res.status(400).json({
        message: "employees and amounts must be arrays"
      });
    }

    if (employees.length !== amounts.length) {
      return res.status(400).json({
        message: "employees and amounts arrays must have the same length"
      });
    }

    console.log(`Simulating payroll transaction for ${employees.length} employees`);

    const result = await simulatePayrollTransaction(
      employees,
      amounts,
      tokenAddress,
      consumerAddress
    );

    res.json(result);
  } catch (error: any) {
    console.error("Tenderly simulation error:", error);
    res.status(500).json({
      message: "Simulation failed",
      error: error.message || String(error)
    });
  }
});

export default router;
