import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const INACTIVITY_LIMIT = 20 * 60 * 1000; // 20 minutes in milliseconds
const CHECK_INTERVAL = 2 * 60 * 1000; // Check every 2 minutes

const SessionWatcher = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const timeoutRef = useRef(null);
    const intervalRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    const handleLogout = useCallback(() => {
        console.log('🚪 Auto-logout triggered after 20 minutes of inactivity');
        
        // Clear all timers
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        // Clear local storage
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('sessionId');
        
        // Update state
        setIsAuthenticated(false);
        
        // Navigate to login
        navigate('/auth/login', { 
            state: { message: 'Session expired due to 20 minutes of inactivity' } 
        });
    }, [navigate, setIsAuthenticated]);

    const resetTimer = useCallback(() => {
        const now = Date.now();
        lastActivityRef.current = now;
        
        // Clear existing timer
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        // Set new logout timer (20 minutes)
        timeoutRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT);
    }, [handleLogout]);

    const checkBackendSession = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/check-session`, {
                method: 'GET',
                credentials: 'include'
            });
            
            if (!response.ok) {
                console.log('🔒 Backend session check failed:', response.status);
                handleLogout();
                return;
            }
            
            const data = await response.json();
            if (!data.active) {
                console.log('🔒 Backend session inactive');
                handleLogout();
            }
        } catch (error) {
            console.error('❌ Error checking backend session:', error);
        }
    }, [handleLogout]);

    useEffect(() => {
        console.log('🔄 SessionWatcher initialized with 20-minute timeout');
        
        // Events that count as user activity
        const activityEvents = [
            'mousedown', 'mousemove', 'keypress', 'scroll', 
            'touchstart', 'click', 'focus'
        ];
        
        // Throttle activity detection
        let throttleTimeout = null;
        const throttledResetTimer = () => {
            if (throttleTimeout) return;
            
            throttleTimeout = setTimeout(() => {
                resetTimer();
                throttleTimeout = null;
            }, 1000);
        };
        
        // Add event listeners
        activityEvents.forEach((event) => {
            document.addEventListener(event, throttledResetTimer, { 
                passive: true,
                capture: true 
            });
        });

        // Start initial timer
        resetTimer();
        
        // Start periodic backend session checking
        intervalRef.current = setInterval(checkBackendSession, CHECK_INTERVAL);

        return () => {
            console.log('🧹 SessionWatcher cleanup');
            
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (throttleTimeout) clearTimeout(throttleTimeout);
            
            activityEvents.forEach((event) => {
                document.removeEventListener(event, throttledResetTimer);
            });
        };
    }, [resetTimer, checkBackendSession]);

    return null;
};

export default SessionWatcher;