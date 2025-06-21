import Link from "next/link";

import { api, HydrateClient } from "~/trpc/server";
import { HomePage } from "./_components/home-page";

export default async function Home() {
  return <HomePage />;
}
