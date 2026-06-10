import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const staffNames = [
  'Emma Thompson',
  'Michael Davis',
  'Sarah Jenkins',
  'David Wilson',
  'Jessica Moore',
  'James Taylor',
  'Emily Anderson',
  'William Thomas',
  'Olivia Jackson',
  'Daniel White',
  'Sophia Harris',
  'Matthew Martin',
  'Isabella Thompson',
  'Anthony Garcia',
  'Mia Martinez',
  'Joshua Robinson',
  'Charlotte Clark',
  'Andrew Rodriguez',
  'Amelia Lewis',
  'Christopher Lee',
];

async function main() {
  const businesses = await prisma.business.findMany({
    include: { staffMembers: true, services: true },
  });

  const hashedPassword = await bcrypt.hash('Staff123!', 10);
  let nameIndex = 0;

  for (const business of businesses) {
    if (business.staffMembers.length > 0) continue;

    console.log(`Seeding staff for ${business.name}...`);

    for (let i = 0; i < 2; i++) {
      const staffName = staffNames[nameIndex % staffNames.length];
      const email = `staff${nameIndex + 1}@blooso.com`;
      nameIndex++;

      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name: staffName,
            role: 'staff',
          },
        });
      }

      const staffMember = await prisma.staffMember.create({
        data: {
          userId: user.id,
          businessId: business.id,
          role: 'staff',
          commissionRate: 40,
          bio: `Hi, I'm ${staffName.split(' ')[0]}! I specialize in premium styling and grooming.`,
        },
      });

      // Assign all business services to this staff member
      for (const service of business.services) {
        await prisma.staffService.create({
          data: {
            staffId: staffMember.id,
            serviceId: service.id,
          },
        });
      }

      // Add a standard schedule (Mon-Fri 9am-5pm)
      for (let day = 1; day <= 5; day++) {
        await prisma.staffSchedule.create({
          data: {
            staffId: staffMember.id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '17:00',
            isAvailable: true,
          },
        });
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
