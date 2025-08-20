import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="logo">
          ToolVault
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/browse" className="nav-link">
            Browse Tools
          </Link>
          <Link to="/test-tools" className="nav-link">
            Test Tools
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;