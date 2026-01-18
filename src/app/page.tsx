import { redirect } from "next/navigation";

export default function Home() {
  redirect("/api/login");
  return null;
}
