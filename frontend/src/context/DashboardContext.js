'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const DashboardContext = createContext();
const API_BASE_URL = 'http://localhost:8000';

export function DashboardProvider({ children }) {
    // Global Data State
    const [topology, setTopology] = useState(null);
    const [correlation, setCorrelation] = useState(null);
    const [capacitySummary, setCapacitySummary] = useState(null);
    const [trafficData, setTrafficData] = useState(null);
    const [allLinksTraffic, setAllLinksTraffic] = useState(null);

    // UI State
    const [selectedLink, setSelectedLink] = useState('Link_A');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Fetch traffic data for a single link
    const fetchTrafficData = useCallback(async (linkId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/link-traffic?link_id=${linkId}`);
            setTrafficData(response.data);
        } catch (err) {
            console.error(`Error fetching traffic data for ${linkId}:`, err);
        }
    }, []);

    // Fetch all links traffic for comparison
    const fetchAllLinksTraffic = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/link-traffic`);
            const allData = response.data;

            // Group by link_id
            const grouped = {};
            allData.forEach(item => {
                const link = item.link_id;
                if (!grouped[link]) grouped[link] = [];
                grouped[link].push(item);
            });

            setAllLinksTraffic(grouped);
        } catch (err) {
            console.error('Error fetching all links traffic:', err);
        }
    }, []);

    // Main data fetch function
    const fetchDashboardData = useCallback(async (force = false) => {
        // If already initialized and not forcing refresh, skip
        if (isInitialized && !force) {
            return;
        }

        try {
            setLoading(true);
            const [topologyRes, correlationRes, capacityRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/topology`),
                axios.get(`${API_BASE_URL}/api/correlation`),
                axios.get(`${API_BASE_URL}/api/capacity-summary`)
            ]);

            setTopology(topologyRes.data);
            setCorrelation(correlationRes.data);
            setCapacitySummary(capacityRes.data);

            // Fetch all traffic data
            await fetchAllLinksTraffic();

            // Set initial link if not already set or invalid
            const firstLink = topologyRes.data.links ? Object.keys(topologyRes.data.links)[0] : null;
            if (firstLink && (!selectedLink || !topologyRes.data.links[selectedLink])) {
                setSelectedLink(firstLink);
                await fetchTrafficData(firstLink);
            } else if (selectedLink) {
                // If we already have a selected link, refresh its data
                await fetchTrafficData(selectedLink);
            }

            setIsInitialized(true);
            setLoading(false);
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load system data.');
            setLoading(false);
        }
    }, [isInitialized, fetchAllLinksTraffic, fetchTrafficData, selectedLink]);

    // Initial fetch
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Refresh traffic when selected link changes
    useEffect(() => {
        if (selectedLink && isInitialized) {
            fetchTrafficData(selectedLink);
        }
    }, [selectedLink, isInitialized, fetchTrafficData]);

    const value = {
        topology,
        correlation,
        capacitySummary,
        trafficData,
        allLinksTraffic,
        selectedLink,
        setSelectedLink,
        loading,
        error,
        fetchDashboardData, // Expose for manual refresh button
        isInitialized
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
