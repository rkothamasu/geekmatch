'use server';

import { db } from '@/db';
import { swipes, matches, users } from '@/db/schema';
import { and, eq, notInArray, or, inArray } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const swipeSchema = z.object({
  swipedId: z.string().uuid().or(z.string().min(1)), // Clerk IDs vary, but ensuring non-empty
  isLike: z.boolean(),
});

export async function submitSwipe(swipedId: string, isLike: boolean) {
  try {
    const { userId } = await auth();
    if (!userId) {
      logger.warn('Unauthorized swipe attempt');
      return { success: false, error: 'Unauthorized' };
    }

    // 1. Validate inputs
    const validated = swipeSchema.safeParse({ swipedId, isLike });
    if (!validated.success) {
      logger.error('Invalid swipe input', validated.error.format());
      return { success: false, error: 'Invalid input' };
    }

    // 2. Prevent self-swipe
    if (userId === swipedId) {
      return { success: false, error: 'Self-swipe not allowed' };
    }

    // 3. Prevent duplicate actions (Idempotency)
    const existingSwipe = await db.query.swipes.findFirst({
      where: and(
        eq(swipes.swiperId, userId),
        eq(swipes.swipedId, swipedId)
      ),
    });

    if (existingSwipe) {
      logger.info('User already swiped on this profile', { userId, swipedId });
      return { success: true, match: false, duplicate: true };
    }

    // 4. Record the swipe
    await db.insert(swipes).values({
      swiperId: userId,
      swipedId,
      isLike,
    });

    // 5. Check for mutual match if it's a like
    if (isLike) {
      const reciprocalLike = await db.query.swipes.findFirst({
        where: and(
          eq(swipes.swiperId, swipedId),
          eq(swipes.swipedId, userId),
          eq(swipes.isLike, true)
        ),
      });

      if (reciprocalLike) {
        // Prevent duplicate match creation
        const existingMatch = await db.query.matches.findFirst({
          where: or(
            and(eq(matches.user1Id, userId), eq(matches.user2Id, swipedId)),
            and(eq(matches.user1Id, swipedId), eq(matches.user2Id, userId))
          ),
        });

        if (!existingMatch) {
          await db.insert(matches).values({
            user1Id: userId < swipedId ? userId : swipedId,
            user2Id: userId < swipedId ? swipedId : userId,
          });
          logger.info('MATCH CREATED!', { user1: userId, user2: swipedId });
          revalidatePath('/matches');
        }
        return { success: true, match: true };
      }
    }

    revalidatePath('/discover');
    return { success: true, match: false };
  } catch (error) {
    logger.error('Critical failure in submitSwipe', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function getDiscoverProfiles() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    // Find users the current user has already swiped on
    const swipedIdsResult = await db.query.swipes.findMany({
      where: eq(swipes.swiperId, userId),
      columns: { swipedId: true },
    });
    
    const swipedIds = swipedIdsResult.map(s => s.swipedId);
    swipedIds.push(userId); // Don't show self

    // Get users not in swiped list
    return await db.query.users.findMany({
      where: notInArray(users.clerkId, swipedIds),
      limit: 10,
    });
  } catch (error) {
    logger.error('Error fetching discovery profiles', error);
    return [];
  }
}

export async function getMatches() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const userMatches = await db.query.matches.findMany({
      where: or(
        eq(matches.user1Id, userId),
        eq(matches.user2Id, userId)
      ),
    });

    if (userMatches.length === 0) return [];

    // Extract the other user's IDs
    const matchedUserIds = userMatches.map(m => 
      m.user1Id === userId ? m.user2Id : m.user1Id
    );

    // Fetch their profiles
    return await db.query.users.findMany({
      where: inArray(users.clerkId, matchedUserIds),
    });
  } catch (error) {
    logger.error('Error fetching matches', error);
    return [];
  }
}
