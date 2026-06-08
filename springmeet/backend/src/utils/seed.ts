import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌸 Seeding SpringMeet database...');

  // Admin user
  const adminHash = await bcrypt.hash('Admin@12345!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'aittezazahmad@gmail.com' },
    update: {},
    create: {
      email: 'aittezazahmad@gmail.com',
      username: 'aittezaz',
      displayName: 'Aittezaz Ahmad',
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      dateOfBirth: new Date('1995-01-01'),
      country: 'Pakistan',
      bio: 'Founder of SpringMeet. Making spring all over the world. 🌸',
      profile: { create: { interests: ['technology', 'startups', 'travel'], languages: ['English', 'Urdu'] } },
      settings: { create: {} },
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Test users
  const testUsers = [
    { email: 'luna@test.com', username: 'luna_amsterdam', displayName: 'Luna', country: 'Netherlands', dob: '1999-03-15' },
    { email: 'kai@test.com', username: 'kai_seoul', displayName: 'Kai', country: 'South Korea', dob: '2000-07-22' },
    { email: 'sofia@test.com', username: 'sofia_ba', displayName: 'Sofia', country: 'Argentina', dob: '1998-11-08' },
    { email: 'zara@test.com', username: 'zara_cairo', displayName: 'Zara', country: 'Egypt', dob: '2001-04-12' },
    { email: 'alex@test.com', username: 'alex_london', displayName: 'Alex', country: 'United Kingdom', dob: '1997-09-30' },
  ];

  const hash = await bcrypt.hash('Test@12345!', 12);
  for (const u of testUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        username: u.username,
        displayName: u.displayName,
        passwordHash: hash,
        status: 'ACTIVE',
        emailVerified: true,
        dateOfBirth: new Date(u.dob),
        country: u.country,
        profile: { create: { interests: ['travel', 'music', 'books'], languages: ['English'] } },
        settings: { create: {} },
      },
    });
    console.log('✅ Test user:', u.email);
  }

  // System config defaults
  const configs = [
    { key: 'SESSION_DURATION_MINUTES', value: '15' },
    { key: 'MAX_WARNINGS_BEFORE_SUSPEND', value: '3' },
    { key: 'TRUST_SCORE_DEDUCTION_WARNING', value: '20' },
    { key: 'QUEUE_TIMEOUT_SECONDS', value: '300' },
    { key: 'MAX_DAILY_MATCHES', value: '20' },
  ];

  for (const c of configs) {
    await prisma.systemConfig.upsert({ where: { key: c.key }, update: {}, create: c });
  }
  console.log('✅ System config seeded');

  console.log('\n🌸 Seed complete!');
  console.log('Admin login: aittezazahmad@gmail.com / Admin@12345!');
  console.log('Test user login: luna@test.com / Test@12345!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
