The Expense Tracker API is a backend service designed to help users track their daily expenses, manage budgets, and generate reports. This API provides endpoints for user management, expense tracking, budget setting, and generating expense reports in various formats.

## Features

- User Management: Register, login, update profile, and manage passwords.
- Expense Tracking: Add, edit, delete, and retrieve expenses.
- Category Management: Create, edit, and delete expense categories.
- Budget Management: Set and track budgets for categories or overall spending.
- Reports & Analytics: Generate expense reports with detailed analytics.

## Technologies Used

- Backend: Node.js, Express.js
- Database: MongoDB (with plans to migrate to SQL)
- Authentication: JWT (JSON Web Token)
- Validation: Joi for request validation

## Setup and Installation

Follow these steps to get the project up and running on your local machine.

### Prerequisites

- Node.js (v14+)
- MongoDB (or SQL database for future implementation)
- Git

  📚 API Endpoints

User Management
Register: POST /api/users/register
Login: POST /api/users/login
Update Profile: PUT /api/users/profile
Change Password: PUT /api/users/change-password
Reset Password: POST /api/users/reset-password

Expense Management
Add Expense: POST /api/expenses
Edit Expense: PUT /api/expenses/:id
Delete Expense: DELETE /api/expenses/:id
Get Expenses: GET /api/expenses

Category Management
Add Category: POST /api/categories
Edit Category: PUT /api/categories/:id
Delete Category: DELETE /api/categories/:id
Get Categories: GET /api/categories

Budget Management
Set Budget: POST /api/budget
Get Budget: GET /api/budget
Reports & Analytics
Generate Report: GET /api/report?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&format=pdf
