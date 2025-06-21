"use client";

//import { signOut } from "better-auth/api";
import { useState } from "react";
import { useSession } from "~/lib/auth-client";
import { signIn } from "~/lib/auth-client";
import { signOut } from "~/lib/auth-client";

import { api } from "~/trpc/react";

export function HomePage() {
  const session = useSession()
  console.log(session)

  // const handlePdf = () => {
  //   return api.pdfProcess.upload.useQuery();
  // };

  return (
    <>
    
    <div className="flex h-50 w-screen items-center justify-center bg-red-400">
      <input type="file" placeholder="input pdf here" />
    </div>

    <button
      onClick={() => {
        signIn.social({ provider: "google" });
        console.log(session);
      }}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Sign In with Google
    </button>

    <button
      onClick={() => {
        signOut();
        console.log(session);
      }}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-blue-700"
    >
      Sign Out
    </button>
    </>
  );
}
