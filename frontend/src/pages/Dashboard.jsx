/**
 * Dashboard Page
 * Shows sync status and statistics with auto-refresh
 */
import { useState, useEffect } from 'react';
import SyncStatusCard from '../components/SyncStatusCard';
import { getSyncStatus, getContacts, getCompanies, getConflicts } from '../services/api';

function Dashboard() {
    const [status, setStatus] = useState(null);
    const [stats, setStats] = useState({
        totalContacts: 0,
        totalCompanies: 0,
        unresolvedConflicts: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch all data
    const fetchData = async () => {
        try {
            // Fetch sync status
            const syncStatus = await getSyncStatus();
            setStatus(syncStatus);

            // Fetch counts
            const [contacts, companies, conflicts] = await Promise.all([
                getContacts(),
                getCompanies(),
                getConflicts(false) // Unresolved only
            ]);

            setStats({
                totalContacts: contacts.length,
                totalCompanies: companies.length,
                unresolvedConflicts: conflicts.length
            });

            setError('');
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and polling setup
    useEffect(() => {
        fetchData();

        // Poll every 5 seconds for updates
        const interval = setInterval(fetchData, 5000);

        // Cleanup on unmount
        return () => clearInterval(interval);
    }, []);

    // Handle sync complete - refresh data
    const handleSyncComplete = () => {
        fetchData();
    };

    if (loading) {
        return (
            <div className="page">
                <h2>Dashboard</h2>
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="page">
            <h2>Dashboard</h2>

            {error && <div className="error-banner">{error}</div>}

            <div className="dashboard-grid">
                {/* Sync Status Card */}
                <SyncStatusCard
                    status={status}
                    onSyncComplete={handleSyncComplete}
                />

                {/* Quick Stats */}
                <div className="stats-card">
                    <h3>Quick Stats</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-value">{stats.totalContacts}</span>
                            <span className="stat-label">Total Contacts</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{stats.totalCompanies}</span>
                            <span className="stat-label">Total Companies</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value conflict">{stats.unresolvedConflicts}</span>
                            <span className="stat-label">Unresolved Conflicts</span>
                        </div>
                    </div>
                </div>
            </div>

            <p className="refresh-note">
                Dashboard auto-refreshes every 5 seconds
            </p>
        </div>
    );
}

export default Dashboard;
