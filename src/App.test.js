import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./pages/Visualization/DerivativeExplorer', () => () => <div>Derivative Explorer</div>);

beforeAll(() => {
  window.scrollTo = jest.fn();
});

test('renders SciVizHub homepage title', () => {
  window.history.pushState({}, 'Test page', '/scivizhub/');
  render(<App />);
  const titleElement = screen.getByRole('heading', { name: 'SciVizHub', level: 1 });
  expect(titleElement).toBeInTheDocument();
});
