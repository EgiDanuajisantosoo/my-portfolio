import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const hasToken = cookieStore.get("spotify_access_token");

  if (!hasToken) {
    redirect("/api/login");
  }

  redirect("/portfolio");
}
