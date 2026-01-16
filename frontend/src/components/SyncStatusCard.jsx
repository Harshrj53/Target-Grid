/**
 * SyncStatusCard Component
 * Displays sync statistics and allows manual sync trigger
 */
import { useState } from 'react';
import { runSync } from '../services/api';

function SyncStatusCard({ status, onSyncComplete }) {
    const [isSyncing, setIsSyncing] = useState(false);

    // Handle manual sync trigger
    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await runSync();
            if (onSyncComplete) {
                onSyncComplete();
            }
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div className="sync-status-card">
            <h3>Sync Status</h3>

            <div className="status-grid">
                <div className="status-item">
                    <span className="status-label">Last Sync:</span>
                    <span className="status-value">{formatDate(status?.lastSyncTime)}</span>
                </div>

                <div className="status-item">
                    <span className="status-label">Pending Contacts:</span>
                    <span className="status-value pending">
                        {status?.pendingContacts || 0}
                    </span>
                </div>

                <div className="status-item">
                    <span className="status-label">Pending Companies:</span>
                    <span className="status-value pending">
                        {status?.pendingCompanies || 0}
                    </span>
                </div>

                <div className="status-item">
                    <span className="status-label">Failed Contacts:</span>
                    <span className="status-value failed">
                        {status?.failedContacts || 0}
                    </span>
                </div>

                <div className="status-item">
                    <span className="status-label">Failed Companies:</span>
                    <span className="status-value failed">
                        {status?.failedCompanies || 0}
                    </span>
                </div>

                <div className="status-item">
                    <span className="status-label">Unresolved Conflicts:</span>
                    <span className="status-value conflict">
                        {status?.unresolvedConflicts || 0}
                    </span>
                </div>
            </div>

            <button
                className="sync-button"
                onClick={handleSync}
                disabled={isSyncing || status?.isRunning}
            >
                {isSyncing || status?.isRunning ? 'Syncing...' : 'Sync Now'}
            </button>
        </div>
    );
}

export default SyncStatusCard;
