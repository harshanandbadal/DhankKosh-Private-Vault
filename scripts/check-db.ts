import { prisma } from "../src/lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    include: {
      bankAccounts: true,
      creditCards: true,
      p2pContacts: true,
      physicalAssets: true,
      giftCards: true,
      transactions: true,
    },
  });
  console.log("Current Users Count:", users.length);
  for (const u of users) {
    console.log(`User: ${u.salutation} ${u.name} (${u.email}) [id: ${u.id}]`);
    console.log(`- Bank Accounts: ${u.bankAccounts.length}`);
    console.log(`- Credit Cards: ${u.creditCards.length}`);
    console.log(`- P2P Contacts: ${u.p2pContacts.length}`);
    console.log(`- Physical Assets: ${u.physicalAssets.length}`);
    console.log(`- Gift Cards: ${u.giftCards.length}`);
    console.log(`- Transactions: ${u.transactions.length}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
