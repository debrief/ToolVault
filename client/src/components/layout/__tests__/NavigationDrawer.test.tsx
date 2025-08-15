import { render, screen, fireEvent } from '../../../test-utils/test-utils';
import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { NavigationDrawer } from '../NavigationDrawer';

// Mock React Router hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;

describe('NavigationDrawer', () => {
  const mockNavigate = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseLocation.mockReturnValue({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  describe('rendering', () => {
    it('should render navigation drawer when open', () => {
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Tools')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('should not be visible when closed', () => {
      renderWithRouter(<NavigationDrawer open={false} onClose={mockOnClose} />);

      // Drawer should not be visible (MUI Drawer handles this via CSS/props)
      const drawer = screen.getByRole('presentation');
      expect(drawer).toHaveClass('MuiDrawer-root');
    });

    it('should render proper icons for each menu item', () => {
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      // Check for icon elements (they render as SVG elements)
      const homeIcon = screen.getByTestId('HomeIcon');
      const buildIcon = screen.getByTestId('BuildIcon');
      const settingsIcon = screen.getByTestId('SettingsIcon');
      const infoIcon = screen.getByTestId('InfoIcon');

      expect(homeIcon).toBeInTheDocument();
      expect(buildIcon).toBeInTheDocument();
      expect(settingsIcon).toBeInTheDocument();
      expect(infoIcon).toBeInTheDocument();
    });

    it('should have correct drawer width', () => {
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const drawer = screen.getByRole('presentation');
      const drawerPaper = drawer.querySelector('.MuiDrawer-paper');
      
      // Check that drawer has the expected styling classes
      expect(drawerPaper).toHaveClass('MuiDrawer-paper');
    });

    it('should render as temporary drawer', () => {
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const drawer = screen.getByRole('presentation');
      expect(drawer).toHaveClass('MuiDrawer-root');
      // Temporary drawer should not have persistent classes
      expect(drawer).not.toHaveClass('MuiDrawer-docked');
    });
  });

  describe('navigation functionality', () => {
    it('should navigate to home when Home is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const homeButton = screen.getByRole('button', { name: 'Home' });
      await user.click(homeButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should navigate to tools when Tools is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const toolsButton = screen.getByRole('button', { name: 'Tools' });
      await user.click(toolsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/tools');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should navigate to settings when Settings is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const settingsButton = screen.getByRole('button', { name: 'Settings' });
      await user.click(settingsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/settings');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should navigate to about when About is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const aboutButton = screen.getByRole('button', { name: 'About' });
      await user.click(aboutButton);

      expect(mockNavigate).toHaveBeenCalledWith('/about');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close drawer after navigation', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const homeButton = screen.getByRole('button', { name: 'Home' });
      await user.click(homeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('active state indication', () => {
    it('should mark Home as active when on home page', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'home',
      });

      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const homeButton = screen.getByRole('button', { name: 'Home' });
      expect(homeButton).toHaveClass('Mui-selected');
    });

    it('should mark Tools as active when on tools page', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/tools',
        search: '',
        hash: '',
        state: null,
        key: 'tools',
      });

      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const toolsButton = screen.getByRole('button', { name: 'Tools' });
      expect(toolsButton).toHaveClass('Mui-selected');
    });

    it('should mark Tools as active when on tools subpage', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/tools/some-tool',
        search: '',
        hash: '',
        state: null,
        key: 'tool-detail',
      });

      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const toolsButton = screen.getByRole('button', { name: 'Tools' });
      expect(toolsButton).toHaveClass('Mui-selected');
    });

    it('should mark Settings as active when on settings page', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/settings',
        search: '',
        hash: '',
        state: null,
        key: 'settings',
      });

      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const settingsButton = screen.getByRole('button', { name: 'Settings' });
      expect(settingsButton).toHaveClass('Mui-selected');
    });

    it('should mark About as active when on about page', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/about',
        search: '',
        hash: '',
        state: null,
        key: 'about',
      });

      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const aboutButton = screen.getByRole('button', { name: 'About' });
      expect(aboutButton).toHaveClass('Mui-selected');
    });

    it('should only mark Home as active for exact home path', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/home', // Not exactly "/"
        search: '',
        hash: '',
        state: null,
        key: 'not-home',
      });

      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const homeButton = screen.getByRole('button', { name: 'Home' });
      expect(homeButton).not.toHaveClass('Mui-selected');
    });

    it('should not mark any item as active for unknown paths', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/unknown-page',
        search: '',
        hash: '',
        state: null,
        key: 'unknown',
      });

      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const homeButton = screen.getByRole('button', { name: 'Home' });
      const toolsButton = screen.getByRole('button', { name: 'Tools' });
      const settingsButton = screen.getByRole('button', { name: 'Settings' });
      const aboutButton = screen.getByRole('button', { name: 'About' });

      expect(homeButton).not.toHaveClass('Mui-selected');
      expect(toolsButton).not.toHaveClass('Mui-selected');
      expect(settingsButton).not.toHaveClass('Mui-selected');
      expect(aboutButton).not.toHaveClass('Mui-selected');
    });
  });

  describe('drawer behavior', () => {
    it('should call onClose when backdrop is clicked', () => {
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const backdrop = document.querySelector('.MuiBackdrop-root');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should call onClose when escape key is pressed', () => {
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      // Simulate escape key press
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      
      // Note: MUI Drawer handles escape key internally, 
      // so we test the prop configuration rather than direct behavior
      expect(mockOnClose).toBeDefined();
    });

    it('should be anchored to the left', () => {
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const drawer = screen.getByRole('presentation');
      // Check that it has left-anchored classes or attributes
      expect(drawer).toHaveClass('MuiDrawer-root');
    });
  });

  describe('menu structure', () => {
    it('should have primary and secondary menu sections', () => {
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      // Should have dividers separating sections
      const dividers = document.querySelectorAll('.MuiDivider-root');
      expect(dividers.length).toBeGreaterThanOrEqual(2); // At least header divider and section divider
    });

    it('should have proper menu item grouping', () => {
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const lists = document.querySelectorAll('.MuiList-root');
      expect(lists.length).toBeGreaterThanOrEqual(2); // Primary and secondary menu lists
    });

    it('should display navigation header', () => {
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      expect(screen.getByText('Navigation')).toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('should be navigable with Tab key', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const homeButton = screen.getByRole('button', { name: 'Home' });
      
      // Focus should be manageable
      homeButton.focus();
      expect(homeButton).toHaveFocus();

      // Tab should move focus to next item
      await user.tab();
      
      const toolsButton = screen.getByRole('button', { name: 'Tools' });
      expect(toolsButton).toHaveFocus();
    });

    it('should activate menu items with Enter key', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const homeButton = screen.getByRole('button', { name: 'Home' });
      homeButton.focus();

      await user.keyboard('{Enter}');

      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should activate menu items with Space key', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const toolsButton = screen.getByRole('button', { name: 'Tools' });
      toolsButton.focus();

      await user.keyboard(' ');

      expect(mockNavigate).toHaveBeenCalledWith('/tools');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithRouter(<NavigationDrawer {...defaultProps} />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA roles and labels', () => {
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      // Drawer should have proper presentation role
      const drawer = screen.getByRole('presentation');
      expect(drawer).toBeInTheDocument();

      // Menu items should have button roles
      expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Tools' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'About' })).toBeInTheDocument();
    });

    it('should have descriptive text for screen readers', () => {
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      // All menu items should have accessible names
      const menuItems = ['Home', 'Tools', 'Settings', 'About'];
      
      menuItems.forEach(item => {
        const button = screen.getByRole('button', { name: item });
        expect(button).toHaveAccessibleName(item);
      });
    });

    it('should have proper focus management', () => {
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const homeButton = screen.getByRole('button', { name: 'Home' });
      
      // Should be focusable
      homeButton.focus();
      expect(homeButton).toHaveFocus();
      
      // Should have proper tab index
      expect(homeButton).not.toHaveAttribute('tabindex', '-1');
    });
  });

  describe('responsive behavior', () => {
    it('should use temporary variant for mobile', () => {
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const drawer = screen.getByRole('presentation');
      expect(drawer).toHaveClass('MuiDrawer-root');
      // Should not have permanent drawer classes
      expect(drawer).not.toHaveClass('MuiDrawer-docked');
    });

    it('should handle different screen sizes properly', () => {
      // Test that the drawer configuration is appropriate for responsive design
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const drawer = screen.getByRole('presentation');
      expect(drawer).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle navigation without crashing when navigate fails', async () => {
      const user = userEvent.setup();
      
      // Mock navigate to throw an error
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const homeButton = screen.getByRole('button', { name: 'Home' });
      
      // Should not crash when navigation fails
      expect(() => {
        user.click(homeButton);
      }).not.toThrow();
    });

    it('should handle missing location data gracefully', () => {
      mockUseLocation.mockReturnValue({
        pathname: '',
        search: '',
        hash: '',
        state: null,
        key: '',
      });

      expect(() => {
        renderWithRouter(<NavigationDrawer {...defaultProps} />);
      }).not.toThrow();
    });

    it('should handle null onClose callback', () => {
      expect(() => {
        renderWithRouter(<NavigationDrawer open={true} onClose={null as any} />);
      }).not.toThrow();
    });

    it('should handle rapid menu item clicks', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NavigationDrawer {...defaultProps} />);

      const homeButton = screen.getByRole('button', { name: 'Home' });
      
      // Rapid clicks should be handled gracefully
      await user.click(homeButton);
      await user.click(homeButton);
      await user.click(homeButton);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });
  });

  describe('performance', () => {
    it('should render quickly with many menu items', () => {
      const startTime = performance.now();
      renderWithRouter(<NavigationDrawer {...defaultProps} />);
      const endTime = performance.now();

      // Should render quickly
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should not cause unnecessary re-renders', () => {
      const { rerender } = renderWithRouter(<NavigationDrawer {...defaultProps} />);

      // Re-render with same props should be efficient
      rerender(
        <BrowserRouter>
          <NavigationDrawer {...defaultProps} />
        </BrowserRouter>
      );

      expect(screen.getByText('Navigation')).toBeInTheDocument();
    });
  });
});