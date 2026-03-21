import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportButton from './ExportButton';

describe('ExportButton', () => {
  test('renders Export button', () => {
    render(<ExportButton targetRef={{ current: null }} />);
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  test('shows dropdown menu on click', () => {
    render(<ExportButton targetRef={{ current: null }} />);
    fireEvent.click(screen.getByText('Export'));
    expect(screen.getByText('Download PNG')).toBeInTheDocument();
    expect(screen.getByText('Download SVG')).toBeInTheDocument();
  });

  test('hides dropdown when clicked again', () => {
    render(<ExportButton targetRef={{ current: null }} />);
    fireEvent.click(screen.getByText('Export'));
    expect(screen.getByText('Download PNG')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Export'));
    expect(screen.queryByText('Download PNG')).not.toBeInTheDocument();
  });

  test('handles PNG export from canvas', () => {
    const mockCanvas = document.createElement('canvas');
    mockCanvas.width = 100;
    mockCanvas.height = 100;
    jest.spyOn(mockCanvas, 'toDataURL').mockReturnValue('data:image/png;base64,test');

    const ref = { current: mockCanvas };
    render(<ExportButton targetRef={ref} filename="test" />);

    fireEvent.click(screen.getByText('Export'));
    fireEvent.click(screen.getByText('Download PNG'));

    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
  });
});
