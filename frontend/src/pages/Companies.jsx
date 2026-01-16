/**
 * Companies Page
 * CRUD operations for companies with table display
 */
import { useState, useEffect } from 'react';
import CompanyForm from '../components/CompanyForm';
import { getCompanies, createCompany, updateCompany } from '../services/api';

function Companies() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);

    // Fetch companies
    const fetchCompanies = async () => {
        try {
            const data = await getCompanies();
            setCompanies(data);
            setError('');
        } catch (err) {
            console.error('Error fetching companies:', err);
            setError('Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    // Handle create/update
    const handleSubmit = async (formData) => {
        try {
            if (editingCompany) {
                await updateCompany(editingCompany._id, formData);
            } else {
                await createCompany(formData);
            }
            setShowForm(false);
            setEditingCompany(null);
            fetchCompanies();
        } catch (err) {
            console.error('Error saving company:', err);
            setError(err.response?.data?.error || 'Failed to save company');
        }
    };

    // Handle edit
    const handleEdit = (company) => {
        setEditingCompany(company);
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
                <h2>Companies</h2>
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <h2>Companies</h2>
                <button
                    className="btn-add"
                    onClick={() => {
                        setEditingCompany(null);
                        setShowForm(true);
                    }}
                >
                    + Add Company
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {companies.length === 0 ? (
                <p className="empty-message">No companies found. Add your first company!</p>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Domain</th>
                            <th>Industry</th>
                            <th>Sync Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map(company => (
                            <tr key={company._id}>
                                <td>{company.name}</td>
                                <td>{company.domain || '-'}</td>
                                <td>{company.industry || '-'}</td>
                                <td>{getStatusBadge(company.syncStatus)}</td>
                                <td className="actions">
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEdit(company)}
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showForm && (
                <CompanyForm
                    company={editingCompany}
                    onSubmit={handleSubmit}
                    error={error}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingCompany(null);
                        setError('');
                    }}
                />
            )}
        </div>
    );
}

export default Companies;
