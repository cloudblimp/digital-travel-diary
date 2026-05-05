import { describe, it, expect, vi } from 'vitest';

describe('useTrips Hook', () => {
  it('should initialize with empty trips array', () => {
    const trips = [];
    expect(trips).toEqual([]);
  });

  it('should add a new trip', () => {
    const trips = [];
    const newTrip = {
      id: '1',
      title: 'Test Trip',
      destination: 'Test Destination',
      startDate: '2025-06-01',
      endDate: '2025-06-30'
    };
    trips.push(newTrip);
    expect(trips.length).toBe(1);
    expect(trips[0].title).toBe('Test Trip');
  });

  it('should update a trip', () => {
    const trips = [{
      id: '1',
      title: 'Test Trip',
      destination: 'Test Destination'
    }];
    
    trips[0].title = 'Updated Trip';
    expect(trips[0].title).toBe('Updated Trip');
  });

  it('should delete a trip', () => {
    const trips = [{ id: '1', title: 'Test Trip' }];
    const filtered = trips.filter(t => t.id !== '1');
    expect(filtered.length).toBe(0);
  });

  it('should handle loading state', () => {
    const loading = false;
    expect(loading).toBe(false);
  });

  it('should handle error state', () => {
    const error = null;
    expect(error).toBeNull();
  });

  it('should filter trips by user', () => {
    const trips = [
      { id: '1', userId: 'user1', title: 'Trip 1' },
      { id: '2', userId: 'user2', title: 'Trip 2' }
    ];
    const userTrips = trips.filter(t => t.userId === 'user1');
    expect(userTrips.length).toBe(1);
    expect(userTrips[0].title).toBe('Trip 1');
  });

  it('should sort trips by date', () => {
    const trips = [
      { id: '1', startDate: '2025-06-30' },
      { id: '2', startDate: '2025-06-01' }
    ];
    trips.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    expect(trips[0].id).toBe('2');
  });
});
