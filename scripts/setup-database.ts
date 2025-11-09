/**
 * Database setup script
 * Helps initialize the database with test data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database setup...\n');

  // Create test enterprise
  console.log('Creating test enterprise...');
  const enterprise = await prisma.enterprise.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
    },
  });
  console.log(`✅ Enterprise created: ${enterprise.name} (${enterprise.id})\n`);

  // Create test organisation
  console.log('Creating test organisation...');
  const organisation = await prisma.organisation.upsert({
    where: {
      enterpriseId_slug: {
        enterpriseId: enterprise.id,
        slug: 'engineering',
      },
    },
    update: {},
    create: {
      enterpriseId: enterprise.id,
      name: 'Engineering Team',
      slug: 'engineering',
    },
  });
  console.log(`✅ Organisation created: ${organisation.name} (${organisation.id})\n`);

  // Create test admin user
  console.log('Creating test admin user...');
  const adminUser = await prisma.user.upsert({
    where: {
      enterpriseId_email: {
        enterpriseId: enterprise.id,
        email: 'admin@acme.com',
      },
    },
    update: {},
    create: {
      enterpriseId: enterprise.id,
      orgId: organisation.id,
      email: 'admin@acme.com',
      name: 'Admin User',
      role: 'ORG_ADMIN',
    },
  });
  console.log(`✅ Admin user created: ${adminUser.name} (${adminUser.email})\n`);

  // Create test recruiter user
  console.log('Creating test recruiter user...');
  const recruiterUser = await prisma.user.upsert({
    where: {
      enterpriseId_email: {
        enterpriseId: enterprise.id,
        email: 'recruiter@acme.com',
      },
    },
    update: {},
    create: {
      enterpriseId: enterprise.id,
      orgId: organisation.id,
      email: 'recruiter@acme.com',
      name: 'Recruiter User',
      role: 'RECRUITER',
    },
  });
  console.log(`✅ Recruiter user created: ${recruiterUser.name} (${recruiterUser.email})\n`);

  // Create test job listing
  console.log('Creating test job listing...');
  const jobListing = await prisma.jobListing.create({
    data: {
      enterpriseId: enterprise.id,
      orgId: organisation.id,
      createdById: adminUser.id,
      title: 'Senior Software Engineer',
      description: 'We are looking for an experienced software engineer to join our team.',
      status: 'active',
    },
  });
  console.log(`✅ Job listing created: ${jobListing.title} (${jobListing.id})\n`);

  // Create test question template
  console.log('Creating test question template...');
  const questionTemplate = await prisma.questionTemplate.create({
    data: {
      enterpriseId: enterprise.id,
      orgId: organisation.id,
      name: 'Software Engineer Interview Questions',
      description: 'Standard questions for software engineering positions',
      questions: [
        {
          id: '1',
          text: 'Tell us about your experience with TypeScript and Node.js',
          type: 'text',
          duration: 300,
        },
        {
          id: '2',
          text: 'Describe a challenging technical problem you solved recently',
          type: 'text',
          duration: 300,
        },
        {
          id: '3',
          text: 'How do you approach code reviews and collaboration?',
          type: 'text',
          duration: 180,
        },
      ],
    },
  });
  console.log(`✅ Question template created: ${questionTemplate.name} (${questionTemplate.id})\n`);

  // Link job to question template
  console.log('Linking job to question template...');
  const jobTemplate = await prisma.jobTemplate.create({
    data: {
      enterpriseId: enterprise.id,
      orgId: organisation.id,
      jobListingId: jobListing.id,
      questionTemplateId: questionTemplate.id,
    },
  });
  console.log(`✅ Job template created (${jobTemplate.id})\n`);

  console.log('✨ Database setup complete!\n');
  console.log('📋 Summary:');
  console.log(`   Enterprise ID: ${enterprise.id}`);
  console.log(`   Organisation ID: ${organisation.id}`);
  console.log(`   Admin User ID: ${adminUser.id}`);
  console.log(`   Recruiter User ID: ${recruiterUser.id}`);
  console.log(`   Job Listing ID: ${jobListing.id}`);
  console.log(`   Question Template ID: ${questionTemplate.id}`);
  console.log('\n💡 Use these IDs to test the API endpoints!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database setup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
