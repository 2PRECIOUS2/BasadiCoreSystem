import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api`;

class TimesheetService {
    
    // GET /api/timesheets - Get all timesheets with filtering
    async getTimesheets(filters = {}) {
        try {
            const params = new URLSearchParams();
            
            // Add filters to query params
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                    params.append(key, filters[key]);
                }
            });
            
            const url = `${API_URL}/timesheets${params.toString() ? '?' + params.toString() : ''}`;
            console.log('🕐 Fetching timesheets from:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch timesheets');
            }
            
            return data;
        } catch (error) {
            console.error('❌ Error fetching timesheets:', error);
            throw error;
        }
    }
    
    // GET /api/timesheets/:id - Get specific timesheet
    async getTimesheetById(id) {
        try {
            const response = await fetch(`${API_URL}/timesheets/${id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch timesheet');
            }
            
            return data;
        } catch (error) {
            console.error('❌ Error fetching timesheet:', error);
            throw error;
        }
    }
    
    // POST /api/timesheets - Create new timesheet
    async createTimesheet(timesheetData) {
        try {
            console.log('🕐 Creating timesheet with data:', timesheetData);
            
            const response = await fetch(`${API_URL}/timesheets`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(timesheetData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create timesheet');
            }
            
            return data;
        } catch (error) {
            console.error('❌ Error creating timesheet:', error);
            throw error;
        }
    }
    
    // PUT /api/timesheets/:id - Update timesheet
    async updateTimesheet(id, updateData) {
        try {
            console.log('🕐 Updating timesheet:', id, updateData);
            
            const response = await fetch(`${API_URL}/timesheets/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update timesheet');
            }
            
            return data;
        } catch (error) {
            console.error('❌ Error updating timesheet:', error);
            throw error;
        }
    }
    
    // POST /api/timesheets/:id/submit - Submit timesheet for approval
    async submitTimesheet(id) {
        try {
            console.log('🕐 Submitting timesheet:', id);
            
            const response = await fetch(`${API_URL}/timesheets/${id}/submit`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit timesheet');
            }
            
            return data;
        } catch (error) {
            console.error('❌ Error submitting timesheet:', error);
            throw error;
        }
    }
    
    // POST /api/timesheets/:id/approve - Approve timesheet (Admin only)
    async approveTimesheet(id) {
        try {
            console.log('🕐 Approving timesheet:', id);
            
            const response = await fetch(`${API_URL}/timesheets/${id}/approve`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to approve timesheet');
            }
            
            return data;
        } catch (error) {
            console.error('❌ Error approving timesheet:', error);
            throw error;
        }
    }
    
    // POST /api/timesheets/:id/reject - Reject timesheet (Admin only)
    async rejectTimesheet(id, rejectionReason) {
        try {
            console.log('🕐 Rejecting timesheet:', id, rejectionReason);
            
            const response = await fetch(`${API_URL}/timesheets/${id}/reject`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rejection_reason: rejectionReason })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to reject timesheet');
            }
            
            return data;
        } catch (error) {
            console.error('❌ Error rejecting timesheet:', error);
            throw error;
        }
    }
    
    // DELETE /api/timesheets/:id - Delete timesheet (only drafts)
    async deleteTimesheet(id) {
        try {
            console.log('🕐 Deleting timesheet:', id);
            
            const response = await fetch(`${API_URL}/timesheets/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete timesheet');
            }
            
            return data;
        } catch (error) {
            console.error('❌ Error deleting timesheet:', error);
            throw error;
        }
    }
    
    // GET /api/timesheets/employee/:employee_id/summary - Get employee timesheet summary
    async getEmployeeSummary(employeeId, month = null, year = null) {
        try {
            const params = new URLSearchParams();
            if (month) params.append('month', month);
            if (year) params.append('year', year);
            
            const url = `${API_URL}/timesheets/employee/${employeeId}/summary${params.toString() ? '?' + params.toString() : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch employee summary');
            }
            
            return data;
        } catch (error) {
            console.error('❌ Error fetching employee summary:', error);
            throw error;
        }
    }
    
    // Helper method to format time for API
    formatTimeForAPI(time) {
        if (!time) return null;
        // Ensure time is in HH:MM:SS format
        if (time.length === 5) { // HH:MM
            return `${time}:00`;
        }
        return time;
    }
    
    // Helper method to format date for API
    formatDateForAPI(date) {
        if (!date) return null;
        // Ensure date is in YYYY-MM-DD format
        if (date instanceof Date) {
            return date.toISOString().split('T')[0];
        }
        return date;
    }
    
    // Helper method to calculate total hours (client-side calculation for preview)
    calculateTotalHours(startTime, endTime, breakDuration = 0) {
        if (!startTime || !endTime) return 0;
        
        try {
            const start = new Date(`2000-01-01T${startTime}`);
            const end = new Date(`2000-01-01T${endTime}`);
            
            const diffMs = end - start;
            const diffHours = diffMs / (1000 * 60 * 60);
            const breakHours = breakDuration / 60; // Convert minutes to hours
            
            return Math.max(0, diffHours - breakHours);
        } catch (error) {
            console.error('Error calculating total hours:', error);
            return 0;
        }
    }
}

// Create and export a singleton instance
const timesheetService = new TimesheetService();
export default timesheetService;