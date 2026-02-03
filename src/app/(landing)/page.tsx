import LoginForm from "@/components/landing/LoginForm";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-4xl">
        <div className="text-center space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest mb-2">
                Unified Learning Platform
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none">
                SeolStudy
                <span className="text-blue-600">.</span>
            </h1>
            <p className="text-lg text-gray-500 font-medium max-w-xl mx-auto leading-relaxed">
                멘토링과 체계적인 학습 관리를 하나로.<br className="hidden md:block"/>
                당신의 목표 달성을 위한 최적의 파트너.
            </p>
        </div>

        <LoginForm />
      </div>

      <footer className="absolute bottom-6 text-center">
        <p className="text-xs text-gray-400 font-medium">&copy; 2026 SeolStudy Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
