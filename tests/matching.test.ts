import { expect, test, vi, describe, beforeEach } from 'vitest';
import { db } from '@/db';
import { submitSwipe } from '../lib/actions/matching';

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({ userId: 'user_1' })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/db', () => {
  const insertValuesMock = vi.fn().mockResolvedValue([]);
  return {
    db: {
      insert: vi.fn(() => ({ values: insertValuesMock })),
      query: {
        swipes: {
          findFirst: vi.fn(),
          findMany: vi.fn(),
        },
        matches: {
          findFirst: vi.fn(),
          findMany: vi.fn(),
        },
        users: {
          findMany: vi.fn(),
        },
      },
    },
  };
});

describe('Matching Logic', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('records a swipe and returns no match if swipe is dislike', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query.swipes.findFirst as any).mockResolvedValueOnce(null); // No existing swipe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query.swipes.findFirst as any).mockResolvedValueOnce(null); // No reciprocal like
    
    const result = await submitSwipe('user_2', false);
    
    expect(db.insert).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.match).toBe(false);
  });

  test('records a swipe and returns no match if reciprocal like not found', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query.swipes.findFirst as any).mockResolvedValueOnce(null); // No existing swipe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query.swipes.findFirst as any).mockResolvedValueOnce(null); // No reciprocal like
    
    const result = await submitSwipe('user_2', true);
    
    expect(db.insert).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.match).toBe(false);
  });

  test('creates a match when reciprocal like is found', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query.swipes.findFirst as any).mockResolvedValueOnce(null); // No existing swipe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query.swipes.findFirst as any).mockResolvedValueOnce({ id: 'swipe_id', isLike: true }); // Reciprocal like found
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query.matches.findFirst as any).mockResolvedValueOnce(null); // No existing match
    
    const result = await submitSwipe('user_2', true);
    
    expect(db.insert).toHaveBeenCalledTimes(2); // One for swipe, one for match
    expect(result.success).toBe(true);
    expect(result.match).toBe(true);
  });

  test('returns duplicate if user already swiped', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query.swipes.findFirst as any).mockResolvedValueOnce({ id: 'existing_id' }); // Existing swipe
    
    const result = await submitSwipe('user_2', true);
    
    expect(db.insert).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result as any).duplicate).toBe(true);
  });
});
