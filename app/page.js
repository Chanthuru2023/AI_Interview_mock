"use client";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/dashboard");
  };

  return (
    <div>
      <h2>Welcome to MockInterview</h2>
      <Button onClick={handleClick}>Click</Button>
    </div>
  );
}
