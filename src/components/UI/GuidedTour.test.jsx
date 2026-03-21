import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GuidedTour from './GuidedTour';

const steps = [
  { title: 'Step 1', content: 'First step content', placement: 'bottom' },
  { title: 'Step 2', content: 'Second step content', placement: 'bottom' },
  { title: 'Step 3', content: 'Third step content', placement: 'bottom' },
];

describe('GuidedTour', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('does not render when no steps', () => {
    const { container } = render(<GuidedTour steps={[]} />);
    expect(container.innerHTML).toBe('');
  });

  test('does not render if already seen', () => {
    localStorage.setItem('test-tour', 'true');
    const { container } = render(<GuidedTour steps={steps} storageKey="test-tour" />);
    jest.advanceTimersByTime(1000);
    expect(container.querySelector('[class*="z-"]')).toBeNull();
  });

  test('renders after delay for first-time visitors', async () => {
    render(<GuidedTour steps={steps} storageKey="test-tour-new" />);

    // Not visible immediately
    expect(screen.queryByText('Step 1')).not.toBeInTheDocument();

    // Visible after delay
    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('First step content')).toBeInTheDocument();
    });
  });

  test('navigates between steps', async () => {
    render(<GuidedTour steps={steps} storageKey="test-tour-nav" />);
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText('Step 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Step 2')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Step 3')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  test('shows step counter', async () => {
    render(<GuidedTour steps={steps} storageKey="test-tour-counter" />);
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    });
  });

  test('skip tour saves to localStorage', async () => {
    render(<GuidedTour steps={steps} storageKey="test-tour-skip" />);
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText('Skip tour')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Skip tour'));
    expect(localStorage.getItem('test-tour-skip')).toBe('true');
  });

  test('finish button on last step saves to localStorage', async () => {
    render(<GuidedTour steps={steps} storageKey="test-tour-finish" />);
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Finish')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Finish'));
    expect(localStorage.getItem('test-tour-finish')).toBe('true');
  });

  test('calls onComplete callback when tour finishes', async () => {
    const onComplete = jest.fn();
    render(<GuidedTour steps={steps} storageKey="test-tour-cb" onComplete={onComplete} />);
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText('Skip tour')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Skip tour'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
