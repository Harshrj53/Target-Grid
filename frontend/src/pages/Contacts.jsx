/**
 * Contacts Page
 * CRUD operations for contacts with table display
 */
import { useState, useEffect } from 'react';
import ContactForm from '../components/ContactForm';
import { getContacts, createContact, updateContact, deleteContact } from '../services/api';

function Contacts() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingContact, setEditingContact] = useState(null);

    // Fetch contacts
    const fetchContacts = async () => {
        try {
            const data = await getContacts();
            setContacts(data);
            setError('');
        } catch (err) {
            console.error('Error fetching contacts:', err);
            setError('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    // Handle create/update
    const handleSubmit = async (formData) => {
        try {
            if (editingContact) {
                await updateContact(editingContact._id, formData);
            } else {
                await createContact(formData);
            }
            setShowForm(false);
            setEditingContact(null);
            fetchContacts();
        } catch (err) {
            console.error('Error saving contact:', err);
            setError(err.response?.data?.error || 'Failed to save contact');
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this contact?')) {
            return;
        }
        try {
            await deleteContact(id);
            fetchContacts();
        } catch (err) {
            console.error('Error deleting contact:', err);
            setError('Failed to delete contact');
        }
    };

    // Handle edit
    const handleEdit = (contact) => {
        setEditingContact(contact);
        setShowForm(true);
    };

    // Get sync status badge
    const getStatusBadge = (status) => {
        const statusClasses = {
            synced: 'badge badge-synced',
            pending: 'badge badge-pending',
            failed: 'badge badge-failed'
        };
        return <span className={statusClasses[status] || 'badge'}>{status}</span>;
    };

    if (loading) {
        return (
            <div className="page">
                <h2>Contacts</h2>
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <h2>Contacts</h2>
                <button
                    className="btn-add"
                    onClick={() => {
                        setEditingContact(null);
                        setShowForm(true);
                    }}
                >
                    + Add Contact
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {contacts.length === 0 ? (
                <p className="empty-message">No contacts found. Add your first contact!</p>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Company</th>
                            <th>Sync Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map(contact => (
                            <tr key={contact._id}>
                                <td>{contact.name}</td>
                                <td>{contact.email}</td>
                                <td>{contact.phone || '-'}</td>
                                <td>{contact.company || '-'}</td>
                                <td>{getStatusBadge(contact.syncStatus)}</td>
                                <td className="actions">
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEdit(contact)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(contact._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showForm && (
                <ContactForm
                    contact={editingContact}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingContact(null);
                    }}
                />
            )}
        </div>
    );
}

export default Contacts;
