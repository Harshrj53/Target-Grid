import React, { useEffect, useState } from 'react';
import { getConflicts, resolveConflict } from '../services/api';
import { ArrowRight, Check } from 'lucide-react';

const Conflicts = () => {
    const [conflicts, setConflicts] = useState([]);

    const fetchConflicts = async () => {
        try {
            const res = await getConflicts();
            setConflicts(res.data);
        } catch (error) {
            console.error("Error fetching conflicts", error);
        }
    };

    useEffect(() => {
        fetchConflicts();
    }, []);

    const handleResolve = async (conflictId, version) => {
        try {
            await resolveConflict({ conflictId, resolutionVersion: version });
            // Remove from local state after resolution
            setConflicts(prev => prev.filter(c => c._id !== conflictId));
        } catch (error) {
            console.error("Resolution failed", error);
            alert("Failed to resolve conflict");
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Conflict Resolution Center</h2>

            {conflicts.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Check size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
                    <p>All clear! No synchronization conflicts found.</p>
                </div>
            ) : (
                <div className="grid">
                    {conflicts.map(conflict => (
                        <div key={conflict._id} className="glass-card">
                            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                Conflict for: <span style={{ color: 'var(--accent)' }}>{conflict.contactEmail}</span>
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 1fr', gap: '1rem', alignItems: 'center' }}>

                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                                    <h4 style={{ color: 'var(--text-secondary)' }}>Local Version</h4>
                                    <p><strong>Name:</strong> {conflict.localData.firstName} {conflict.localData.lastName}</p>
                                    <p><strong>Phone:</strong> {conflict.localData.phone}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        Modified: {new Date(conflict.localData.lastModified).toLocaleString()}
                                    </p>
                                    <button
                                        className="btn btn-primary"
                                        style={{ marginTop: '1rem', width: '100%' }}
                                        onClick={() => handleResolve(conflict._id, 'local')}
                                    >
                                        Keep Local
                                    </button>
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <ArrowRight color="var(--text-secondary)" />
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                                    <h4 style={{ color: 'var(--warning)' }}>HubSpot Version</h4>
                                    <p><strong>Name:</strong> {conflict.hubspotData.properties.firstname} {conflict.hubspotData.properties.lastname}</p>
                                    <p><strong>Phone:</strong> {conflict.hubspotData.properties.phone}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        Modified: {new Date(conflict.hubspotData.updatedAt || conflict.createdAt).toLocaleString()}
                                    </p>
                                    <button
                                        className="btn"
                                        style={{ marginTop: '1rem', width: '100%', background: 'var(--warning)', color: 'black' }}
                                        onClick={() => handleResolve(conflict._id, 'hubspot')}
                                    >
                                        Keep HubSpot
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Conflicts;
