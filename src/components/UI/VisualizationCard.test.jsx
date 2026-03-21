import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VisualizationCard from './VisualizationCard';

const mockVisualization = {
  id: 'test-viz',
  title: 'Test Visualization',
  shortDescription: 'A test visualization for unit testing.',
  route: '/visualization/test-viz',
  thumbnail: '/images/test.jpg',
  difficulty: 'beginner',
  estimatedTime: '10-15 minutes',
  category: 'physics',
  tags: ['physics', 'test', 'visualization', 'demo'],
};

const renderCard = (props = {}) =>
  render(
    <MemoryRouter>
      <VisualizationCard visualization={mockVisualization} {...props} />
    </MemoryRouter>
  );

describe('VisualizationCard', () => {
  test('renders nothing when no visualization provided', () => {
    const { container } = render(
      <MemoryRouter>
        <VisualizationCard visualization={null} />
      </MemoryRouter>
    );
    expect(container.innerHTML).toBe('');
  });

  test('renders title and description', () => {
    renderCard();
    expect(screen.getByText('Test Visualization')).toBeInTheDocument();
    expect(screen.getByText('A test visualization for unit testing.')).toBeInTheDocument();
  });

  test('renders difficulty badge', () => {
    renderCard();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  test('renders Explore link with correct route', () => {
    renderCard();
    const link = screen.getByText('Explore');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/visualization/test-viz');
  });

  test('renders thumbnail image', () => {
    renderCard();
    const img = screen.getByAltText('Test Visualization');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/test.jpg');
  });

  test('shows tags in detailed mode', () => {
    renderCard({ detailed: true });
    expect(screen.getByText('physics')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('visualization')).toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  test('shows estimated time in detailed mode', () => {
    renderCard({ detailed: true });
    expect(screen.getByText('10-15 minutes')).toBeInTheDocument();
  });

  test('does not show tags in non-detailed mode', () => {
    renderCard({ detailed: false });
    expect(screen.queryByText('physics')).not.toBeInTheDocument();
  });
});
