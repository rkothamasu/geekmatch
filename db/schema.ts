import { pgTable, text, timestamp, boolean, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  name: text('name').notNull(),
  bio: text('bio'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const swipes = pgTable('swipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  swiperId: text('swiper_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  swipedId: text('swiped_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  isLike: boolean('is_like').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => {
  return [
    index('idx_swipes_swiper_swiped').on(table.swiperId, table.swipedId)
  ];
});

export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  user1Id: text('user1_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  user2Id: text('user2_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => {
  return [
    index('idx_matches_user1_user2').on(table.user1Id, table.user2Id)
  ];
});

export const usersRelations = relations(users, ({ many }) => ({
  swipesGiven: many(swipes, { relationName: 'swipesGiven' }),
  swipesReceived: many(swipes, { relationName: 'swipesReceived' }),
  matches1: many(matches, { relationName: 'matches1' }),
  matches2: many(matches, { relationName: 'matches2' }),
}));

export const swipesRelations = relations(swipes, ({ one }) => ({
  swiper: one(users, { fields: [swipes.swiperId], references: [users.clerkId], relationName: 'swipesGiven' }),
  swiped: one(users, { fields: [swipes.swipedId], references: [users.clerkId], relationName: 'swipesReceived' }),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  user1: one(users, { fields: [matches.user1Id], references: [users.clerkId], relationName: 'matches1' }),
  user2: one(users, { fields: [matches.user2Id], references: [users.clerkId], relationName: 'matches2' }),
}));
