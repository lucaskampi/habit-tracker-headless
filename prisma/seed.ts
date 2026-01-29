import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main(){
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { email: 'demo@example.com', password: 'password', name: 'Demo User' }
  });
  console.log('Seeded user', user.email);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
