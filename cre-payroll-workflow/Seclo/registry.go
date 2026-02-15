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

// GetEmployeeRegistry returns the hardcoded employee registry
// TODO: In production, this should be loaded from a secure external source
func GetEmployeeRegistry() EmployeeRegistry {
	return EmployeeRegistry{
		AuthorizedEmployees: []AuthorizedEmployee{
			{
				Name:       "Alice",
				Wallet:     "0xA1B2C3D4E5F60123456789012345678901234567",
				Department: "Engineering",
				MaxAmount:  10000,
			},
			{
				Name:       "Bob",
				Wallet:     "0xB2C3D4E5F6012345678901234567890123456789",
				Department: "Marketing",
				MaxAmount:  8000,
			},
			{
				Name:       "Carol",
				Wallet:     "0xC3D4E5F6012345678901234567890123456789AB",
				Department: "Sales",
				MaxAmount:  12000,
			},
			{
				Name:       "David",
				Wallet:     "0xD4E5F6012345678901234567890123456789ABCD",
				Department: "Engineering",
				MaxAmount:  9000,
			},
			{
				Name:       "Eve",
				Wallet:     "0xE5F6012345678901234567890123456789ABCDE1",
				Department: "HR",
				MaxAmount:  7500,
			},
		},
	}
}
