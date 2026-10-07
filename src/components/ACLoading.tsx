import React from "react";

interface ACLoadingProps {
  text?: string;
}

export default function ACLoading({
  text = "Memuat dashboard...",
}: ACLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
      <div className="text-center">
        {/* Kipas AC */}
        <div className="relative w-24 h-24 mx-auto">
          {/* Lingkaran luar */}
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-white/10" />

          {/* Baling-baling */}
          <div
            className="absolute inset-[10px] animate-spin"
            style={{ animationDuration: "0.9s" }}
          >
            <div className="absolute left-1/2 top-1/2 w-7 h-10 -translate-x-1/2 -translate-y-[90%] rounded-full bg-blue-500 origin-bottom" />

            <div className="absolute left-1/2 top-1/2 w-7 h-10 -translate-x-1/2 -translate-y-[90%] rotate-90 rounded-full bg-blue-500 origin-bottom" />

            <div className="absolute left-1/2 top-1/2 w-7 h-10 -translate-x-1/2 -translate-y-[90%] rotate-180 rounded-full bg-blue-500 origin-bottom" />

            <div className="absolute left-1/2 top-1/2 w-7 h-10 -translate-x-1/2 -translate-y-[90%] rotate-[270deg] rounded-full bg-blue-500 origin-bottom" />
          </div>

          {/* Bagian tengah kipas */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white dark:bg-black border-4 border-blue-600 dark:border-blue-400 z-10" />

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 z-20" />
        </div>

        <h3 className="mt-5 text-base font-semibold text-slate-700 dark:text-white">
          {text}
        </h3>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Mohon tunggu sebentar...
        </p>
      </div>
    </div>
  );
}