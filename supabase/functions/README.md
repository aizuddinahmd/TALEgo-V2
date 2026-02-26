# Attendance API - Supabase Edge Functions

REST API endpoints for attendance tracking, accessible from mobile/web applications.

## 📍 Base URL
```
https://[your-project-ref].supabase.co/functions/v1/
```

## 🔐 Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer [your-jwt-token]
```

## 📱 Employee Endpoints

### Clock In
**POST** `/attendance-clock-in`

Clock in with GPS validation.

**Request:**
```json
{
  "latitude": 3.1390,
  "longitude": 101.6869
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Clocked in successfully",
    "log": { ... },
    "status": "on_time"
  }
}
```

---

### Clock Out
**POST** `/attendance-clock-out`

Clock out and calculate hours worked.

**Request:**
```json
{
  "latitude": 3.1390,
  "longitude": 101.6869
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Clocked out successfully",
    "log": { ... },
    "hours": 8.5,
    "status": "on_time"
  }
}
```

---

### My Attendance History
**GET** `/attendance-my-attendance?start_date=2026-02-01&end_date=2026-02-28&limit=50`

Get personal attendance history with optional date filtering.

**Query Parameters:**
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD
- `limit` (optional): Default 50

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [ ... ],
    "total": 25
  }
}
```

---

### Today's Attendance
**GET** `/attendance-today`

Get current day attendance status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "active",
    "log": { ... },
    "shift": { ... },
    "leave": null,
    "isScheduled": true,
    "isOnLeave": false
  }
}
```

---

### Request Correction
**POST** `/attendance-correction`

Submit attendance correction request.

**Request:**
```json
{
  "log_id": "uuid",
  "corrected_checkin": "2026-02-12T09:00:00Z",
  "corrected_checkout": "2026-02-12T18:00:00Z",
  "reason": "Forgot to clock in"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Correction request submitted",
    "correction": { ... }
  }
}
```

---

## 👔 Manager Endpoints

### Team Attendance
**GET** `/attendance-team?start_date=2026-02-12&end_date=2026-02-12`

View team attendance for a date range.

**Query Parameters:**
- `start_date` (optional): Defaults to today
- `end_date` (optional): Defaults to start_date

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [ ... ],
    "total": 50,
    "dateRange": {
      "startDate": "2026-02-12",
      "endDate": "2026-02-12"
    }
  }
}
```

---

### Monthly Summary
**GET** `/attendance-summary?month=2026-02`

Get monthly attendance statistics per staff member.

**Query Parameters:**
- `month` (optional): YYYY-MM format, defaults to current month

**Response:**
```json
{
  "success": true,
  "data": {
    "month": "2026-02",
    "summary": [
      {
        "staff_id": "uuid",
        "staff_name": "John Doe",
        "position": "Manager",
        "total_days": 20,
        "late_days": 2,
        "overtime_days": 5,
        "total_hours": 168.5,
        "average_hours": 8.4
      }
    ],
    "total_staff": 10
  }
}
```

---

### Approve Correction
**PUT** `/attendance-approve-correction`

Approve or reject attendance correction requests.

**Request:**
```json
{
  "correction_id": "uuid",
  "approved": true,
  "remarks": "Approved due to valid reason"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Correction approved",
    "correction_id": "uuid"
  }
}
```

---

### Late Report
**GET** `/attendance-late-report?month=2026-02`

Generate late coming report for the month.

**Query Parameters:**
- `month` (optional): YYYY-MM format

**Response:**
```json
{
  "success": true,
  "data": {
    "month": "2026-02",
    "detailed_logs": [ ... ],
    "summary": [
      {
        "staff_id": "uuid",
        "staff_name": "John Doe",
        "position": "Staff",
        "late_count": 5,
        "latest_late_date": "2026-02-11T09:15:00Z"
      }
    ],
    "total_late_entries": 15
  }
}
```

---

### Daily Absentees
**GET** `/attendance-absentees?date=2026-02-12`

Get list of staff absent for a specific date.

**Query Parameters:**
- `date` (optional): YYYY-MM-DD, defaults to today

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2026-02-12",
    "absentees": [
      {
        "staff_id": "uuid",
        "full_name": "Jane Smith",
        "position": "Developer"
      }
    ],
    "total_absentees": 3,
    "total_staff": 50,
    "total_present": 45,
    "total_on_leave": 2
  }
}
```

---

## 🔄 Desktop Sync Endpoints

### Get Attendance for Sync
**GET** `/sync-attendance?start_date=2026-02-01&end_date=2026-02-28`

Retrieve attendance data for desktop app synchronization.

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [ ... ],
    "total": 500,
    "last_sync": "2026-02-12T14:30:00Z"
  }
}
```

---

### Bulk Import Attendance
**POST** `/sync-attendance-bulk`

Bulk import attendance records from desktop app.

**Request:**
```json
{
  "logs": [
    {
      "staff_id": "uuid",
      "checkin_time": "2026-02-12T09:00:00Z",
      "checkout_time": "2026-02-12T18:00:00Z",
      "total_hours": 9.0,
      "status": "on_time"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Bulk import successful",
    "imported": 50,
    "total_sent": 50
  }
}
```

---

## 🚀 Deployment

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Link to Your Project
```bash
supabase link --project-ref [your-project-ref]
```

### 3. Deploy All Functions
```bash
supabase functions deploy attendance-clock-in
supabase functions deploy attendance-clock-out
supabase functions deploy attendance-my-attendance
supabase functions deploy attendance-today
supabase functions deploy attendance-correction
supabase functions deploy attendance-team
supabase functions deploy attendance-summary
supabase functions deploy attendance-approve-correction
supabase functions deploy attendance-late-report
supabase functions deploy attendance-absentees
supabase functions deploy sync-attendance
supabase functions deploy sync-attendance-bulk
```

### 4. Test Endpoint
```bash
curl -X POST https://[your-project-ref].supabase.co/functions/v1/attendance-today \
  -H "Authorization: Bearer [your-jwt-token]" \
  -H "Content-Type: application/json"
```

---

## 🔧 Configuration

### GPS Settings
Configure office location and radius in the `organizations` table:
```sql
UPDATE organizations SET
  office_latitude = 3.1390,
  office_longitude = 101.6869,
  gps_radius = 100  -- meters
WHERE org_id = 'your-org-id';
```

---

## 🛠️ Development

### Local Testing
```bash
supabase functions serve attendance-clock-in --env-file ./supabase/.env.local
```

### View Logs
```bash
supabase functions logs attendance-clock-in
```

---

## 📝 Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid/missing JWT)
- `403` - Forbidden (GPS validation failed, insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## 🔒 Security Features

✅ **JWT Authentication** - All endpoints require valid JWT  
✅ **CORS Enabled** - Cross-origin requests allowed  
✅ **GPS Validation** - Optional location-based check-in  
✅ **Organization Isolation** - Staff can only access their org data  
✅ **Role-Based Access** - Manager endpoints require appropriate permissions
