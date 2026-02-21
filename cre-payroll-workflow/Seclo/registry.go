//go:build wasip1

package main

// EmployeeRegistry contains all authorized employees
type EmployeeRegistry struct {
	AuthorizedEmployees []AuthorizedEmployee `json:"authorizedEmployees"`
}

// AuthorizedEmployee represents an employee authorized to receive payroll
type AuthorizedEmployee struct {
	Name       string  `json:"name"`
	Wallet     string  `json:"wallet"`
	Department string  `json:"department"`
	MaxAmount  float64 `json:"maxAmount"`
}
