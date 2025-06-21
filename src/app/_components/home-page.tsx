"use client";

//import { signOut } from "better-auth/api";
import { useState } from "react";
import { useSession } from "~/lib/auth-client";
import { signIn } from "~/lib/auth-client";
import { signOut } from "~/lib/auth-client";

import { api } from "~/trpc/react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function HomePage() {
  const { mutateAsync: getPresignedUrlAsync } =
    api.s3.getPresignedUrl.useMutation();

  const {
    mutateAsync: addPdfAsync,
    isPending: isPdfLoading,
    isSuccess: pdfLoaded,
  } = api.pdf.add.useMutation();

  const {
    mutateAsync: addHtmlAsync,
    isPending: isHtmlLoading,
    isSuccess: htmlLoaded,
  } = api.html.add.useMutation();

  const handlePdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files![0];
    if (!file) {
      toast("no file selected!");
      return;
    }

    const filename = file.name;
    const contentType = file.type;

    const processingPromise = (async () => {
      const { signedUrl, key } = await getPresignedUrlAsync({
        filename: file.name,
        contentType: file.type,
      });
      await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      await addPdfAsync({ s3Key: key });
    })();

    toast.promise(processingPromise, {
      loading: "Processing PDF...",
      success: "PDF processed!",
      error: (err) => `PDF processing failed: ${err.message}`, // You can use a function for dynamic messages
    });
  };

  const handleHtml = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.currentTarget.value;
    try {
      console.log("trying url " + url);
      new URL(url);
    } catch {
      console.log("invalid url");
      return;
    }

    toast.promise(addHtmlAsync(url), {
      loading: "Processing html...",
      success: "html processed!",
      error: (err) => `html processing failed: ${err.message}`,
    });
  };

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="m-4 flex flex-row gap-3">
        <Input
          type="file"
          id="picture"
          onChange={handlePdf}
          className="w-auto"
        />
        <Input
          type="text"
          placeholder="input link here"
          onInput={handleHtml}
          className="flex-grow"
        />

        <div className="justify-end">
          <AuthButton />
        </div>
      </div>
    </>
  );
}

const AuthButton = () => {
  const session = useSession();
  const isUserSignedIn = session.data ? true : false;
  if (isUserSignedIn) {
    const user = session.data?.user;
  }
  console.log(session);

  return (
    <>
      {isUserSignedIn ? (
        <Button variant="outline" onClick={() => signOut()}>
          {" "}
          sign out
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={() => signIn.social({ provider: "google" })}
        >
          sign in
        </Button>
      )}
    </>
  );
};
