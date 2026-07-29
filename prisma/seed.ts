/**
 * Prisma seed script — populates the database with demo data.
 *
 * Run with: npm run prisma:seed
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ComplianceIQ database...\n");

  // ── Demo User ──────────────────────────────────────────────────────
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@complianceiq.com" },
    update: {},
    create: {
      email: "demo@complianceiq.com",
      passwordHash: "placeholder-hash--auth-will-replace-this",
      name: "Demo User",
    },
  });
  console.log(`✅ Demo user: ${demoUser.email}`);

  // ── Demo Company ───────────────────────────────────────────────────
  const demoCompany = await prisma.company.upsert({
    where: { id: "demo-company-01" },
    update: {},
    create: {
      id: "demo-company-01",
      name: "Acme Technologies Inc.",
      ownerId: demoUser.id,
    },
  });
  console.log(`✅ Demo company: ${demoCompany.name}`);

  // ── Demo Company Profile ───────────────────────────────────────────
  const demoProfile = await prisma.companyProfile.upsert({
    where: { companyId: demoCompany.id },
    update: {},
    create: {
      companyId: demoCompany.id,
      industry: "541511", // NAICS: Custom Computer Programming Services
      state: "CA",
      city: "San Francisco",
      employeeCount: 25,
      hasRemoteWorkers: true,
      hasUnionEmployees: false,
      isFederalContractor: false,
      isNonprofit: false,
      locationCount: 1,
    },
  });
  console.log(
    `✅ Demo profile: ${demoProfile.employeeCount} employees in ${demoProfile.state}`,
  );

  // ── Seed Compliance Rules ──────────────────────────────────────────
  const rules = [
    {
      name: "FLSA Minimum Wage",
      category: "wage_hour",
      jurisdiction: "federal",
      description:
        "The Fair Labor Standards Act (FLSA) establishes minimum wage, overtime pay, recordkeeping, and youth employment standards.",
      conditions: {
        operator: "AND",
        conditions: [
          { field: "employeeCount", operator: "gte", value: 1 },
        ],
      },
      tasks: [
        {
          title: "Display FLSA Minimum Wage Poster",
          description:
            "Every employer subject to FLSA must display the minimum wage poster in a conspicuous location.",
          category: "poster",
          priority: "high",
          deadlineType: "annual",
          deadlineOffset: null,
          checklist: [
            "Download the FLSA Minimum Wage Poster from dol.gov",
            "Display poster in break room or common area",
            "Verify poster is current year version",
          ],
          references: [
            {
              label: "DOL FLSA Poster",
              url: "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/minwagep.pdf",
            },
          ],
        },
        {
          title: "Ensure minimum wage compliance",
          description:
            "Verify all employees are paid at least the federal minimum wage of $7.25/hour (or applicable state minimum if higher).",
          category: "wage_hour",
          priority: "critical",
          deadlineType: "ongoing",
          deadlineOffset: null,
          checklist: [
            "Review current pay rates against federal minimum wage",
            "Check state and local minimum wage rates",
            "Update payroll if needed",
          ],
          references: [
            {
              label: "DOL Minimum Wage",
              url: "https://www.dol.gov/general/topic/wages/minimumwage",
            },
          ],
        },
        {
          title: "Maintain proper overtime records",
          description:
            "Keep accurate records of hours worked and overtime pay for non-exempt employees.",
          category: "recordkeeping",
          priority: "high",
          deadlineType: "ongoing",
          deadlineOffset: null,
          checklist: [
            "Ensure time tracking system captures all hours",
            "Verify overtime rate calculation (1.5x regular rate)",
            "Retain payroll records for at least 3 years",
          ],
          references: [
            {
              label: "DOL Recordkeeping",
              url: "https://www.dol.gov/general/topic/wages/recordkeeping",
            },
          ],
        },
      ],
      consequences:
        "Back wages, liquidated damages, civil monetary penalties up to $2,074 per violation.",
      officialReference: "https://www.dol.gov/agencies/whd/flsa",
    },
    {
      name: "FMLA Leave Requirements",
      category: "leave",
      jurisdiction: "federal",
      description:
        "The Family and Medical Leave Act (FMLA) requires covered employers to provide unpaid, job-protected leave for specified family and medical reasons.",
      conditions: {
        operator: "AND",
        conditions: [
          { field: "employeeCount", operator: "gte", value: 50 },
        ],
      },
      tasks: [
        {
          title: "Display FMLA Poster",
          description:
            "Covered employers must display the FMLA poster prominently.",
          category: "poster",
          priority: "high",
          deadlineType: "annual",
          deadlineOffset: null,
          checklist: [
            "Download FMLA poster from dol.gov",
            "Display in common area",
            "Ensure poster is current",
          ],
          references: [
            {
              label: "DOL FMLA Poster",
              url: "https://www.dol.gov/agencies/whd/fmla/poster",
            },
          ],
        },
        {
          title: "Implement FMLA policy",
          description:
            "Create and distribute a written FMLA policy to all employees.",
          category: "filing",
          priority: "high",
          deadlineType: "one_time",
          deadlineOffset: null,
          checklist: [
            "Draft FMLA policy document",
            "Include eligibility criteria and leave process",
            "Distribute to all employees",
          ],
          references: [
            {
              label: "DOL FMLA Employer Guide",
              url: "https://www.dol.gov/agencies/whd/fmla/employer-guide",
            },
          ],
        },
      ],
      consequences:
        "Civil liability for compensatory damages, liquidated damages, and equitable relief.",
      officialReference: "https://www.dol.gov/agencies/whd/fmla",
    },
    {
      name: "ADA Workplace Accommodation",
      category: "discrimination",
      jurisdiction: "federal",
      description:
        "The Americans with Disabilities Act (ADA) prohibits discrimination against individuals with disabilities and requires reasonable accommodations.",
      conditions: {
        operator: "AND",
        conditions: [
          { field: "employeeCount", operator: "gte", value: 15 },
        ],
      },
      tasks: [
        {
          title: "Display EEO is the Law Poster",
          description:
            "Employers covered by ADA must display the EEO is the Law poster.",
          category: "poster",
          priority: "high",
          deadlineType: "annual",
          deadlineOffset: null,
          checklist: [
            "Download EEO poster from eeoc.gov",
            "Display in visible location",
            "Include supplement if federal contractor",
          ],
          references: [
            {
              label: "EEOC Poster",
              url: "https://www.eeoc.gov/poster",
            },
          ],
        },
        {
          title: "Have a reasonable accommodation process",
          description:
            "Establish a clear process for employees to request reasonable accommodations.",
          category: "training",
          priority: "medium",
          deadlineType: "one_time",
          deadlineOffset: null,
          checklist: [
            "Designate an ADA coordinator",
            "Create accommodation request form",
            "Train managers on ADA requirements",
          ],
          references: [
            {
              label: "EEOC ADA Guidance",
              url: "https://www.eeoc.gov/disability-discrimination",
            },
          ],
        },
      ],
      consequences:
        "Compensatory and punitive damages up to $300,000 depending on employer size.",
      officialReference: "https://www.ada.gov/",
    },
    {
      name: "OSHA Workplace Safety",
      category: "safety",
      jurisdiction: "federal",
      description:
        "The Occupational Safety and Health Act requires employers to provide a workplace free from recognized hazards.",
      conditions: {
        operator: "AND",
        conditions: [
          { field: "employeeCount", operator: "gte", value: 1 },
        ],
      },
      tasks: [
        {
          title: "Display OSHA Poster",
          description:
            "All covered employers must display the OSHA Job Safety and Health poster.",
          category: "poster",
          priority: "high",
          deadlineType: "annual",
          deadlineOffset: null,
          checklist: [
            "Download OSHA poster from osha.gov",
            "Display in common area",
            "Ensure poster is current",
          ],
          references: [
            {
              label: "OSHA Poster",
              url: "https://www.osha.gov/publications/poster",
            },
          ],
        },
        {
          title: "Maintain injury and illness records",
          description:
            "Record work-related injuries and illnesses using OSHA Forms 300, 300A, and 301.",
          category: "recordkeeping",
          priority: "high",
          deadlineType: "annual",
          deadlineOffset: null,
          checklist: [
            "Set up OSHA 300 log",
            "Record any workplace injuries promptly",
            "Post OSHA 300A summary Feb 1 - Apr 30 annually",
          ],
          references: [
            {
              label: "OSHA Recordkeeping",
              url: "https://www.osha.gov/recordkeeping/",
            },
          ],
        },
        {
          title: "Provide safety training",
          description:
            "Train employees on workplace hazards relevant to their jobs.",
          category: "training",
          priority: "medium",
          deadlineType: "annual",
          deadlineOffset: null,
          checklist: [
            "Identify job-specific hazards",
            "Develop or source training materials",
            "Document all training sessions",
          ],
          references: [
            {
              label: "OSHA Training",
              url: "https://www.osha.gov/training",
            },
          ],
        },
      ],
      consequences:
        "Fines up to $15,625 per violation; $156,259 for willful or repeated violations.",
      officialReference: "https://www.osha.gov/workers/employer-responsibilities",
    },
    {
      name: "California Minimum Wage",
      category: "wage_hour",
      jurisdiction: "CA",
      description:
        "California requires a higher minimum wage than the federal standard and has specific overtime rules.",
      conditions: {
        operator: "AND",
        conditions: [
          { field: "state", operator: "eq", value: "CA" },
          { field: "employeeCount", operator: "gte", value: 1 },
        ],
      },
      tasks: [
        {
          title: "Display California Minimum Wage Order",
          description:
            "California employers must display the current Minimum Wage Order (MW-2024 or current year).",
          category: "poster",
          priority: "high",
          deadlineType: "annual",
          deadlineOffset: null,
          checklist: [
            "Download CA Minimum Wage Order from dir.ca.gov",
            "Display in common area",
            "Verify wage rate is current",
          ],
          references: [
            {
              label: "CA DIR Minimum Wage",
              url: "https://www.dir.ca.gov/dlse/faq_minimumwage.htm",
            },
          ],
        },
        {
          title: "Verify California overtime rules",
          description:
            "California requires overtime for hours over 8/day and 40/week, plus double-time after 12 hours.",
          category: "wage_hour",
          priority: "critical",
          deadlineType: "ongoing",
          deadlineOffset: null,
          checklist: [
            "Review California overtime requirements",
            "Update payroll system for CA overtime rules",
            "Train managers on daily overtime rules",
          ],
          references: [
            {
              label: "CA Overtime",
              url: "https://www.dir.ca.gov/dlse/faq_overtime.htm",
            },
          ],
        },
        {
          title: "Provide paid sick leave",
          description:
            "California requires employers to provide at least 5 days (40 hours) of paid sick leave per year.",
          category: "leave",
          priority: "high",
          deadlineType: "annual",
          deadlineOffset: null,
          checklist: [
            "Review sick leave policy meets CA minimum",
            "Update employee handbook if needed",
            "Display paid sick leave poster",
          ],
          references: [
            {
              label: "CA Paid Sick Leave",
              url: "https://www.dir.ca.gov/dlse/paid_sick_leave.htm",
            },
          ],
        },
      ],
      consequences:
        "Back wages, liquidated damages, and civil penalties for wage violations. Waiting time penalties up to 30 days of wages.",
      officialReference: "https://www.dir.ca.gov/dlse/",
    },
    {
      name: "California Sexual Harassment Training",
      category: "training",
      jurisdiction: "CA",
      description:
        "California requires all employers with 5+ employees to provide sexual harassment prevention training.",
      conditions: {
        operator: "AND",
        conditions: [
          { field: "state", operator: "eq", value: "CA" },
          { field: "employeeCount", operator: "gte", value: 5 },
        ],
      },
      tasks: [
        {
          title: "Provide sexual harassment training",
          description:
            "Supervisors need 2 hours; non-supervisors need 1 hour of sexual harassment prevention training within 6 months of hire and every 2 years.",
          category: "training",
          priority: "high",
          deadlineType: "biennial",
          deadlineOffset: null,
          checklist: [
            "Identify all supervisors vs non-supervisors",
            "Source compliant training materials",
            "Track training completion dates",
            "Schedule refresher training every 2 years",
          ],
          references: [
            {
              label: "CA DFEH Training Requirements",
              url: "https://calcivilrights.ca.gov/sexualharassment/",
            },
          ],
        },
        {
          title: "Distribute DFEH harassment pamphlet",
          description:
            "Employers must provide the DFEH sexual harassment fact sheet to all employees.",
          category: "filing",
          priority: "medium",
          deadlineType: "one_time",
          deadlineOffset: null,
          checklist: [
            "Download DFEH-185 pamphlet",
            "Distribute to all new hires",
            "Include in employee handbook",
          ],
          references: [
            {
              label: "DFEH-185 Pamphlet",
              url: "https://calcivilrights.ca.gov/wp-content/uploads/sites/32/2022/12/Sexual-Harassment-Fact-Sheet_ENG.pdf",
            },
          ],
        },
      ],
      consequences:
        "Failure to provide training can result in DFEH complaints and may be used as evidence of failure to take all reasonable steps to prevent harassment.",
      officialReference: "https://calcivilrights.ca.gov/sexualharassment/",
    },
    {
      name: "California Pay Data Reporting",
      category: "filing",
      jurisdiction: "CA",
      description:
        "California requires private employers with 100+ employees to file annual pay data reports with the Civil Rights Department.",
      conditions: {
        operator: "AND",
        conditions: [
          { field: "state", operator: "eq", value: "CA" },
          { field: "employeeCount", operator: "gte", value: 100 },
        ],
      },
      tasks: [
        {
          title: "File annual pay data report",
          description:
            "Submit pay and hours worked data by establishment, job category, gender, race, and ethnicity to the CA Civil Rights Department.",
          category: "filing",
          priority: "high",
          deadlineType: "annual",
          deadlineOffset: null,
          checklist: [
            "Gather required pay data by demographic categories",
            "Use CRD online portal to submit",
            "File by May deadline each year",
          ],
          references: [
            {
              label: "CA CRD Pay Data Reporting",
              url: "https://calcivilrights.ca.gov/paydatareporting/",
            },
          ],
        },
      ],
      consequences:
        "Civil penalties of up to $100 per employee for first-time failure and up to $200 per employee for subsequent failures.",
      officialReference: "https://calcivilrights.ca.gov/paydatareporting/",
    },
    {
      name: "IRS Form 941 Filing",
      category: "filing",
      jurisdiction: "federal",
      description:
        "Employers must file Form 941 quarterly to report income taxes, Social Security tax, and Medicare tax withheld from employee paychecks.",
      conditions: {
        operator: "AND",
        conditions: [
          { field: "employeeCount", operator: "gte", value: 1 },
        ],
      },
      tasks: [
        {
          title: "File quarterly Form 941",
          description:
            "File IRS Form 941 by the last day of the month following the end of the quarter.",
          category: "filing",
          priority: "high",
          deadlineType: "quarterly",
          deadlineOffset: null,
          checklist: [
            "Reconcile payroll data for the quarter",
            "Complete Form 941",
            "E-file or mail by deadline",
          ],
          references: [
            {
              label: "IRS Form 941",
              url: "https://www.irs.gov/forms-pubs/about-form-941",
            },
          ],
        },
      ],
      consequences:
        "Failure to file penalties of 5% of unpaid tax per month, up to 25%.",
      officialReference: "https://www.irs.gov/forms-pubs/about-form-941",
    },
  ];

  for (const rule of rules) {
    await prisma.complianceRule.upsert({
      where: { id: `rule-${rule.jurisdiction}-${rule.name.toLowerCase().replace(/\s+/g, "-")}` },
      update: {
        name: rule.name,
        category: rule.category,
        jurisdiction: rule.jurisdiction,
        description: rule.description,
        conditions: rule.conditions,
        tasks: rule.tasks,
        consequences: rule.consequences,
        officialReference: rule.officialReference,
      },
      create: {
        id: `rule-${rule.jurisdiction}-${rule.name.toLowerCase().replace(/\s+/g, "-")}`,
        ...rule,
      },
    });
  }
  console.log(`✅ Seeded ${rules.length} compliance rules`);

  console.log("\n🎉 Seed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
