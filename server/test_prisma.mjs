import { PrismaClient } from '@prisma/client';

try {
  const p = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./dev.db',
      },
    },
  });
  console.log('datasources.db.url works');
  await p.$connect();
  console.log('connected successfully');
  const count = await p.user.count();
  console.log('user count:', count);
  await p.$disconnect();
} catch (e) {
  console.log('FAILED:', e.message.substring(0, 500));
}
