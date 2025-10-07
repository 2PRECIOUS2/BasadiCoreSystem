# Timesheet API Documentation

## Overview

The Timesheet API provides complete CRUD functionality for managing employee timesheets with proper role-based access control and workflow management.

## Database Schema

The timesheet system uses a PostgreSQL database with the following table structure:

### Timesheets Table

```sql
CREATE TABLE timesheets (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(employee_id),
    project_id INTEGER REFERENCES projects(project_id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration INTEGER DEFAULT 0, -- in minutes
    total_hours DECIMAL(4,2) GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (end_time - start_time)) / 3600 - (break_duration / 60.0)
    ) STORED,
    work_done TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    approved_by INTEGER REFERENCES employees(employee_id),
    rejection_reason TEXT,
    UNIQUE(employee_id, date)
);
```

## API Endpoints

### 1. Get All Timesheets

**GET** `/api/timesheets`

**Query Parameters:**

- `employee_id` (optional) - Filter by specific employee (admin only)
- `project_id` (optional) - Filter by project
- `status` (optional) - Filter by status (draft, submitted, approved, rejected)
- `date_from` (optional) - Start date filter (YYYY-MM-DD)
- `date_to` (optional) - End date filter (YYYY-MM-DD)
- `limit` (optional, default: 50) - Number of records to return
- `offset` (optional, default: 0) - Number of records to skip

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_id": 123,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "project_id": 456,
      "project_name": "Web Development",
      "date": "2025-01-06",
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "break_duration": 60,
      "total_hours": 7.0,
      "work_done": "Developed API endpoints",
      "status": "approved",
      "created_at": "2025-01-06T09:00:00Z",
      "submitted_at": "2025-01-06T17:00:00Z",
      "approved_at": "2025-01-07T09:00:00Z",
      "approver_first_name": "Jane",
      "approver_last_name": "Manager",
      "rejection_reason": null
    }
  ],
  "count": 1,
  "message": "Timesheets retrieved successfully"
}
```

### 2. Get Specific Timesheet

**GET** `/api/timesheets/:id`

**Response:** Same structure as individual timesheet object above.

### 3. Create New Timesheet

**POST** `/api/timesheets`

**Request Body:**

```json
{
  "project_id": 456,
  "date": "2025-01-06",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "break_duration": 60,
  "work_done": "Description of work completed",
  "status": "draft"
}
```

**Notes:**

- `employee_id` is automatically set from session
- `total_hours` is calculated automatically by the database
- Only one timesheet per employee per date is allowed

### 4. Update Timesheet

**PUT** `/api/timesheets/:id`

**Request Body:** Same as create, but all fields are optional (PATCH-like behavior)

**Access Control:**

- Employees can only update their own timesheets
- Cannot modify approved timesheets (unless admin)
- Admin can update any timesheet

### 5. Submit Timesheet

**POST** `/api/timesheets/:id/submit`

**Description:** Changes status from 'draft' to 'submitted' and sets submitted_at timestamp.

**Access Control:** Only timesheet owner can submit their own drafts.

### 6. Approve Timesheet

**POST** `/api/timesheets/:id/approve`

**Description:** Changes status from 'submitted' to 'approved' and sets approved_at and approved_by.

**Access Control:** Admin only. Only submitted timesheets can be approved.

### 7. Reject Timesheet

**POST** `/api/timesheets/:id/reject`

**Request Body:**

```json
{
  "rejection_reason": "Missing project details"
}
```

**Description:** Changes status to 'rejected' and records rejection reason.

**Access Control:** Admin only. Only submitted timesheets can be rejected.

### 8. Delete Timesheet

**DELETE** `/api/timesheets/:id`

**Description:** Permanently deletes timesheet (only draft status allowed).

**Access Control:**

- Employees can only delete their own draft timesheets
- Admin can delete any draft timesheet

### 9. Employee Summary

**GET** `/api/timesheets/employee/:employee_id/summary`

**Query Parameters:**

- `month` (optional) - Filter by month (1-12)
- `year` (optional) - Filter by year (e.g., 2025)

**Response:**

```json
{
  "success": true,
  "data": {
    "total_timesheets": 15,
    "draft_count": 2,
    "submitted_count": 1,
    "approved_count": 10,
    "rejected_count": 2,
    "total_hours_worked": 120.5,
    "average_daily_hours": 8.03
  },
  "message": "Employee timesheet summary retrieved successfully"
}
```

## Role-Based Access Control

### Employee Role

- Can create their own timesheets
- Can view only their own timesheets
- Can update their own draft/rejected timesheets
- Can submit their own draft timesheets
- Can delete their own draft timesheets
- Can view their own summary

### Admin/Super Admin/Administrator Roles

- Can view all timesheets with filtering
- Can approve/reject submitted timesheets
- Can update any timesheet
- Can view any employee's summary
- Cannot create timesheets for other employees

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development)"
}
```

**Common HTTP Status Codes:**

- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (duplicate timesheet for date)
- `500` - Internal server error

## Frontend Integration

### Using the Timesheet Service

Import the service:

```javascript
import timesheetService from "../services/timesheetService";
```

**Create a timesheet:**

```javascript
const newTimesheet = await timesheetService.createTimesheet({
  project_id: 1,
  date: "2025-01-06",
  start_time: "09:00:00",
  end_time: "17:00:00",
  break_duration: 60,
  work_done: "API development",
});
```

**Get timesheets with filtering:**

```javascript
const timesheets = await timesheetService.getTimesheets({
  status: "submitted",
  date_from: "2025-01-01",
  date_to: "2025-01-31",
});
```

**Submit for approval:**

```javascript
await timesheetService.submitTimesheet(timesheetId);
```

**Approve (admin only):**

```javascript
await timesheetService.approveTimesheet(timesheetId);
```

## Testing

Use the test script to verify API functionality:

```bash
node backend/test-timesheet-api.js
```

**Note:** Update the test configuration with valid employee/project IDs and ensure you have a valid session for testing.

## Database Views

The system includes a helpful view for easy querying:

```sql
CREATE VIEW timesheet_summary AS
SELECT
    t.*,
    e.first_name,
    e.last_name,
    e.email,
    p.project_name,
    approver.first_name AS approver_first_name,
    approver.last_name AS approver_last_name
FROM timesheets t
LEFT JOIN employees e ON t.employee_id = e.employee_id
LEFT JOIN projects p ON t.project_id = p.project_id
LEFT JOIN employees approver ON t.approved_by = approver.employee_id;
```

## Performance Considerations

The following indexes are created for optimal performance:

- Primary key on `id`
- Unique index on `(employee_id, date)`
- Index on `status` for filtering
- Index on `date` for date range queries
- Index on `employee_id` for employee-specific queries
