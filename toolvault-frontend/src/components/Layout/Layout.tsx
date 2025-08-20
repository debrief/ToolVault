import type { ReactNode } from 'react';
import Header from './Header';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">{children}</main>
      <footer className="footer">
        <p>&copy; 2024 ToolVault - Portable Analysis Tools</p>
      </footer>
    </div>
  );
}

export default Layout;