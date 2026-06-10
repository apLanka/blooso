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
