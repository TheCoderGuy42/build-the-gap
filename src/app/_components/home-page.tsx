"use client";

import { api } from "~/trpc/react";
import toast, { Toaster } from "react-hot-toast";

export function HomePage() {
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
      <Toaster />

      <div className="flex h-50 w-screen items-center justify-center bg-red-400">
        <input type="file" placeholder="input pdf here" onChange={handlePdf} />
      </div>
    </>
  );
}
