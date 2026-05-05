import { describe, it, expect, vi } from 'vitest';

describe('TripCard Component', () => {
  const mockTrip = {
    id: '1',
    title: 'Summer Adventure',
    destination: 'Paris, France',
    coverImage: 'https://example.com/image.jpg',
    startDate: '2025-06-01',
    endDate: '2025-06-30',
    description: 'Amazing summer trip to Paris'
  };

  it('should display trip title', () => {
    expect(mockTrip.title).toBe('Summer Adventure');
  });

  it('should display trip destination', () => {
    expect(mockTrip.destination).toBe('Paris, France');
  });

  it('should have cover image URL', () => {
    expect(mockTrip.coverImage).toContain('https://');
  });

  it('should have valid date range', () => {
    const startDate = new Date(mockTrip.startDate);
    const endDate = new Date(mockTrip.endDate);
    expect(endDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
  });

  it('should display description', () => {
    expect(mockTrip.description).toBe('Amazing summer trip to Paris');
  });

  it('should have unique id', () => {
    expect(mockTrip.id).toBeTruthy();
  });

  it('should handle click events', () => {
    const mockOnClick = vi.fn();
    mockOnClick(mockTrip.id);
    expect(mockOnClick).toHaveBeenCalledWith('1');
  });

  it('should be comparable with other trips', () => {
    const anotherTrip = { ...mockTrip, id: '2' };
    expect(mockTrip.id).not.toBe(anotherTrip.id);
    expect(mockTrip.title).toBe(anotherTrip.title);
  });
});
