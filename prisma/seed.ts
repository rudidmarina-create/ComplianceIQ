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

  // ── Seed Knowledge Base Articles ─────────────────────────────────
  const knowledgeArticles = [
    {
      slug: "flsa-fair-labor-standards-act",
      title: "FLSA: Fair Labor Standards Act",
      category: "wage_hour",
      tags: ["FLSA", "minimum wage", "overtime", "recordkeeping"],
      isPublished: true,
      content: `The Fair Labor Standards Act (FLSA) is the federal law that sets the baseline for how most private and public employers must pay their workers. Enforced by the U.S. Department of Labor's Wage and Hour Division (WHD), it establishes the federal minimum wage, overtime pay requirements, recordkeeping rules, and restrictions on youth employment. If you have even one employee, the FLSA almost certainly applies to your business.

## Who it applies to

The FLSA covers most employers, including those with just a single employee, unless a specific exemption applies. Whether an employee is entitled to minimum wage and overtime depends on their classification as *exempt* or *non-exempt*. Exempt executive, administrative, and professional (EAP) employees must generally be paid on a salary basis at or above the standard salary level and perform qualifying duties. Most other employees are non-exempt and must receive overtime pay.

## Minimum wage and overtime

The federal minimum wage is $7.25 per hour. Where state or local minimum wage laws set a higher rate, you must pay the higher amount. Tipped employees may be paid a lower direct cash wage of at least $2.13 per hour, but only if their tips bring total earnings up to at least the minimum wage.

Non-exempt employees must receive overtime pay of at least one and one-half times their regular rate of pay for every hour worked over 40 in a workweek. There is no limit on the number of hours an adult employee may work, but you must pay overtime for the excess. Many states impose daily overtime or higher overtime rates, so your payroll system must be able to handle both federal and state rules.

## Recordkeeping

The FLSA requires employers to keep accurate records of hours worked and wages paid for every non-exempt employee — including time cards, work schedules, and pay rates. Wage and hour records must generally be kept for at least three years, and time cards or other computation records for at least two years. If proper records are not kept, the burden of proof shifts to the employer in a wage claim.

## Youth employment

The FLSA restricts the hours and types of work for minors. Workers aged 14-15 may work only outside school hours, no more than 3 hours per day and 18 hours per week during the school year, and only between 7 a.m. and 7 p.m. (9 p.m. from June 1 through Labor Day). Workers aged 16-17 may work unlimited hours but cannot work in hazardous occupations, such as mining or operating certain power-driven machinery. All workers must be at least 18 to work in occupations the Secretary of Labor declares hazardous.

## Consequences of noncompliance

Violations can result in back wages owed, an equal amount in liquidated damages, and civil money penalties for repeated or willful violations. The WHD can investigate with or without a complaint, and willful violations can lead to criminal prosecution. Employees can also bring private lawsuits and collective actions, so misclassification and unpaid overtime are high-risk areas for small businesses.

## Official references

- [DOL — Fair Labor Standards Act (WHD)](https://www.dol.gov/agencies/whd/flsa)
- [DOL — Minimum Wage](https://www.dol.gov/general/topic/wages/minimumwage)
- [DOL — Overtime Pay](https://www.dol.gov/general/topic/wages/overtimepay)
- [DOL — Youth Rules](https://www.dol.gov/agencies/whd/youthrules)
- [DOL — Fact Sheet #14: Recordkeeping](https://www.dol.gov/agencies/whd/fact-sheets/14-flsa-recordkeeping)`,
    },
    {
      slug: "fmla-family-and-medical-leave-act",
      title: "FMLA: Family and Medical Leave Act",
      category: "leave",
      tags: ["FMLA", "family leave", "medical leave", "job protection"],
      isPublished: true,
      content: `The Family and Medical Leave Act (FMLA) gives eligible employees of covered employers up to 12 weeks of unpaid, job-protected leave per year for specified family and medical reasons. Enforced by the U.S. Department of Labor's Wage and Hour Division, the FMLA lets employees balance work with family responsibilities without risking their jobs.

## Who it applies to

The FMLA covers private employers with 50 or more employees within a 75-mile radius of the worksite, plus all public agencies and public and private elementary and secondary schools regardless of size. To be eligible, an employee must have worked for the employer for at least 12 months, have worked at least 1,250 hours during the 12 months before the leave starts, and work at a site where the employer has at least 50 employees within 75 miles.

## Covered reasons for leave

Eligible employees may take up to 12 weeks of FMLA leave in a 12-month period for: the birth of a child and care for the newborn within the first year; placement of a child for adoption or foster care; caring for a spouse, child, or parent with a serious health condition; the employee's own serious health condition; and qualifying exigencies arising from a family member's military deployment. A separate category provides up to 26 weeks in a single 12-month period to care for a covered servicemember with a serious injury or illness.

A serious health condition generally involves inpatient care or continuing treatment by a health care provider. Leave may be taken intermittently or on a reduced schedule when medically necessary — for example, chemotherapy appointments or physical therapy sessions.

## Employer obligations

Covered employers must post the FMLA notice, respond to leave requests promptly, and provide specific notices: an eligibility notice and a rights-and-responsibilities notice within five business days of a leave request, and a designation notice once enough information is known. During leave, you must continue the employee's group health benefits under the same conditions as if the employee were working. When leave ends, the employee generally must be restored to the same or an equivalent job with equivalent pay, benefits, and terms.

## What to watch out for

FMLA leave runs concurrently with paid leave when the employer designates it properly, and employers may require medical certification to support serious-health-condition claims. Retaliation against employees who request or take FMLA leave is prohibited, as is interfering with their rights under the law.

## Consequences of noncompliance

Employers that deny leave or benefits, retaliate, or fail to provide required notices can be liable for lost wages, benefits, and other compensation, liquidated damages, and attorney's fees. The DOL may also bring enforcement actions against employers that violate the law.

## Official references

- [DOL — Family and Medical Leave Act](https://www.dol.gov/agencies/whd/fmla)
- [DOL — FMLA Employer Guide](https://www.dol.gov/agencies/whd/fmla/employer-guide)
- [DOL — Fact Sheet #28: FMLA](https://www.dol.gov/agencies/whd/fact-sheets/28f-fmla)
- [DOL — FMLA Poster](https://www.dol.gov/agencies/whd/posters/fmla)`,
    },
    {
      slug: "ada-americans-with-disabilities-act",
      title: "ADA: Americans with Disabilities Act",
      category: "discrimination",
      tags: ["ADA", "disability", "reasonable accommodation", "undue hardship"],
      isPublished: true,
      content: `The Americans with Disabilities Act (ADA) is a landmark civil rights law that prohibits discrimination against people with disabilities in employment, public accommodations, and government services. For employers, Title I of the ADA governs how you hire, manage, and support employees with disabilities, and it requires you to provide reasonable accommodations unless doing so would cause undue hardship.

## Who it applies to

Title I applies to private employers with 15 or more employees, plus state and local governments, employment agencies, and labor organizations. It protects qualified individuals — people with a disability who can perform the essential functions of the job with or without reasonable accommodation. A disability includes a physical or mental impairment that substantially limits one or more major life activities, a record of such an impairment, or being regarded as having one.

## The interactive process and reasonable accommodation

When an employee or applicant with a disability requests an accommodation, you should engage in an interactive process to explore options. Reasonable accommodations can include modifying job duties, restructuring schedules, providing assistive technology or ergonomic equipment, reassigning to a vacant position, or making the workplace physically accessible. You are not required to eliminate essential functions, lower production standards, or provide personal-use items.

## Undue hardship

You may decline an accommodation if it would impose an undue hardship — a significant difficulty or expense considering the size of the business, its financial resources, and the nature of the operation. The analysis is fact-specific, so document your process and any cost or operational analysis you rely on.

## Medical inquiries and confidentiality

The ADA restricts disability-related inquiries and medical examinations. Before making a job offer, you generally may not ask about disabilities or require medical exams. After a conditional offer, exams are permitted if they are required for all employees in the same job category, and the results must be kept confidential and stored separately from personnel files.

## Consequences of noncompliance

The Equal Employment Opportunity Commission (EEOC) enforces Title I. Remedies include back pay, reinstatement, compensatory and punitive damages (capped based on employer size), and attorney's fees. The ADA also covers your customers — public accommodations must remove barriers where readily achievable, so physical accessibility matters for retail and service businesses too.

## Official references

- [EEOC — Disability Discrimination](https://www.eeoc.gov/disability-discrimination)
- [EEOC — Enforcement Guidance on Reasonable Accommodation and Undue Hardship](https://www.eeoc.gov/laws/guidance/enforcement-guidance-reasonable-accommodation-and-undue-hardship-under-ada)
- [ADA.gov — U.S. Department of Justice](https://www.ada.gov/)
- [EEOC — Facts About the Americans with Disabilities Act](https://www.eeoc.gov/laws/guidance/facts-about-americans-disabilities-act)`,
    },
    {
      slug: "osha-workplace-safety",
      title: "OSHA: Workplace Safety",
      category: "safety",
      tags: ["OSHA", "safety", "hazard communication", "recordkeeping"],
      isPublished: true,
      content: `The Occupational Safety and Health Act of 1970 created the Occupational Safety and Health Administration (OSHA) and requires most private-sector employers to provide a workplace free of recognized serious hazards. Compliance is not optional paperwork — OSHA inspections, citations, and penalties are a real risk for businesses in every industry, and workplace injuries also drive up workers' compensation and health insurance costs.

## Who it applies to

The OSH Act covers most private-sector employers and their workers. Some industries — such as mining, airlines, and railroads — are regulated by other federal agencies, and many states operate their own OSHA-approved state plans. Self-employed individuals and family farms are among the few exempt groups.

## Employer responsibilities

Every covered employer must comply with the General Duty Clause, which requires a workplace free from recognized hazards that are causing or are likely to cause death or serious physical harm. You must also comply with industry-specific standards, which for many small businesses include hazard communication, personal protective equipment, exit routes, electrical safety, and machine guarding.

## Hazard communication

The Hazard Communication Standard (HazCom) requires you to inventory hazardous chemicals, keep Safety Data Sheets (SDS) accessible to employees, label containers, and train employees on the hazards they face. If you use even common cleaning chemicals, this standard applies. Training must be provided at hire and whenever new hazards are introduced.

## Recordkeeping and reporting

Employers with more than 10 employees must keep an OSHA 300 log of work-related injuries and illnesses, prepare an OSHA 301 incident report for each entry, and post the annual OSHA 300A summary from February 1 through April 30 each year. All employers must report any work-related fatality to OSHA within 8 hours, and any in-patient hospitalization, amputation, or loss of an eye within 24 hours. You must also display the OSHA "Job Safety and Health: It's the Law" poster.

## Consequences of noncompliance

OSHA can inspect without notice, and citations carry civil penalties that can reach tens of thousands of dollars per violation, with substantially higher maximums for willful or repeat violations. Employees are protected from retaliation for reporting hazards or filing complaints, and whistleblower protections extend to many other federal statutes.

## Official references

- [OSHA — Employer Responsibilities](https://www.osha.gov/workers/employer-responsibilities)
- [OSHA — Hazard Communication](https://www.osha.gov/hazcom)
- [OSHA — Injury and Illness Recordkeeping](https://www.osha.gov/recordkeeping)
- [OSHA — Required Posters](https://www.osha.gov/workers/osha-posters)
- [OSHA — Reporting Fatalities and Severe Injuries](https://www.osha.gov/report)`,
    },
    {
      slug: "cobra-health-coverage-continuation",
      title: "COBRA: Health Coverage Continuation",
      category: "benefits",
      tags: ["COBRA", "health coverage", "benefits", "notice"],
      isPublished: true,
      content: `The Consolidated Omnibus Budget Reconciliation Act (COBRA) gives employees and their families the right to continue group health coverage after a job loss or other qualifying event. For employers with group health plans, COBRA is one of the most compliance-sensitive obligations you will manage, because missing a deadline or sending the wrong notice can trigger excise taxes and penalties.

## Who it applies to

COBRA generally applies to private-sector employers with 20 or more employees (part-time employees count on a pro-rata basis) that sponsor group health plans, plus state and local governments. The law covers group medical, dental, and vision plans, as well as health flexible spending accounts in most cases.

## Qualifying events

The right to continuation coverage is triggered by qualifying events. For employees, these include termination of employment (other than for gross misconduct) and reduction in hours. For spouses and dependents, qualifying events also include the employee's death, divorce or legal separation, the employee becoming entitled to Medicare, and a dependent child losing dependent status. An employer's bankruptcy can also trigger coverage rights for retirees and their families.

## How long coverage lasts and what it costs

Continuation coverage generally lasts 18 months after termination or reduction in hours, extended to 29 months if the qualified beneficiary becomes disabled (as determined by Social Security). Coverage lasts 36 months for death, divorce, Medicare entitlement, or loss of dependent status. You may charge up to 102% of the plan's cost for the coverage, and qualified beneficiaries generally pay the full premium themselves.

## Notice and election requirements

The timeline matters. The plan administrator must provide an initial COBRA notice within 90 days of when coverage begins. After a qualifying event, the employer generally has 30 days to notify the plan administrator, who then has 14 days to send the COBRA election notice to the qualified beneficiary. The beneficiary then has 60 days to elect coverage, and premiums must be paid within 45 days of the election. Failing to send a notice in time can extend the election window and create liability.

## Consequences of noncompliance

The IRS can assess an excise tax of $110 per qualified beneficiary per day of noncompliance, the DOL can assess civil penalties, and beneficiaries can sue for statutory damages plus attorney's fees. Many states have "mini-COBRA" laws that extend similar continuation rights to employees of smaller employers, so check your state's requirements.

## Official references

- [DOL — COBRA Continuation Coverage](https://www.dol.gov/agencies/ebsa/laws-and-regulations/laws/cobra)
- [DOL — COBRA FAQs](https://www.dol.gov/agencies/ebsa/about-ebsa/our-activities/resource-center/faqs/cobra-continuation-health-coverage)
- [IRS — COBRA Excise Tax](https://www.irs.gov/government-entities/federal-state-local-governments/cobra-excise-tax)
- [DOL — Health Plans & Benefits: COBRA](https://www.dol.gov/general/topic/health-plans/cobra)`,
    },
    {
      slug: "aca-affordable-care-act",
      title: "ACA: Affordable Care Act",
      category: "benefits",
      tags: ["ACA", "health coverage", "employer mandate", "1095-C"],
      isPublished: true,
      content: `The Affordable Care Act (ACA) reshaped employer health coverage obligations. For mid-size and larger employers, the centerpiece is the employer shared responsibility provision — commonly called the "pay or play" mandate — which requires offering affordable, minimum-value health coverage to full-time employees or paying a penalty. Smaller employers face fewer obligations but may benefit from tax credits.

## Who it applies to

The employer mandate applies to Applicable Large Employers (ALEs) — employers that averaged 50 or more full-time employees, including full-time equivalents, during the prior calendar year. A full-time employee works 30 or more hours per week (or 130 hours per month). Employers below 50 full-time equivalents are not subject to the mandate, although their coverage decisions affect employees' access to subsidized Marketplace coverage.

## What ALEs must do

An ALE must offer minimum essential coverage to at least 95% of its full-time employees and their dependents up to age 26. The coverage must be "affordable" — the employee's share of the self-only premium cannot exceed a percentage of household income that is adjusted annually — and must provide "minimum value," meaning it covers at least 60% of the plan's expected costs. If an ALE fails to offer coverage to enough employees and at least one full-time employee receives a premium tax credit in the Marketplace, the IRS can assess a penalty under Code section 4980H(a). If coverage is offered but is not affordable or does not provide minimum value, a larger per-employee penalty under 4980H(b) may apply.

## Reporting requirements

ALEs must file Forms 1094-C (transmittal) and 1095-C (per employee) with the IRS and furnish 1095-C statements to employees. Generally, statements to employees are due by January 31 of the year after the coverage year, and filings with the IRS by the end of February (paper) or the end of March (electronic). Self-insured employers also have reporting obligations under Code sections 6055 and 6056. The IRS enforces reporting through Letters 226-J, which propose penalties for noncompliance.

## Small employers

If you have fewer than 50 full-time equivalents, the mandate does not apply, but you may still choose to offer coverage through the SHOP Marketplace and may qualify for the small business health care tax credit. State laws may impose additional requirements, so confirm your obligations where you operate.

## Consequences of noncompliance

Penalties for failing to offer affordable, minimum-value coverage are indexed annually and can amount to thousands of dollars per full-time employee. Separately, failing to file correct 1095-C and 1094-C forms can trigger information-reporting penalties. Accurate tracking of hours, offers of coverage, and affordability is the core of ACA compliance.

## Official references

- [IRS — Affordable Care Act Tax Provisions for Employers](https://www.irs.gov/affordable-care-act/employers)
- [IRS — About Form 1095-C](https://www.irs.gov/forms-pubs/about-form-1095-c)
- [IRS — Employer Shared Responsibility Provisions](https://www.irs.gov/affordable-care-act/employers/employer-shared-responsibility-provisions)
- [IRS — About Form 1094-C](https://www.irs.gov/forms-pubs/about-form-1094-c)`,
    },
    {
      slug: "eeoc-equal-employment-opportunity",
      title: "EEOC: Equal Employment Opportunity",
      category: "discrimination",
      tags: ["EEOC", "discrimination", "Title VII", "charges"],
      isPublished: true,
      content: `Federal anti-discrimination laws enforced by the Equal Employment Opportunity Commission (EEOC) prohibit employment decisions based on race, color, religion, sex, national origin, age, disability, or genetic information. Even a single discriminatory decision — or an employee who believes they were retaliated against for complaining — can lead to an EEOC charge, a lawsuit, and significant damages.

## The laws and who they cover

Title VII of the Civil Rights Act of 1964 covers employers with 15 or more employees and prohibits discrimination based on race, color, religion, sex, or national origin. The Supreme Court's 2020 decision in Bostock v. Clayton County clarified that sex discrimination includes discrimination based on sexual orientation and gender identity. The ADA (15 or more employees) protects people with disabilities, and the ADEA (20 or more employees) protects workers aged 40 and older. The Equal Pay Act covers virtually all employers.

## Protected classes and prohibited conduct

In addition to hiring and firing decisions, the laws cover pay, promotions, assignments, discipline, and harassment. Harassment becomes unlawful when it is severe or pervasive enough to create a hostile work environment or when it results in a tangible employment action. Retaliation — punishing an employee for filing a charge, complaining about discrimination, or participating in an investigation — is itself a frequent basis for liability and is prohibited by every statute the EEOC enforces.

## Filing a charge and employer defenses

An employee must file a charge with the EEOC within 180 days of the alleged discrimination (extended to 300 days in states with a Fair Employment Practices agency). The EEOC notifies the employer of the charge, typically within 10 days, and the employer may be asked to respond with a position statement and documents. Common defenses include showing the action was taken for a legitimate, nondiscriminatory reason; that the policy is a bona fide occupational qualification (limited circumstances); or, for age claims, that the decision was based on a reasonable factor other than age.

## Remedies and damages

If the EEOC finds discrimination, it will attempt conciliation before litigation. Successful claims can recover back pay, reinstatement, compensatory damages for emotional distress, and punitive damages for malice or reckless indifference. Compensatory and punitive damages are capped by employer size: $50,000 for employers with 15-100 employees, $100,000 for 101-200, $200,000 for 201-500, and $300,000 for more than 500. Attorney's fees can also be awarded.

## Practical takeaways

Document employment decisions, apply policies consistently, respond promptly to internal complaints, and never punish employees for raising concerns. Many states have parallel anti-discrimination laws that apply to smaller employers and offer additional protections.

## Official references

- [EEOC — Overview of Laws Enforced by EEOC](https://www.eeoc.gov/employers/overview-eeoc-laws-enforced-eeoc)
- [EEOC — How to File a Charge](https://www.eeoc.gov/how-file-charge-employment-discrimination)
- [EEOC — Prohibited Employment Policies/Practices](https://www.eeoc.gov/prohibited-employment-policiespractices)
- [EEOC — Remedies for Employment Discrimination](https://www.eeoc.gov/remedies-employment-discrimination)`,
    },
    {
      slug: "irs-form-941-quarterly-filing",
      title: "IRS Form 941: Quarterly Filing",
      category: "filing",
      tags: ["Form 941", "payroll tax", "quarterly filing", "IRS"],
      isPublished: true,
      content: `IRS Form 941 is the quarterly payroll tax return that most employers use to report federal income tax withheld from employees and the employer and employee shares of Social Security and Medicare taxes. Filing it correctly and on time is one of the most routine — and most penalized — obligations a small business faces.

## Who must file

You must file Form 941 each quarter if you pay wages subject to federal income tax withholding, Social Security, or Medicare taxes. Most employers file quarterly. Seasonal employers and certain small employers may be eligible to file Form 944 annually instead, agricultural employers file Form 943, and household employers report on Schedule H. If your total tax liability for the year is small, you may qualify to file annually.

## Deadlines

Form 941 is due by the last day of the month following the end of each calendar quarter: April 30 (Q1), July 31 (Q2), October 31 (Q3), and January 31 (Q4). If you file electronically, you generally get an automatic extension to the 10th of the following month. These filing deadlines are separate from your payroll tax deposit schedule — deposits of withheld taxes are generally due monthly or semiweekly, and depositing late triggers its own penalty.

## How to file

File Form 941 electronically using IRS e-file, which is required if you file 250 or more forms per year and recommended for everyone. The form asks for the number of employees, total wages and tips, federal income tax withheld, and the Social Security and Medicare tax computations, including adjustments for tip income, sick pay, or third-party payers. Correct mistakes on a previously filed quarter using Form 941-X rather than altering the original return.

## Penalties

The IRS aggressively enforces payroll deadlines because withheld income and payroll taxes are treated as trust funds. Failure-to-file penalties run 5% of the unpaid tax per month, up to 25%, and failure-to-pay penalties run 0.5% per month, also capped at 25%, plus interest on both. Willfully failing to pay over withheld taxes can trigger the Trust Fund Recovery Penalty — a personal, dollar-for-dollar penalty (up to 100% of the unpaid tax) that can be assessed against owners, officers, and any responsible person who acted willfully.

## Official references

- [IRS — About Form 941](https://www.irs.gov/forms-pubs/about-form-941)
- [IRS — Instructions for Form 941](https://www.irs.gov/instructions/i941)
- [IRS — Employment Tax Due Dates](https://www.irs.gov/businesses/small-businesses-self-employed/employment-tax-due-dates)
- [IRS — Trust Fund Recovery Penalty](https://www.irs.gov/businesses/small-businesses-self-employed/trust-fund-recovery-penalty)`,
    },
  ];

  for (const article of knowledgeArticles) {
    await prisma.knowledgeArticle.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        category: article.category,
        content: article.content,
        tags: article.tags,
        isPublished: article.isPublished,
      },
      create: article,
    });
  }
  console.log(`✅ Seeded ${knowledgeArticles.length} knowledge base articles`);

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
