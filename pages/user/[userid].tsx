import Layout from "@/components/layout/Layout";
import UserEditForm from "@/components/user/UserEditForm";
import { getRentedBooksForUser } from "@/entities/book";
import { BookType } from "@/entities/BookType";
import { prisma } from "@/entities/db";
import { getUser } from "@/entities/user";
import { UserType } from "@/entities/UserType";
import { getRentalConfig } from "@/lib/config/rentalConfig";
import {
  convertDateToDayString,
  replaceUserDateString,
} from "@/lib/utils/dateutils";
import { calcExtensionDueDate, extendBookApi } from "@/lib/utils/rentalUtils";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type UserDetailPropsType = {
  user: UserType;
  books: Array<BookType>;
  extensionDays: number;
  maxExtensions: number;
  deleteSafetySeconds: number;
};

export default function UserDetail({
  user,
  books,
  extensionDays,
  maxExtensions,
  deleteSafetySeconds,
}: UserDetailPropsType) {
  const router = useRouter();

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
        toast.success(
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
        toast.success("Buch zurückgegeben, super!");
      });
  };

  const handleExtendBookButton = async (bookid: number, book: BookType) => {
    const newDueDate = calcExtensionDueDate(extensionDays);
    const result = await extendBookApi(bookid, book, newDueDate);

    if (result === "already_extended") {
      toast.info(
        `Buch - ${book.title} - ist bereits bis zum maximalen Ende ausgeliehen`,
      );
      return;
    }

    if (result === "error") {
      toast.error(
        "Leider hat es nicht geklappt, der Server ist aber erreichbar",
      );
      return;
    }

    toast.success("Buch verlängert, super!");
    // This page manages its own book list (no SWR), so update local state manually.
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
        toast.success("Nutzer gelöscht!");
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
  const { extensionDays, maxExtensions } = getRentalConfig();
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

  return {
    props: { user, books, extensionDays, maxExtensions, deleteSafetySeconds },
  };
}
