import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const user1 = await prisma.user.create({
    data: {
      id: 1000,
      lastName: "Mustermann",
      firstName: "Max",
      schoolGrade: "1",
      schoolTeacherName: "Minnie",
      eMail: "max.mustermann@email.de",
      active: true,
    },
  });
  const book1 = await prisma.book.create({
    data: {
      id: 1000,
      rentalStatus: "available",
      rentedDate: new Date(),
      dueDate: new Date(),
      renewalCount: 0,
      title: "Testbuch",
      subtitle: "Untertitel vom Testbuch",
      author: "Mickey Mouse",
      topics: "",
      imageLink: "",
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
