import {
  getAllVisualizations,
  getFeaturedVisualizations,
  getVisualizationsByCategory,
  getVisualizationById,
  getRelatedVisualizations,
  searchVisualizations,
  CATEGORIES,
  DIFFICULTY,
} from './visualizations';

describe('visualizations data', () => {
  describe('constants', () => {
    test('CATEGORIES has expected keys', () => {
      expect(CATEGORIES.PROBABILITY).toBe('probability');
      expect(CATEGORIES.PHYSICS).toBe('physics');
      expect(CATEGORIES.COMPUTER_SCIENCE).toBe('computer-science');
      expect(Object.keys(CATEGORIES).length).toBeGreaterThanOrEqual(10);
    });

    test('DIFFICULTY has three levels', () => {
      expect(DIFFICULTY.BEGINNER).toBe('beginner');
      expect(DIFFICULTY.INTERMEDIATE).toBe('intermediate');
      expect(DIFFICULTY.ADVANCED).toBe('advanced');
    });
  });

  describe('getAllVisualizations', () => {
    test('returns an array of visualizations', () => {
      const all = getAllVisualizations();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBeGreaterThan(0);
    });

    test('each visualization has required fields', () => {
      const all = getAllVisualizations();
      all.forEach((v) => {
        expect(v).toHaveProperty('id');
        expect(v).toHaveProperty('title');
        expect(v).toHaveProperty('shortDescription');
        expect(v).toHaveProperty('route');
        expect(v).toHaveProperty('category');
        expect(v).toHaveProperty('difficulty');
        expect(v).toHaveProperty('tags');
        expect(Array.isArray(v.tags)).toBe(true);
      });
    });

    test('all IDs are unique', () => {
      const all = getAllVisualizations();
      const ids = all.map((v) => v.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    test('all routes are unique', () => {
      const all = getAllVisualizations();
      const routes = all.map((v) => v.route);
      expect(new Set(routes).size).toBe(routes.length);
    });

    test('all categories are valid', () => {
      const validCategories = Object.values(CATEGORIES);
      const all = getAllVisualizations();
      all.forEach((v) => {
        expect(validCategories).toContain(v.category);
      });
    });

    test('all difficulties are valid', () => {
      const validDifficulties = Object.values(DIFFICULTY);
      const all = getAllVisualizations();
      all.forEach((v) => {
        expect(validDifficulties).toContain(v.difficulty);
      });
    });
  });

  describe('getFeaturedVisualizations', () => {
    test('returns requested number of visualizations', () => {
      expect(getFeaturedVisualizations(3)).toHaveLength(3);
      expect(getFeaturedVisualizations(5)).toHaveLength(5);
      expect(getFeaturedVisualizations(1)).toHaveLength(1);
    });

    test('returns valid visualization objects', () => {
      const featured = getFeaturedVisualizations(3);
      featured.forEach((v) => {
        expect(v).toHaveProperty('id');
        expect(v).toHaveProperty('title');
      });
    });
  });

  describe('getVisualizationsByCategory', () => {
    test('returns only visualizations in requested category', () => {
      const physics = getVisualizationsByCategory(CATEGORIES.PHYSICS);
      physics.forEach((v) => {
        expect(v.category).toBe(CATEGORIES.PHYSICS);
      });
    });

    test('returns empty array for unknown category', () => {
      expect(getVisualizationsByCategory('nonexistent')).toEqual([]);
    });
  });

  describe('getVisualizationById', () => {
    test('finds a visualization by ID', () => {
      const v = getVisualizationById('bayes-theorem');
      expect(v).not.toBeNull();
      expect(v.title).toContain('Bayes');
    });

    test('returns null for unknown ID', () => {
      expect(getVisualizationById('does-not-exist')).toBeNull();
    });
  });

  describe('getRelatedVisualizations', () => {
    test('returns related visualizations for valid ID', () => {
      const all = getAllVisualizations();
      // Find one that has relatedVisualizations
      const withRelated = all.find((v) => v.relatedVisualizations.length > 0);
      if (withRelated) {
        const related = getRelatedVisualizations(withRelated.id);
        expect(related.length).toBeGreaterThan(0);
        related.forEach((r) => {
          expect(r).toHaveProperty('id');
        });
      }
    });

    test('returns empty array for unknown ID', () => {
      expect(getRelatedVisualizations('does-not-exist')).toEqual([]);
    });
  });

  describe('searchVisualizations', () => {
    test('finds visualizations by title', () => {
      const results = searchVisualizations('Bayes');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain('Bayes');
    });

    test('finds visualizations by tag', () => {
      const results = searchVisualizations('sorting');
      expect(results.length).toBeGreaterThan(0);
    });

    test('is case-insensitive', () => {
      const lower = searchVisualizations('bayes');
      const upper = searchVisualizations('BAYES');
      expect(lower.length).toBe(upper.length);
    });

    test('returns empty array for empty search', () => {
      expect(searchVisualizations('')).toEqual([]);
    });

    test('returns empty array for no matches', () => {
      expect(searchVisualizations('xyznonexistent123')).toEqual([]);
    });
  });
});
