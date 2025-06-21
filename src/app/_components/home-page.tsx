"use client";

//import { signOut } from "better-auth/api";
import { createRef, useEffect, useRef, useState } from "react";
import { useSession } from "~/lib/auth-client";
import { signIn } from "~/lib/auth-client";
import { signOut } from "~/lib/auth-client";

import { api } from "~/trpc/react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import React from "react";

export function HomePage() {
  const { mutateAsync: getPresignedUrlAsync } =
    api.s3.getPresignedUrl.useMutation();

  const { mutateAsync: addPdfAsync } = api.pdf.add.useMutation({
    onError(error) {
      toast.error("This error occured during pdf processing " + error);
    },
  });

  const { mutateAsync: addHtmlAsync } = api.html.add.useMutation();

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

  const handleHtml = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      console.log("trying url " + e.currentTarget.value);
      new URL(e.currentTarget.value);
    } catch {
      console.log("invalid url");
      return;
    }

    console.log("loading quiz " + e.currentTarget.value);
    const quiz = await addHtmlAsync(e.currentTarget.value);

    console.log(quiz);
  };

  const handleHtmlLink = async (e: string) => {
    try {
      console.log("trying url " + e);
      new URL(e);
    } catch {
      console.log("invalid url");
      return;
    }

    console.log("loading quiz " + e);
    const quiz = await addHtmlAsync(e);

    console.log(quiz);
  };

  const linkInput = new URLSearchParams(window.location.search).get("link")!;

  useEffect(() => {
    handleHtmlLink(linkInput);
  }, []);

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="flex flex-row gap-3 border">
        <Input type="file" id="picture" onChange={handlePdf} />
        <Input type="text" placeholder="input link here" onInput={handleHtml} value={linkInput == null ? "" : linkInput} />
        <AuthButton />
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
