'use server';

import { db } from '@/db';
import { swipes, matches, users } from '@/db/schema';
import { and, eq, ne, notInArray, or, inArray } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function submitSwipe(swipedId: string, isLike: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // 1. Record the swipe
  await db.insert(swipes).values({
    swiperId: userId,
    swipedId,
    isLike,
  });

  // 2. Check for mutual match if it's a like
  if (isLike) {
    const reciprocalLike = await db.query.swipes.findFirst({
      where: and(
        eq(swipes.swiperId, swipedId),
        eq(swipes.swipedId, userId),
        eq(swipes.isLike, true)
      ),
    });

    console.log('reciprocalLike:', reciprocalLike);

    if (reciprocalLike) {
      // Create a match
      await db.insert(matches).values({
        user1Id: userId < swipedId ? userId : swipedId,
        user2Id: userId < swipedId ? swipedId : userId,
      });
      revalidatePath('/matches');
      return { match: true };
    }
  }

  revalidatePath('/discover');
  return { match: false };
}

export async function getDiscoverProfiles() {
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
}

export async function getMatches() {
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
}
