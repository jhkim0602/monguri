import TopNav from "@/components/mentor/layout/TopNav";
import Sidebar from "@/components/mentor/layout/Sidebar";
import { ModalProvider } from "@/contexts/ModalContext";

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModalProvider>
      <div className="h-screen bg-[#F5F7FA] overflow-y-auto overflow-x-hidden">
        <TopNav />
        {/* TopNav is fixed, so Sidebar needs to be below it? 
            Or Sidebar is also fixed left.
            Let's adjust layout structure: 
            Sidebar is fixed left (w-64). Header is fixed top (h-16).
            Main content should have ml-64 (sidebar width) and pt-16 (header height).
        */}
        <Sidebar />

        <main className="pt-20 pl-72 pr-8 pb-8 min-h-screen">{children}</main>
      </div>
    </ModalProvider>
  );
}
