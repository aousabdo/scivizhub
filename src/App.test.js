import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./pages/Visualization/DerivativeExplorer', () => () => <div>Derivative Explorer</div>);

beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});

test('renders SciVizHub homepage title', () => {
  window.history.pushState({}, 'Test page', '/scivizhub/');
  render(<App />);
  const titleElement = screen.getByRole('heading', { name: 'SciVizHub', level: 1 });
  expect(titleElement).toBeInTheDocument();
});
