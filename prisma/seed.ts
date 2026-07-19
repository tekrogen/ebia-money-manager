import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function dollars(amount: number): bigint {
  return BigInt(Math.round(amount * 100));
}

async function main() {
  await db.auditEvent.deleteMany();
  await db.notification.deleteMany();
  await db.payment.deleteMany();
  await db.paymentIntent.deleteMany();
  await db.runwayItem.deleteMany();
  await db.statement.deleteMany();
  await db.promoPeriod.deleteMany();
  await db.creditCard.deleteMany();
  await db.financialAccount.deleteMany();
  await db.householdMembership.deleteMany();
  await db.householdMember.deleteMany();
  await db.userPreference.deleteMany();
  await db.household.deleteMany();
  await db.user.deleteMany();

  const user = await db.user.create({
    data: {
      email: "marti@example.com",
      name: "Marti Dolce",
      preference: {
        create: { displayCurrency: "USD" },
      },
    },
  });

  const household = await db.household.create({
    data: {
      name: "Dolce Household",
      memberships: {
        create: {
          userId: user.id,
          role: "owner",
        },
      },
    },
  });

  const marti = await db.householdMember.create({
    data: {
      householdId: household.id,
      displayName: "Marti",
      userId: user.id,
      role: "owner",
    },
  });

  const bob = await db.householdMember.create({
    data: {
      householdId: household.id,
      displayName: "Bob",
      userId: null,
      role: "member",
    },
  });

  const amazon = await db.creditCard.create({
    data: {
      householdId: household.id,
      ownerMemberId: null,
      attribution: "shared",
      issuerKey: "chase",
      name: "Amazon Visa",
      network: "Visa",
      lastFour: "1042",
      currency: "USD",
      creditLimitMinor: dollars(10000),
      currentBalanceMinor: dollars(8097.69),
      statementBalanceMinor: dollars(8097.69),
      minimumPaymentMinor: dollars(162),
      regularAprBps: 2274,
      paymentDueDay: 4,
      dataSource: "manual",
      syncStatus: "manual",
    },
  });

  const bestBuy = await db.creditCard.create({
    data: {
      householdId: household.id,
      ownerMemberId: marti.id,
      attribution: "member",
      issuerKey: "citi",
      name: "Best Buy/CitiBank Visa",
      network: "Visa",
      lastFour: "5519",
      currency: "USD",
      creditLimitMinor: dollars(4600),
      currentBalanceMinor: dollars(3166.28),
      statementBalanceMinor: dollars(3166.28),
      minimumPaymentMinor: dollars(0),
      regularAprBps: 1990,
      paymentDueDay: 19,
      dataSource: "manual",
      syncStatus: "manual",
      promoPeriods: {
        create: {
          promoAprBps: 0,
          regularAprBpsAfter: 1990,
          startsOn: "2025-09-05",
          endsOn: "2027-09-05",
          shelteredBalanceMinor: dollars(3166.28),
          status: "active",
        },
      },
    },
  });

  const usBankBob = await db.creditCard.create({
    data: {
      householdId: household.id,
      ownerMemberId: bob.id,
      attribution: "member",
      issuerKey: "usbank",
      name: "US Bank Shield",
      network: "Visa",
      lastFour: "8831",
      currency: "USD",
      creditLimitMinor: dollars(10000),
      currentBalanceMinor: dollars(6513),
      statementBalanceMinor: dollars(6513),
      minimumPaymentMinor: dollars(130),
      regularAprBps: 1990,
      paymentDueDay: 14,
      dataSource: "manual",
      syncStatus: "manual",
      promoPeriods: {
        create: {
          promoAprBps: 0,
          regularAprBpsAfter: 1990,
          startsOn: "2025-11-06",
          endsOn: "2027-11-06",
          shelteredBalanceMinor: dollars(6513),
          status: "active",
        },
      },
    },
  });

  const usBankMarti = await db.creditCard.create({
    data: {
      householdId: household.id,
      ownerMemberId: marti.id,
      attribution: "member",
      issuerKey: "usbank",
      name: "US Bank Shield",
      network: "Visa",
      lastFour: "2201",
      currency: "USD",
      creditLimitMinor: dollars(13000),
      currentBalanceMinor: dollars(6078.88),
      statementBalanceMinor: dollars(6078.88),
      minimumPaymentMinor: dollars(121),
      regularAprBps: 1899,
      paymentDueDay: 22,
      dataSource: "manual",
      syncStatus: "manual",
    },
  });

  const statementSeeds = [
    {
      card: amazon,
      periods: [
        {
          periodStart: "2026-05-05",
          periodEnd: "2026-06-04",
          closingBalanceMinor: dollars(7920.15),
          minimumPaymentMinor: dollars(158),
          paymentDueDate: "2026-06-04",
        },
        {
          periodStart: "2026-06-05",
          periodEnd: "2026-07-04",
          closingBalanceMinor: dollars(8097.69),
          minimumPaymentMinor: dollars(162),
          paymentDueDate: "2026-07-04",
        },
      ],
    },
    {
      card: bestBuy,
      periods: [
        {
          periodStart: "2026-05-20",
          periodEnd: "2026-06-19",
          closingBalanceMinor: dollars(3201.4),
          minimumPaymentMinor: dollars(0),
          paymentDueDate: "2026-06-19",
        },
        {
          periodStart: "2026-06-20",
          periodEnd: "2026-07-19",
          closingBalanceMinor: dollars(3166.28),
          minimumPaymentMinor: dollars(0),
          paymentDueDate: "2026-07-19",
        },
      ],
    },
    {
      card: usBankBob,
      periods: [
        {
          periodStart: "2026-05-15",
          periodEnd: "2026-06-14",
          closingBalanceMinor: dollars(6480),
          minimumPaymentMinor: dollars(130),
          paymentDueDate: "2026-06-14",
        },
        {
          periodStart: "2026-06-15",
          periodEnd: "2026-07-14",
          closingBalanceMinor: dollars(6513),
          minimumPaymentMinor: dollars(130),
          paymentDueDate: "2026-07-14",
        },
      ],
    },
    {
      card: usBankMarti,
      periods: [
        {
          periodStart: "2026-05-23",
          periodEnd: "2026-06-22",
          closingBalanceMinor: dollars(5990.12),
          minimumPaymentMinor: dollars(120),
          paymentDueDate: "2026-06-22",
        },
        {
          periodStart: "2026-06-23",
          periodEnd: "2026-07-22",
          closingBalanceMinor: dollars(6078.88),
          minimumPaymentMinor: dollars(121),
          paymentDueDate: "2026-07-22",
        },
      ],
    },
  ];

  for (const seed of statementSeeds) {
    for (const period of seed.periods) {
      await db.statement.create({
        data: {
          userId: user.id,
          cardId: seed.card.id,
          currency: seed.card.currency,
          periodStart: period.periodStart,
          periodEnd: period.periodEnd,
          closingBalanceMinor: period.closingBalanceMinor,
          minimumPaymentMinor: period.minimumPaymentMinor,
          paymentDueDate: period.paymentDueDate,
          source: "manual",
        },
      });
    }
  }

  const checkingAccount = await db.financialAccount.create({
    data: {
      userId: user.id,
      name: "Chase Checking ••4821",
      currency: "USD",
    },
  });

  console.log("Seeded demo user", user.email);
  console.log("Household", household.id);
  console.log("Shared card", amazon.id);
  console.log("Statements", statementSeeds.length * 2);
  console.log("Checking account", checkingAccount.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
