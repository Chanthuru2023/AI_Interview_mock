"use client";
import React, { useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link"; // Import the Link component from Next.js

function Header() {
  const path = usePathname();

  useEffect(() => {
    console.log(path);
  }, [path]);

  return (
    <div className="flex p-4 items-center justify-between bg-gradient-to-r from-purple-500 to-indigo-600 shadow-xl text-white">
      {/* Title */}
      <div className="flex items-center">
        <span className="text-lg font-semibold">AI Mock Interview</span>
      </div>

      {/* Navigation */}
      <ul className="hidden md:flex gap-6">
        <li>
          <Link href="/dashboard" className={`hover:text-yellow-300 hover:font-bold transition-all cursor-pointer ${path == "/dashboard" ? "text-yellow-300 font-bold border-b-2 border-yellow-300" : ""}`}>
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/dashboard/question" className={`hover:text-yellow-300 hover:font-bold transition-all cursor-pointer ${path == "/dashboard/other/question" ? "text-yellow-300 font-bold border-b-2 border-yellow-300" : ""}`}>
            Question
          </Link>
        </li>
        <li>
          <Link href="/dashboard/upgrade" className={`hover:text-yellow-300 hover:font-bold transition-all cursor-pointer ${path == "/dashboard/upgrade" ? "text-yellow-300 font-bold border-b-2 border-yellow-300" : ""}`}>
            Upgrade
          </Link>
        </li>
        <li>
          <Link href="/dashboard/how" className={`hover:text-yellow-300 hover:font-bold transition-all cursor-pointer ${path == "/dashboard/other/how" ? "text-yellow-300 font-bold border-b-2 border-yellow-300" : ""}`}>
            How it Works
          </Link>
        </li>
      </ul>

      {/* User Button */}
      <UserButton />
    </div>
  );
}

export default Header;
