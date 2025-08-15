import { fireEvent } from '@testing-library/react';
import { render, screen } from '../../test-utils/test-utils';
import { AppBar } from './AppBar';

describe('AppBar', () => {
  it('renders ToolVault title', () => {
    const mockOnMenuClick = jest.fn();
    render(<AppBar onMenuClick={mockOnMenuClick} />);
    
    expect(screen.getByText('ToolVault')).toBeInTheDocument();
  });

  it('calls onMenuClick when menu button is clicked', () => {
    const mockOnMenuClick = jest.fn();
    render(<AppBar onMenuClick={mockOnMenuClick} />);
    
    const menuButton = screen.getByRole('button', { name: /open drawer/i });
    fireEvent.click(menuButton);
    
    expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
  });

  it('displays phase information', () => {
    const mockOnMenuClick = jest.fn();
    render(<AppBar onMenuClick={mockOnMenuClick} />);
    
    expect(screen.getByText('Phase 1 - UI Mockup')).toBeInTheDocument();
  });
});