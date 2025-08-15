import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient, apiRequest } from '../lib/queryClient';
import Register from '../pages/register';
import { useToast } from '../hooks/use-toast';
import { userEvent } from '@testing-library/user-event';

vi.mock('../hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
    dismiss: vi.fn(),
    toasts: []
  })),
}));

vi.mock('../lib/queryClient', async () => {
  const actual = await vi.importActual('../lib/queryClient');
  return {
    ...actual,
    apiRequest: vi.fn(),
  };
});

const mockedApiRequest = vi.mocked(apiRequest);
const mockedUseToast = vi.mocked(useToast);

const renderWithClient = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('Registration Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location assignment
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
  });

  it('should render the form', () => {
    renderWithClient(<Register />);
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByTestId('input-invitation-code')).toBeInTheDocument();
    expect(screen.getByTestId('input-email')).toBeInTheDocument();
    expect(screen.getByTestId('input-password')).toBeInTheDocument();
    expect(screen.getByTestId('button-register')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    renderWithClient(<Register />);

    await user.click(screen.getByTestId('button-register'));

    await waitFor(() => {
      expect(screen.getByText('Invitation code is required')).toBeInTheDocument();
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    renderWithClient(<Register />);

    // Fill in all fields
    await user.type(screen.getByTestId('input-invitation-code'), 'VALIDCODE');
    const emailInput = screen.getByTestId('input-email');
    await user.type(emailInput, 'invalid-email');
    await user.type(screen.getByTestId('input-password'), 'password123');
    fireEvent.blur(emailInput);
    
    // Submit the form
    await user.click(screen.getByTestId('button-register'));

    // We need to wait for form validation to be triggered and error to appear
    expect(await screen.findByText(/invalid email address/i)).toBeInTheDocument();
    expect(screen.getByTestId('input-email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('should validate password length', async () => {
    const user = userEvent.setup();
    renderWithClient(<Register />);

    await user.type(screen.getByTestId('input-password'), '123');
    await user.click(screen.getByTestId('button-register'));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  it('should successfully register a user', async () => {
    const user = userEvent.setup();
    const mockToast = vi.fn();
    vi.mocked(useToast).mockReturnValue({
      toast: mockToast,
      dismiss: vi.fn(),
      toasts: []
    });
    vi.mocked(apiRequest).mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

    renderWithClient(<Register />);

    await user.type(screen.getByTestId('input-invitation-code'), 'VALIDCODE');
    await user.type(screen.getByTestId('input-email'), 'test@example.com');
    await user.type(screen.getByTestId('input-password'), 'password123');
    await user.click(screen.getByTestId('button-register'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Account created successfully! You can now sign in.',
      });
      expect(window.location.href).toBe('/');
    });
  });

  it('should show an error message on failed registration', async () => {
    const user = userEvent.setup();
    const mockToast = vi.fn();
    vi.mocked(useToast).mockReturnValue({
      toast: mockToast,
      dismiss: vi.fn(),
      toasts: []
    });
    const errorMessage = 'Invalid invitation code';
    vi.mocked(apiRequest).mockRejectedValueOnce(new Error(errorMessage));

    renderWithClient(<Register />);

    await user.type(screen.getByTestId('input-invitation-code'), 'INVALIDCODE');
    await user.type(screen.getByTestId('input-email'), 'test@example.com');
    await user.type(screen.getByTestId('input-password'), 'password123');
    await user.click(screen.getByTestId('button-register'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    });
  });
});
