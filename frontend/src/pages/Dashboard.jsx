import React, { useEffect, useState } from 'react';
import { getStats, getContacts, createContact } from '../services/api';
import { RefreshCw, Users, AlertCircle, Plus } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({ totalContacts: 0, pendingConflicts: 0, failedSyncs: 0 });
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newContact, setNewContact] = useState({ firstName: '', lastName: '', email: '', phone: '' });

    // Poll for updates every 5 seconds
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const statsRes = await getStats();
            const contactsRes = await getContacts();
            setStats(statsRes.data);
            setContacts(contactsRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createContact(newContact);
            setNewContact({ firstName: '', lastName: '', email: '', phone: '' });
            fetchData(); // Refresh list immediately
        } catch (error) {
            alert('Error creating contact: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div>
            <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
                <div className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                        <Users size={20} /> Total Contacts
                    </div>
                    <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>{stats.totalContacts}</h2>
                </div>
                <div className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--warning)' }}>
                        <AlertCircle size={20} /> Pending Conflicts
                    </div>
                    <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>{stats.pendingConflicts}</h2>
                </div>
                <div className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger)' }}>
                        <RefreshCw size={20} /> Failed Syncs
                    </div>
                    <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>{stats.failedSyncs}</h2>
                </div>
            </div>

            <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Plus size={20} /> Add New Contact
                </h3>
                <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '1rem' }}>
                    <input
                        placeholder="First Name" required
                        value={newContact.firstName} onChange={e => setNewContact({ ...newContact, firstName: e.target.value })}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', color: 'white', borderRadius: '6px' }}
                    />
                    <input
                        placeholder="Last Name" required
                        value={newContact.lastName} onChange={e => setNewContact({ ...newContact, lastName: e.target.value })}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', color: 'white', borderRadius: '6px' }}
                    />
                    <input
                        placeholder="Email" required type="email"
                        value={newContact.email} onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', color: 'white', borderRadius: '6px' }}
                    />
                    <input
                        placeholder="Phone"
                        value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', color: 'white', borderRadius: '6px' }}
                    />
                    <button type="submit" className="btn btn-primary">Add</button>
                </form>
            </div>

            <div className="glass-card">
                <h3 style={{ marginBottom: '1rem' }}>Live Contact Sync Status</h3>
                {loading ? <p>Loading contacts...</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>HubSpot ID</th>
                                <th>Last Modified</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map(contact => (
                                <tr key={contact._id}>
                                    <td>{contact.firstName} {contact.lastName}</td>
                                    <td>{contact.email}</td>
                                    <td>{contact.hubspotId || '-'}</td>
                                    <td>{new Date(contact.lastModified).toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${contact.hubspotId ? 'status-synced' : 'status-error'}`}>
                                            {contact.hubspotId ? 'Synced' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
