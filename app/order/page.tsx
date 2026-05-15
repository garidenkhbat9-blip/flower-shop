"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Энэ хуудас /delivery рүү автоматаар чиглүүлнэ
export default function OrderQueueRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/delivery");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-[#111] rounded-full animate-spin"></div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Чиглүүлж байна...</p>
      </div>
    </div>
  );
}
