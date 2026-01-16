/**
 * Conflicts Page
 * Display and resolve sync conflicts
 */
import { useState, useEffect } from 'react';
import ConflictResolver from '../components/ConflictResolver';
import { getConflicts } from '../services/api';

function Conflicts() {
    const [conflicts, setConflicts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showResolved, setShowResolved] = useState(false);

    // Fetch conflicts
    const fetchConflicts = async () => {
        try {
            const data = await getConflicts(showResolved);
            setConflicts(data);
            setError('');
        } catch (err) {
            console.error('Error fetching conflicts:', err);
            setError('Failed to load conflicts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConflicts();
    }, [showResolved]);

    // Handle conflict resolved
    const handleResolved = (conflictId) => {
        // Remove from list or refresh
        setConflicts(prev => prev.filter(c => c._id !== conflictId));
    };

    if (loading) {
        return (
            <div className="page">
                <h2>Conflicts</h2>
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <h2>Conflicts</h2>
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={showResolved}
                        onChange={(e) => setShowResolved(e.target.checked)}
                    />
                    Show Resolved
                </label>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {conflicts.length === 0 ? (
                <div className="empty-message">
                    <p>
                        {showResolved
                            ? 'No conflicts found.'
                            : 'No unresolved conflicts. Great job!'}
                    </p>
                </div>
            ) : (
                <div className="conflicts-list">
                    {conflicts.map(conflict => (
                        <div key={conflict._id} className={`conflict-item ${conflict.resolved ? 'resolved' : ''}`}>
                            {conflict.resolved ? (
                                <div className="resolved-conflict">
                                    <div className="conflict-header">
                                        <span className="conflict-type">{conflict.entityType}</span>
                                        <span className="resolved-badge">
                                            Resolved: {conflict.resolvedBy}
                                        </span>
                                    </div>
                                    <p className="resolved-date">
                                        Resolved at: {new Date(conflict.resolvedAt).toLocaleString()}
                                    </p>
                                </div>
                            ) : (
                                <ConflictResolver
                                    conflict={conflict}
                                    onResolved={handleResolved}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Conflicts;
