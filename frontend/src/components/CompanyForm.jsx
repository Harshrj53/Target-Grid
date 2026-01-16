/**
 * CompanyForm Component
 * Form for creating and editing companies
 */
import { useState, useEffect } from 'react';

function CompanyForm({ company, onSubmit, onCancel, error: apiError }) {
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        industry: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (company) {
            setFormData({
                name: company.name || '',
                domain: company.domain || '',
                industry: company.industry || ''
            });
        }
    }, [company]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate form
    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Company name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validate()) {
            setIsSubmitting(true);
            try {
                await onSubmit(formData);
            } catch (err) {
                // Error is handled by parent and passed back via prop
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="form-overlay">
            <div className="form-container">
                <h3>{company ? 'Edit Company' : 'Add Company'}</h3>

                {apiError && <div className="error-message">{apiError}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Company Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter company name"
                            disabled={isSubmitting}
                        />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="domain">Domain</label>
                        <input
                            type="text"
                            id="domain"
                            name="domain"
                            value={formData.domain}
                            onChange={handleChange}
                            placeholder="e.g. example.com"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="industry">Industry</label>
                        <input
                            type="text"
                            id="industry"
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            placeholder="e.g. Technology"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : (company ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CompanyForm;
