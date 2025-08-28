import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create an event first
  const event = await prisma.event.create({
    data: {
      name: 'Cardiology Workshop 2024',
      description: 'Annual cardiology workshop with various sessions',
      isActive: true
    }
  });

  console.log('✅ Created event');

  // Create slots
  const slot1 = await prisma.slot.create({
    data: {
      name: 'Morning Session',
      date: '2024-01-15',
      time: '09:00 - 10:20',
      eventId: event.id
    }
  });

  const slot2 = await prisma.slot.create({
    data: {
      name: 'Mid-Morning Session',
      date: '2024-01-15',
      time: '10:40 - 12:00',
      eventId: event.id
    }
  });

  const slot3 = await prisma.slot.create({
    data: {
      name: 'Afternoon Session',
      date: '2024-01-15',
      time: '12:00 - 13:20',
      eventId: event.id
    }
  });

  console.log('✅ Created slots');

  // Create topics for slot 1
  await prisma.topic.createMany({
    data: [
      {
        title: 'Imaging (Wojciech Kosmala)',
        description: 'Cardiac imaging techniques and applications',
        instructor: 'Wojciech Kosmala',
        maxParticipants: 15,
        slotId: slot1.id
      },
      {
        title: 'Interventional Cardiology (Krzysztof Reczuch)',
        description: 'Interventional procedures and techniques',
        instructor: 'Krzysztof Reczuch',
        maxParticipants: 15,
        slotId: slot1.id
      },
      {
        title: 'Intensive Care (Robert Zymliński)',
        description: 'Critical care cardiology and management',
        instructor: 'Robert Zymliński',
        maxParticipants: 15,
        slotId: slot1.id
      },
      {
        title: 'Heart Transplantation and Mechanical Circulatory Support (Michał Zakliczyński)',
        description: 'Advanced heart failure and transplant procedures',
        instructor: 'Michał Zakliczyński',
        maxParticipants: 15,
        slotId: slot1.id
      },
      {
        title: 'Electrophysiology (Krzysztof Nowak)',
        description: 'Cardiac rhythm disorders and electrophysiology',
        instructor: 'Krzysztof Nowak',
        maxParticipants: 15,
        slotId: slot1.id
      },
      {
        title: '"One-day" Cardiology Care (Małgorzata Kobusiak-Prokopowicz)',
        description: 'Outpatient cardiology services and management',
        instructor: 'Małgorzata Kobusiak-Prokopowicz',
        maxParticipants: 15,
        slotId: slot1.id
      }
    ]
  });

  // Create topics for slot 2
  await prisma.topic.createMany({
    data: [
      {
        title: 'Imaging (Wojciech Kosmala)',
        description: 'Cardiac imaging techniques and applications',
        instructor: 'Wojciech Kosmala',
        maxParticipants: 15,
        slotId: slot2.id
      },
      {
        title: 'Interventional Cardiology (Krzysztof Reczuch)',
        description: 'Interventional procedures and techniques',
        instructor: 'Krzysztof Reczuch',
        maxParticipants: 15,
        slotId: slot2.id
      },
      {
        title: 'Intensive Care (Robert Zymliński)',
        description: 'Critical care cardiology and management',
        instructor: 'Robert Zymliński',
        maxParticipants: 15,
        slotId: slot2.id
      },
      {
        title: 'Heart Transplantation and Mechanical Circulatory Support (Michał Zakliczyński)',
        description: 'Advanced heart failure and transplant procedures',
        instructor: 'Michał Zakliczyński',
        maxParticipants: 15,
        slotId: slot2.id
      },
      {
        title: 'Electrophysiology (Krzysztof Nowak)',
        description: 'Cardiac rhythm disorders and electrophysiology',
        instructor: 'Krzysztof Nowak',
        maxParticipants: 15,
        slotId: slot2.id
      },
      {
        title: '"One-day" Cardiology Care (Małgorzata Kobusiak-Prokopowicz)',
        description: 'Outpatient cardiology services and management',
        instructor: 'Małgorzata Kobusiak-Prokopowicz',
        maxParticipants: 15,
        slotId: slot2.id
      }
    ]
  });

  // Create topics for slot 3
  await prisma.topic.createMany({
    data: [
      {
        title: 'Imaging (Wojciech Kosmala)',
        description: 'Cardiac imaging techniques and applications',
        instructor: 'Wojciech Kosmala',
        maxParticipants: 15,
        slotId: slot3.id
      },
      {
        title: 'Interventional Cardiology (Krzysztof Reczuch)',
        description: 'Interventional procedures and techniques',
        instructor: 'Krzysztof Reczuch',
        maxParticipants: 15,
        slotId: slot3.id
      },
      {
        title: 'Intensive Care (Robert Zymliński)',
        description: 'Critical care cardiology and management',
        instructor: 'Robert Zymliński',
        maxParticipants: 15,
        slotId: slot3.id
      },
      {
        title: 'Heart Transplantation and Mechanical Circulatory Support (Michał Zakliczyński)',
        description: 'Advanced heart failure and transplant procedures',
        instructor: 'Michał Zakliczyński',
        maxParticipants: 15,
        slotId: slot3.id
      },
      {
        title: 'Electrophysiology (Krzysztof Nowak)',
        description: 'Cardiac rhythm disorders and electrophysiology',
        instructor: 'Krzysztof Nowak',
        maxParticipants: 15,
        slotId: slot3.id
      },
      {
        title: '"One-day" Cardiology Care (Małgorzata Kobusiak-Prokopowicz)',
        description: 'Outpatient cardiology services and management',
        instructor: 'Małgorzata Kobusiak-Prokopowicz',
        maxParticipants: 15,
        slotId: slot3.id
      }
    ]
  });

  console.log('✅ Created topics');
  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 