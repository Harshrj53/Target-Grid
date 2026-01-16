/**
 * Navbar Component
 * Navigation bar for the application
 */
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
    const location = useLocation();

    // Helper to check if link is active
    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h1>HubSpot Sync</h1>
            </div>
            <ul className="navbar-links">
                <li>
                    <Link
                        to="/"
                        className={isActive('/') ? 'active' : ''}
                    >
                        Dashboard
                    </Link>
                </li>
                <li>
                    <Link
                        to="/contacts"
                        className={isActive('/contacts') ? 'active' : ''}
                    >
                        Contacts
                    </Link>
                </li>
                <li>
                    <Link
                        to="/companies"
                        className={isActive('/companies') ? 'active' : ''}
                    >
                        Companies
                    </Link>
                </li>
                <li>
                    <Link
                        to="/conflicts"
                        className={isActive('/conflicts') ? 'active' : ''}
                    >
                        Conflicts
                    </Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
