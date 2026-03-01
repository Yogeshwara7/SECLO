import { Router } from 'express';

const router = Router();

/**
 * Employee registry containing authorized employees and their payment limits
 * This data is fetched by the CRE workflow via Confidential HTTP
 */
const employeeRegistry = {
  authorizedEmployees: [
    {
      name: "Alice",
      wallet: "0xA1B2C3D4E5F60123456789012345678901234567",
      department: "Engineering",
      maxAmount: 10000
    },
    {
      name: "Bob",
      wallet: "0xB2C3D4E5F60123456789012345678901224354AB",
      department: "Marketing",
      maxAmount: 8000
    },
    {
      name: "Carol",
      wallet: "0xC3D4E5F6012345678901234567890123456789AB",
      department: "Sales",
      maxAmount: 12000
    },
    {
      name: "David",
      wallet: "0xD4E5F6012345678901234567890123456789ABCD",
      department: "Engineering",
      maxAmount: 9000
    },
    {
      name: "Eve",
      wallet: "0xE5F6012345678901234567890123456789ABCDE1",
      department: "HR",
      maxAmount: 7500
    }
  ]
};

/**
 * GET /registry/employees
 * Returns the employee registry for CRE workflow validation
 * This endpoint is called by the CRE workflow using Confidential HTTP
 * to fetch authorized employees and their payment limits
 */
router.get('/employees', (req, res) => {
  res.json(employeeRegistry);
});

export default router;
