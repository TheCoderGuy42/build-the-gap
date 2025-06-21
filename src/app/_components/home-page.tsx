"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function HomePage() {
  // const handlePdf = () => {
  //   return api.pdfProcess.upload.useQuery();
  // };

  return (
    <div className="flex h-50 w-screen items-center justify-center bg-red-400">
      <input type="file" placeholder="input pdf here" />
    </div>
  );
}
