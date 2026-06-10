import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany({
    include: { services: true },
  });

  for (const business of businesses) {
    if (business.services.length > 0) continue;

    console.log(`Seeding services for ${business.name}...`);

    await prisma.location.create({
      data: {
        businessId: business.id,
        name: 'Main Location',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        phone: '+1 555-123-4567',
      },
    });

    const isSalon = business.category === 'Salon';

    if (isSalon) {
      const catHair = await prisma.serviceCategory.create({
        data: {
          businessId: business.id,
          name: 'Haircuts & Styling',
          sortOrder: 1,
        },
      });
      await prisma.service.createMany({
        data: [
          {
            businessId: business.id,
            categoryId: catHair.id,
            name: "Women's Haircut",
            durationMinutes: 60,
            price: 80,
            sortOrder: 1,
          },
          {
            businessId: business.id,
            categoryId: catHair.id,
            name: "Men's Haircut",
            durationMinutes: 45,
            price: 50,
            sortOrder: 2,
          },
          {
            businessId: business.id,
            categoryId: catHair.id,
            name: 'Blowout',
            durationMinutes: 45,
            price: 45,
            sortOrder: 3,
          },
        ],
      });

      const catColor = await prisma.serviceCategory.create({
        data: { businessId: business.id, name: 'Coloring', sortOrder: 2 },
      });
      await prisma.service.createMany({
        data: [
          {
            businessId: business.id,
            categoryId: catColor.id,
            name: 'Full Highlights',
            durationMinutes: 120,
            price: 150,
            sortOrder: 1,
          },
          {
            businessId: business.id,
            categoryId: catColor.id,
            name: 'Balayage',
            durationMinutes: 150,
            price: 180,
            sortOrder: 2,
          },
          {
            businessId: business.id,
            categoryId: catColor.id,
            name: 'Root Touch Up',
            durationMinutes: 60,
            price: 75,
            sortOrder: 3,
          },
        ],
      });
    } else {
      const catCuts = await prisma.serviceCategory.create({
        data: { businessId: business.id, name: 'Haircuts', sortOrder: 1 },
      });
      await prisma.service.createMany({
        data: [
          {
            businessId: business.id,
            categoryId: catCuts.id,
            name: 'Classic Fade',
            durationMinutes: 45,
            price: 40,
            sortOrder: 1,
          },
          {
            businessId: business.id,
            categoryId: catCuts.id,
            name: 'Scissor Cut',
            durationMinutes: 45,
            price: 45,
            sortOrder: 2,
          },
          {
            businessId: business.id,
            categoryId: catCuts.id,
            name: 'Buzz Cut',
            durationMinutes: 30,
            price: 25,
            sortOrder: 3,
          },
        ],
      });

      const catBeard = await prisma.serviceCategory.create({
        data: { businessId: business.id, name: 'Beard Grooming', sortOrder: 2 },
      });
      await prisma.service.createMany({
        data: [
          {
            businessId: business.id,
            categoryId: catBeard.id,
            name: 'Beard Trim',
            durationMinutes: 30,
            price: 25,
            sortOrder: 1,
          },
          {
            businessId: business.id,
            categoryId: catBeard.id,
            name: 'Hot Towel Shave',
            durationMinutes: 45,
            price: 35,
            sortOrder: 2,
          },
        ],
      });
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
