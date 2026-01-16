/**
 * ConflictResolver Component
 * UI for resolving individual conflicts
 */
import { useState } from 'react';
import { resolveConflict } from '../services/api';

function ConflictResolver({ conflict, onResolved }) {
    const [isResolving, setIsResolving] = useState(false);
    const [error, setError] = useState('');

    // Handle resolution
    const handleResolve = async (resolution) => {
        setIsResolving(true);
        setError('');

        try {
            await resolveConflict(conflict._id, resolution);
            if (onResolved) {
                onResolved(conflict._id);
            }
        } catch (err) {
            setError('Failed to resolve conflict. Please try again.');
            console.error('Resolution error:', err);
        } finally {
            setIsResolving(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    // Get display fields based on entity type
    const getDisplayFields = (data) => {
        if (conflict.entityType === 'contact') {
            return [
                { label: 'Name', value: data.name },
                { label: 'Email', value: data.email },
                { label: 'Phone', value: data.phone || '-' },
                { label: 'Company', value: data.company || '-' }
            ];
        } else {
            return [
                { label: 'Name', value: data.name },
                { label: 'Domain', value: data.domain || '-' },
                { label: 'Industry', value: data.industry || '-' }
            ];
        }
    };

    const localFields = getDisplayFields(conflict.localData);
    const remoteFields = getDisplayFields(conflict.remoteData);

    return (
        <div className="conflict-resolver">
            <div className="conflict-header">
                <span className="conflict-type">{conflict.entityType}</span>
                <span className="conflict-date">
                    Detected: {formatDate(conflict.detectedAt)}
                </span>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="conflict-comparison">
                {/* Local Version */}
                <div className="conflict-version local">
                    <h4>Local Version</h4>
                    <div className="version-data">
                        {localFields.map((field, index) => (
                            <div key={index} className="data-row">
                                <span className="data-label">{field.label}:</span>
                                <span className="data-value">{field.value}</span>
                            </div>
                        ))}
                        <div className="data-row">
                            <span className="data-label">Modified:</span>
                            <span className="data-value">
                                {formatDate(conflict.localData.lastModified)}
                            </span>
                        </div>
                    </div>
                    <button
                        className="btn-resolve btn-local"
                        onClick={() => handleResolve('local')}
                        disabled={isResolving}
                    >
                        Keep Local
                    </button>
                </div>

                {/* Remote Version */}
                <div className="conflict-version remote">
                    <h4>HubSpot Version</h4>
                    <div className="version-data">
                        {remoteFields.map((field, index) => (
                            <div key={index} className="data-row">
                                <span className="data-label">{field.label}:</span>
                                <span className="data-value">{field.value}</span>
                            </div>
                        ))}
                        <div className="data-row">
                            <span className="data-label">Modified:</span>
                            <span className="data-value">
                                {formatDate(conflict.remoteData.lastModified)}
                            </span>
                        </div>
                    </div>
                    <button
                        className="btn-resolve btn-remote"
                        onClick={() => handleResolve('remote')}
                        disabled={isResolving}
                    >
                        Keep HubSpot
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConflictResolver;
