import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import AppointmentTypeSelection from '@/app/(authenticated)/scheduling/page';
import { useRouter } from 'next/navigation';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the SidebarContext
jest.mock('@/app/components/SidebarContext', () => {
  return {
    useSidebar: () => ({
      isExpanded: true,
      toggleSidebar: jest.fn(),
    }),
  };
});

// Sample appointment types data
const mockAppointmentTypes = [
  {
    id: '1',
    title: 'One-on-One Coaching',
    description: 'Personal coaching session',
    icon: 'Person',
    accessType: 'private',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Group Workshop',
    description: 'Group learning session',
    icon: 'Groups',
    accessType: 'public',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'Legal Consultation',
    description: 'Legal advice session',
    icon: 'Gavel',
    accessType: 'private',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
];

describe('AppointmentTypeSelection', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // Mock fetch for appointment types
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/appointment-types') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAppointmentTypes),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch mock for URL: ${url}`));
    });
  });

  it('displays appointment types after loading', async () => {
    await act(async () => {
      render(<AppointmentTypeSelection />);
    });
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('One-on-One Coaching')).toBeInTheDocument();
      expect(screen.getByText('Group Workshop')).toBeInTheDocument();
      expect(screen.getByText('Legal Consultation')).toBeInTheDocument();
    });
    
    // Check if descriptions are rendered
    expect(screen.getByText('Personal coaching session')).toBeInTheDocument();
    expect(screen.getByText('Group learning session')).toBeInTheDocument();
    expect(screen.getByText('Legal advice session')).toBeInTheDocument();
  });

  it('displays public and private sections correctly', async () => {
    await act(async () => {
      render(<AppointmentTypeSelection />);
    });
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Public Sessions')).toBeInTheDocument();
      expect(screen.getByText('Private Consultations')).toBeInTheDocument();
    });
  });

  it('navigates to select-date page when an appointment type is clicked', async () => {
    await act(async () => {
      render(<AppointmentTypeSelection />);
    });
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('One-on-One Coaching')).toBeInTheDocument();
    });
    
    // Click on the first appointment type card
    const appointmentCard = screen.getByText('One-on-One Coaching').closest('div');
    expect(appointmentCard).not.toBeNull();
    
    await act(async () => {
      appointmentCard!.click();
    });
    
    // Verify router.push was called with the correct path
    expect(mockPush).toHaveBeenCalledWith('/scheduling/select-date?type=1');
  });

  it('displays error message when API call fails', async () => {
    // Mock a failed API call
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: false,
        status: 500,
      });
    });
    
    await act(async () => {
      render(<AppointmentTypeSelection />);
    });
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to load appointment types. Please try again later.')).toBeInTheDocument();
    });
  });
}); 