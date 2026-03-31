import prisma from './lib/prisma.js';

async function diagnose() {
  try {
    const users = await prisma.user.findMany({
      select: { email: true, phone: true }
    });
    
    console.log('--- USER PHONE DIAGNOSTIC ---');
    users.forEach(u => {
      console.log(`Email: ${u.email}`);
      console.log(`Phone: "${u.phone}"`);
      if (u.phone) {
        if (u.phone.includes(' ')) console.log('  -> ERROR: Contains spaces');
        if (!u.phone.startsWith('+')) console.log('  -> ERROR: Missing +');
      } else {
        console.log('  -> EMPTY');
      }
      console.log('----------------------------');
    });
  } catch (err) {
    console.error('Diagnosis failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
