import TopNav from "@/components/mentor/layout/TopNav";
import Sidebar from "@/components/mentor/layout/Sidebar";
import { MentorProfileProvider } from "@/contexts/MentorProfileContext";
import { ModalProvider } from "@/contexts/ModalContext";
import RoleGuard from "@/components/auth/RoleGuard";

const MENTOR_ALLOWED_ROLES = ["mentor", "admin"] as const;

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={MENTOR_ALLOWED_ROLES}>
      <ModalProvider>
        <MentorProfileProvider>
          <div className="h-screen bg-[#F5F7FA] overflow-y-auto overflow-x-hidden">
            <TopNav />
            <Sidebar />
            <main className="min-h-screen px-4 pb-8 pt-20 sm:px-6 lg:pl-72 lg:pr-8">
              {children}
            </main>
          </div>
        </MentorProfileProvider>
      </ModalProvider>
    </RoleGuard>
  );
}
