import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShareButton from './ShareButton';

describe('ShareButton', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  test('renders Share button', () => {
    render(<ShareButton />);
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  test('copies URL to clipboard on click', async () => {
    render(<ShareButton />);
    fireEvent.click(screen.getByText('Share'));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
    });
  });

  test('shows Copied! after click', async () => {
    render(<ShareButton />);
    fireEvent.click(screen.getByText('Share'));

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  test('uses custom getURL function', async () => {
    const getURL = jest.fn(() => 'https://example.com/custom');
    render(<ShareButton getURL={getURL} />);
    fireEvent.click(screen.getByText('Share'));

    await waitFor(() => {
      expect(getURL).toHaveBeenCalled();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/custom');
    });
  });
});
