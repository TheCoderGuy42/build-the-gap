"use client";

import { api } from "~/trpc/react";
import toast, { Toaster } from "react-hot-toast";

export function HomePage() {
  const { mutate: getPresignedUrl } = api.s3.getPresignedUrl.useMutation();
  const { mutate: addPdf } = api.pdf.add.useMutation();

  const handlePdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files![0];

    if (!file) {
      toast("no file selected!");
      return;
    }
    const filename = file.name;
    const contentType = file.type;

    const url = getPresignedUrl({
      filename: filename,
      contentType: contentType,
    });
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
