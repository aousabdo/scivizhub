import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

const renderHeader = (props = {}) =>
  render(
    <MemoryRouter>
      <Header dark={false} setDark={jest.fn()} {...props} />
    </MemoryRouter>
  );

describe('Header', () => {
  test('renders SciVizHub brand', () => {
    renderHeader();
    expect(screen.getByText('SciVizHub')).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    renderHeader();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Compare')).toBeInTheDocument();
  });

  test('Explore dropdown opens on click', () => {
    renderHeader();
    fireEvent.click(screen.getByText('Explore'));
    expect(screen.getByText('All Categories')).toBeInTheDocument();
    expect(screen.getByText('Probability')).toBeInTheDocument();
    expect(screen.getByText('Physics')).toBeInTheDocument();
  });

  test('dark mode toggle calls setDark', () => {
    const setDark = jest.fn();
    renderHeader({ dark: false, setDark });

    const toggleBtn = screen.getByLabelText('Toggle dark mode');
    fireEvent.click(toggleBtn);
    expect(setDark).toHaveBeenCalledWith(true);
  });

  test('mobile menu button toggles navigation', () => {
    renderHeader();
    const menuBtn = screen.getByLabelText('Toggle menu');
    fireEvent.click(menuBtn);

    // Mobile nav should now show
    const homeLinks = screen.getAllByText('Home');
    expect(homeLinks.length).toBeGreaterThanOrEqual(2); // desktop + mobile
  });
});
