import { Router } from "express";
import { simulatePayrollTransaction } from "../services/tenderlyService";

const router = Router();

router.post("/simulate", async (req, res) => {
  console.log("===================================================");
  console.log("TENDERLY SIMULATION ENDPOINT HIT");
  console.log("===================================================");
  
  try {
    const { employees, amounts, tokenAddress, consumerAddress } = req.body;

    console.log("Request body:", JSON.stringify(req.body, null, 2));

    if (!employees || !amounts || !tokenAddress || !consumerAddress) {
      console.log("ERROR: Missing required fields");
      return res.status(400).json({
        message: "Missing required fields: employees, amounts, tokenAddress, consumerAddress"
      });
    }

    if (!Array.isArray(employees) || !Array.isArray(amounts)) {
      console.log("ERROR: employees and amounts must be arrays");
      return res.status(400).json({
        message: "employees and amounts must be arrays"
      });
    }

    if (employees.length !== amounts.length) {
      console.log(`ERROR: Length mismatch - employees: ${employees.length}, amounts: ${amounts.length}`);
      return res.status(400).json({
        message: "employees and amounts arrays must have the same length"
      });
    }

    console.log(`Simulating payroll transaction for ${employees.length} employees`);
    console.log("Employees:", employees);
    console.log("Amounts:", amounts);

    const result = await simulatePayrollTransaction(
      employees,
      amounts,
      tokenAddress,
      consumerAddress
    );

    console.log("Simulation completed successfully");
    console.log("===================================================");
    res.json(result);
  } catch (error: any) {
    console.error("Tenderly simulation error:", error);
    console.error("Error message:", error.message);
    console.error("===================================================");
    res.status(500).json({
      message: "Simulation failed",
      error: error.message || String(error)
    });
  }
});

export default router;
