import Layout from "@/components/layout/Layout";
import UserEditForm from "@/components/user/UserEditForm";
import { getRentedBooksForUser } from "@/entities/book";
import { BookType } from "@/entities/BookType";
import { prisma } from "@/entities/db";
import { getUser } from "@/entities/user";
import { UserType } from "@/entities/UserType";
import {
  convertDateToDayString,
  extendDays,
  replaceBookStringDate,
  replaceUserDateString,
  sameDay,
} from "@/lib/utils/dateutils";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next/types";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";

type UserDetailPropsType = {
  user: UserType;
  books: Array<BookType>;
  extensionDays: number;
  deleteSafetySeconds: number;
};

export default function UserDetail({
  user,
  books,
  extensionDays,
  deleteSafetySeconds,
}: UserDetailPropsType) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [userData, setUserData] = useState(user);
  const [userBooks, setUserBooks] = useState(books);

  useEffect(() => {
    setUserData(user);
  }, [user]);

  if (!router.query.userid) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20 text-gray-400">
          ID nicht gefunden
        </div>
      </Layout>
    );
  }

  const userid = parseInt(
    Array.isArray(router.query.userid)
      ? router.query.userid[0]
      : router.query.userid,
  );

  const handleSaveButton = () => {
    console.log("Saving user ", userData);

    const { updatedAt, createdAt, ...savingUser } = userData;

    fetch("/api/user/" + userid, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(savingUser),
    })
      .then((res) => res.json())
      .then(() => {
        enqueueSnackbar(
          `Nutzer ${userData.firstName} ${userData.lastName} gespeichert`,
        );
        router.push("/user");
      });
  };

  const handleReturnBookButton = (bookid: number) => {
    console.log("Returning book ", bookid);

    fetch(`/api/book/${bookid}/user/${userid}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        enqueueSnackbar("Buch zurückgegeben, super!");
      });
  };

  const handleExtendBookButton = (bookid: number, book: BookType) => {
    const newbook = replaceBookStringDate(book) as any;
    const newDueDate = extendDays(new Date(), extensionDays);

    if (sameDay(newbook.dueDate, newDueDate)) {
      enqueueSnackbar(
        `Buch - ${book.title} - ist bereits bis zum maximalen Ende ausgeliehen`,
        { variant: "warning" },
      );
      return;
    }

    newbook.dueDate = newDueDate.toDate();
    newbook.renewalCount = newbook.renewalCount + 1;
    delete newbook.user;

    fetch("/api/book/" + bookid, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newbook),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        enqueueSnackbar("Buch verlängert, super!");
      });

    setUserBooks((prev) =>
      prev.map((b) =>
        b.id === bookid
          ? {
              ...b,
              renewalCount: b.renewalCount + 1,
              dueDate: newDueDate.toDate(),
            }
          : b,
      ),
    );
  };

  const handleDeleteButton = () => {
    console.log("Deleting user ", userData);

    fetch("/api/user/" + userid, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Delete operation performed on ", userid, data);
        enqueueSnackbar("Nutzer gelöscht!");
        router.push("/user");
      });
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <UserEditForm
          user={userData}
          books={userBooks}
          setUserData={setUserData}
          deleteUser={handleDeleteButton}
          deleteSafetySeconds={deleteSafetySeconds}
          saveUser={handleSaveButton}
          returnBook={handleReturnBookButton}
          extendBook={handleExtendBookButton}
          initiallyEditable={true}
        />
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const extensionDays = parseInt(
    process.env.EXTENSION_DURATION_DAYS || "14",
    10,
  );
  const deleteSafetySeconds = parseInt(
    process.env.DELETE_SAFETY_SECONDS || "3",
    10,
  );

  if (!context.query.userid) return { props: {} };

  const dbuser = await getUser(
    prisma,
    parseInt(context.query.userid as string),
  );

  if (!dbuser) {
    return { notFound: true };
  }

  const user = replaceUserDateString(dbuser);

  if (!("id" in user) || !user.id) return;

  const allBooks = (await getRentedBooksForUser(prisma, user.id)) as any;

  const books = allBooks.map((b: BookType) => {
    const newBook = { ...b } as any;
    newBook.createdAt = convertDateToDayString(b.createdAt);
    newBook.updatedAt = convertDateToDayString(b.updatedAt);
    newBook.rentedDate = b.rentedDate
      ? convertDateToDayString(b.rentedDate)
      : "";
    newBook.dueDate = b.dueDate ? convertDateToDayString(b.dueDate) : "";
    return newBook;
  });

  return { props: { user, books, extensionDays, deleteSafetySeconds } };
}
