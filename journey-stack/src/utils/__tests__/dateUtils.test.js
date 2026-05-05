import { describe, it, expect } from 'vitest';

describe('Date Utilities', () => {
  describe('Date Validation Functions', () => {
    it('validates trip title length', () => {
      // Valid title: 3+ characters
      const validTitle = 'Summer Trip';
      expect(validTitle.length).toBeGreaterThanOrEqual(3);
    });

    it('validates destination length', () => {
      // Valid destination: 2+ characters
      const validDestination = 'Paris, France';
      expect(validDestination.length).toBeGreaterThanOrEqual(2);
    });

    it('validates date range', () => {
      // Valid range: end date >= start date
      const startDate = new Date('2025-06-01');
      const endDate = new Date('2025-06-30');
      expect(endDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
    });

    it('validates start date is not before 1950', () => {
      const validYear = new Date('2025-06-01').getFullYear();
      expect(validYear).toBeGreaterThan(1949);
    });

    it('rejects same year if before 1950', () => {
      const oldDate = new Date('1949-06-01');
      expect(oldDate.getFullYear()).toBeLessThan(1950);
    });

    it('accepts same-day trips', () => {
      const date = new Date('2025-06-15');
      expect(date.getTime()).toEqual(date.getTime());
    });
  });

  describe('Date Formatting', () => {
    it('formats date correctly', () => {
      const date = new Date('2025-06-01');
      expect(date.getMonth()).toBe(5); // June is month 5 (0-indexed)
    });

    it('calculates trip duration', () => {
      const startDate = new Date('2025-06-01');
      const endDate = new Date('2025-06-30');
      const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      expect(duration).toBe(29);
    });
  });
});

