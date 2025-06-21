"use client";

//import { signOut } from "better-auth/api";
import { useState } from "react";
import { useSession } from "~/lib/auth-client";
import { signIn } from "~/lib/auth-client";
import { signOut } from "~/lib/auth-client";

import { api } from "~/trpc/react";
import toast, { Toaster } from "react-hot-toast";

export function HomePage() {
  const session = useSession();
  const isUserSignedIn = session.data ? true : false;
  if (isUserSignedIn) {
    const user = session.data?.user;
  }
  console.log(session);

  const { mutateAsync: getPresignedUrlAsync } =
    api.s3.getPresignedUrl.useMutation();
  const { mutateAsync: addPdfAsync } = api.pdf.add.useMutation();

  const handlePdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files![0];

    if (!file) {
      toast("no file selected!");
      return;
    }
    const filename = file.name;
    const contentType = file.type;

    const { signedUrl, key } = await getPresignedUrlAsync({
      filename: filename,
      contentType: contentType,
    });

    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    const quiz = await addPdfAsync({ s3Key: key });

    console.log(quiz);
  };

  return (
    <>
      <div className="flex h-50 w-screen items-center justify-center bg-red-400">
        <input type="file" placeholder="input pdf here" onChange={handlePdf} />
      </div>
      {isUserSignedIn ? (
        <button
          onClick={() => {
            signOut();
            console.log(session);
          }}
          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Sign Out
        </button>
      ) : (
        <button
          onClick={() => {
            signIn.social({ provider: "google" });
            console.log(session);
          }}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Sign In with Google
        </button>
      )}
    </>
  );
}
