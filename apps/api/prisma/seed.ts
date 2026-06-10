import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@blooso.com';
  const adminPassword = 'Admin123!';

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existing) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
      },
    });
    console.log('Created admin user:', adminEmail);
  } else {
    console.log('Admin user already exists');
  }

  // Seed 10 mock businesses (Salons and Barbershops, no Spas)
  const categories = ['Salon', 'Barbershop'];
  const names = [
    'The Style Lounge',
    'Fade Kings Barbershop',
    'Glamour Beauty Salon',
    'Classic Cuts',
    'Modern Hair Studio',
    "Gentleman's Grooming",
    'Chic Boutique Salon',
    'Elite Fade Barbershop',
    'Platinum Hair Design',
    'Urban Chop Shop',
  ];

  for (let i = 0; i < 10; i++) {
    const isSalon = i % 2 === 0;
    const category = isSalon ? 'Salon' : 'Barbershop';
    const email = `owner${i + 1}@blooso.com`;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const hashedPassword = await bcrypt.hash('Owner123!', 10);
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `Owner ${i + 1}`,
          role: 'owner',
        },
      });
      console.log(`Created owner: ${email}`);
    }

    const slug = names[i].toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let business = await prisma.business.findUnique({ where: { slug } });
    if (!business) {
      business = await prisma.business.create({
        data: {
          ownerId: user.id,
          name: names[i],
          slug,
          category,
          description: `A premium ${category.toLowerCase()} offering top-notch services.`,
        },
      });
      console.log(`Created business: ${business.name} (${category})`);

      // Seed a location
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

      // Seed service categories and services based on business type
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
          data: {
            businessId: business.id,
            name: 'Beard Grooming',
            sortOrder: 2,
          },
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
    }

    // Add a small delay to prevent NeonDB connection pooler from dropping the connection
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
