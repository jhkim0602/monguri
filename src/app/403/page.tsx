import Image from "next/image";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-blue-100/45 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-orange-100/45 blur-3xl sm:h-96 sm:w-96" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10 sm:px-8 sm:py-14">
        <section className="w-full rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-[0_24px_80px_-24px_rgba(120,53,15,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="order-2 space-y-4 text-center lg:order-1 lg:space-y-5 lg:text-left">
              <p className="inline-flex items-center rounded-full border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 text-xs font-bold tracking-wider text-amber-700">
                ERROR 403
              </p>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                이 페이지에 접근할
                <br />
                권한이 없습니다
              </h1>
              <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base lg:mx-0">
                현재 로그인된 계정 권한으로는 이 경로를 열 수 없습니다. 다른
                메뉴로 이동하거나 계정을 다시 확인해 주세요.
              </p>

              <div className="flex flex-col items-stretch justify-center gap-3 pt-2 sm:flex-row lg:justify-start">
                <Link
                  href="/landing"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-amber-200 transition hover:bg-amber-600"
                >
                  <ShieldAlert className="h-4 w-4" />
                  로그인 페이지로 이동
                </Link>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative mx-auto w-full max-w-[240px] sm:max-w-[300px] lg:max-w-[360px]">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-200/60 to-orange-200/45 blur-3xl" />
                <Image
                  src="/images/mascot_403.png"
                  alt="접근이 제한된 설스터디 마스코트"
                  width={1481}
                  height={2001}
                  priority
                  className="relative h-auto w-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
