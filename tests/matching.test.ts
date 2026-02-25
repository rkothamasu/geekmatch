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
    vi.clearAllMocks();
  });

  test('records a swipe and returns no match if swipe is dislike', async () => {
    (db.query.swipes.findFirst as any).mockResolvedValueOnce(null);
    const result = await submitSwipe('user_2', false);
    
    expect(db.insert).toHaveBeenCalled();
    expect(result.match).toBe(false);
  });

  test('records a swipe and returns no match if reciprocal like not found', async () => {
    (db.query.swipes.findFirst as any).mockResolvedValueOnce(null);
    const result = await submitSwipe('user_2', true);
    
    expect(db.insert).toHaveBeenCalled();
    expect(result.match).toBe(false);
  });

  test('creates a match when reciprocal like is found', async () => {
    (db.query.swipes.findFirst as any).mockResolvedValueOnce({ id: 'swipe_id', isLike: true });
    const result = await submitSwipe('user_2', true);
    
    expect(db.insert).toHaveBeenCalledTimes(2); // One for swipe, one for match
    expect(result.match).toBe(true);
  });
});
