import { db } from './index';
import { users } from './schema';

const mockUsers = [
  {
    clerkId: 'mock_user_1',
    name: 'Alice Algorithmic',
    bio: 'Loves Big O notation and competitive programming. Looking for someone to optimize my heart.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80',
  },
  {
    clerkId: 'mock_user_2',
    name: 'Bob Backend',
    bio: 'Specialist in distributed systems. I can handle your traffic without a load balancer.',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&q=80',
  },
  {
    clerkId: 'mock_user_3',
    name: 'Charlie CSS',
    bio: 'I make things look good. Flexbox is my love language. Currently centering a div in my soul.',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&q=80',
  },
  {
    clerkId: 'mock_user_4',
    name: 'Diana DevOps',
    bio: 'Master of CI/CD. I can deploy our relationship to production in 5 minutes.',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80',
  },
  {
    clerkId: 'mock_user_5',
    name: 'Eve Encryption',
    bio: 'Very private and secure. I only use end-to-end encryption for late-night chats.',
    imageUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=500&q=80',
  }
];

async function seed() {
  console.log('🌱 Seeding database with mock profiles...');
  try {
    for (const user of mockUsers) {
      await db.insert(users).values(user).onConflictDoUpdate({
        target: users.clerkId,
        set: {
          name: user.name,
          bio: user.bio,
          imageUrl: user.imageUrl,
        }
      });
    }
    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
