import { Suspense } from "react";
import CallbackPage from "./CallbackPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Memuat callback...</div>}>
      <CallbackPage />
    </Suspense>
  );
}
