/**
 * Production seed script - creates demo business with services, staff, appointments, reviews.
 * Run with: npx ts-node prisma/seed-production.ts
 * Requires DATABASE_URL to be set (production).
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const ownerEmail = 'demo@blooso.com';
  const ownerPassword = 'Demo123!';

  let owner = await prisma.user.findUnique({
    where: { email: ownerEmail },
  });

  if (!owner) {
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);
    owner = await prisma.user.create({
      data: {
        email: ownerEmail,
        password: hashedPassword,
        name: 'Demo Owner',
        role: 'owner',
      },
    });
    console.log('Created demo owner:', ownerEmail);
  } else {
    console.log('Demo owner already exists');
  }

  let business = await prisma.business.findFirst({
    where: { ownerId: owner.id },
    include: { locations: true },
  });

  if (!business) {
    business = await prisma.business.create({
      data: {
        ownerId: owner.id,
        name: 'Blooso Demo Salon',
        slug: 'blooso-demo-salon',
        description: 'A demo beauty salon for testing the Blooso platform.',
        category: 'salon',
        settings: {},
      },
      include: { locations: true },
    });
    console.log('Created demo business:', business.name);
  }

  let location = business.locations[0];
  if (!location) {
    location = await prisma.location.create({
      data: {
        businessId: business.id,
        name: 'Main Location',
        address: '123 Demo St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
        country: 'US',
        timezone: 'America/Los_Angeles',
        phone: '+15551234567',
      },
    });
    for (let d = 0; d < 7; d++) {
      await prisma.businessHours.create({
        data: {
          locationId: location.id,
          dayOfWeek: d,
          openTime: '09:00',
          closeTime: '18:00',
          isClosed: d === 0,
        },
      });
    }
    console.log('Created location and business hours');
  }

  const categoryExists = await prisma.serviceCategory.findFirst({
    where: { businessId: business.id, name: 'Hair' },
  });
  const cat = categoryExists
    ? categoryExists
    : await prisma.serviceCategory.create({
        data: {
          businessId: business.id,
          name: 'Hair',
          sortOrder: 0,
        },
      });

  const serviceCount = await prisma.service.count({
    where: { businessId: business.id },
  });
  if (serviceCount === 0) {
    await prisma.service.createMany({
      data: [
        {
          businessId: business.id,
          categoryId: cat.id,
          name: 'Haircut',
          description: 'Classic haircut',
          durationMinutes: 30,
          price: 35,
          bufferBeforeMinutes: 0,
          bufferAfterMinutes: 0,
          isActive: true,
        },
        {
          businessId: business.id,
          categoryId: cat.id,
          name: 'Hair Color',
          description: 'Full color service',
          durationMinutes: 90,
          price: 120,
          bufferBeforeMinutes: 0,
          bufferAfterMinutes: 0,
          isActive: true,
        },
      ],
    });
    console.log('Created demo services');
  }

  const staffCount = await prisma.staffMember.count({
    where: { businessId: business.id },
  });
  if (staffCount === 0) {
    const staffUser = await prisma.user.create({
      data: {
        email: 'staff@blooso-demo.com',
        password: await bcrypt.hash('Staff123!', 10),
        name: 'Demo Staff',
        role: 'staff',
      },
    });
    const staff = await prisma.staffMember.create({
      data: {
        businessId: business.id,
        userId: staffUser.id,
        role: 'staff',
        isActive: true,
      },
    });
    const services = await prisma.service.findMany({
      where: { businessId: business.id },
    });
    for (const svc of services) {
      await prisma.staffService.create({
        data: { staffId: staff.id, serviceId: svc.id },
      });
    }
    for (let d = 1; d <= 5; d++) {
      await prisma.staffSchedule.upsert({
        where: { staffId_dayOfWeek: { staffId: staff.id, dayOfWeek: d } },
        create: {
          staffId: staff.id,
          dayOfWeek: d,
          startTime: '09:00',
          endTime: '18:00',
          isAvailable: true,
        },
        update: {},
      });
    }
    console.log('Created demo staff');
  }

  console.log('\nProduction seed complete.');
  console.log('Demo credentials:');
  console.log('  Owner: demo@blooso.com / Demo123!');
  console.log('  Business slug: blooso-demo-salon');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
