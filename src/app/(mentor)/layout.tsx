
export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidenav Placeholder */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">Mentor Hub</h1>
        </div>
        <nav className="px-4 space-y-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-md font-medium">대시보드</div>
            <div className="p-2 text-gray-600 hover:bg-gray-50 rounded-md">학생 관리</div>
            <div className="p-2 text-gray-600 hover:bg-gray-50 rounded-md">수업 일정</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
