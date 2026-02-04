import Link from "next/link";
import BottomNav from "@/components/mentee/common/BottomNav";

export default function MenteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#F2F2F7] flex justify-center shadow-2xl h-screen overflow-hidden">
      <div className="mobile-container relative bg-white min-h-screen">
        <main className="pb-24 min-h-screen">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
