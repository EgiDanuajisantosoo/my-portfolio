"use client";

import { useTransition } from "react";
import { updateWatchingStatus } from "@/app/action/updateWatchingStatus";

export default function WatchingStatusSelect({
  id,
  current,
}: {
  id: number;
  current: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData: FormData) => {
        startTransition(() => updateWatchingStatus(formData));
      }}
    >
      <input type="hidden" name="id" value={id} />

      <select
        name="watching_status"
        defaultValue={current || ""}
        className="w-full rounded-lg bg-white/10 border border-white/20 
                   text-xs text-gray-200 px-2 py-1 hover:bg-white/15"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        disabled={isPending}
      >
        <option value="">Pilih status</option>
        <option value="on-going">On-Going</option>
        <option value="selesai">Selesai</option>
        <option value="draft">Draft</option>
      </select>
    </form>
  );
}
