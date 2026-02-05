"use client";

import { notFound } from "next/navigation";
import { COLUMN_ARTICLES } from "@/constants/mentee/columns";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type ArticleSection = {
  title?: string;
  paragraphs: string[];
  list?: string[];
  image?: string;
};

type ArticleContent = {
  hero: string;
  sections: ArticleSection[];
};

const CONTENT_BY_SLUG: Record<string, ArticleContent> = {
  "ten-minutes-habit": {
    hero: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1400&q=80",
    sections: [
      {
        paragraphs: [
          "안녕하세요. 서울대학교에 재학 중인 윤서영입니다.",
          "저는 고등학교 3년 동안 꾸준히 공부하며 전교 1등을 유지했습니다.",
          "하지만 처음부터 특별한 공부법이 있었던 건 아니에요.",
          "공부를 잘하려면 반드시 오래 앉아 있어야 한다고 믿었지만, 시간만 늘린다고 성적이 오르지는 않더군요.",
          "저를 바꾼 건, 하루하루의 짧은 10분을 어떻게 쓰느냐였습니다.",
          "처음에는 ‘자투리 시간’이란 말을 대수롭지 않게 생각했습니다.",
          "쉬는 시간, 점심시간, 수업이 끝난 직후 10분 정도로 무엇을 할 수 있을까 싶었죠.",
          "그런데 어느 날, 쉬는 시간에 교과서를 다시 읽고 복습을 해보니 생각보다 머릿속이 훨씬 정리된다는 걸 느꼈어요.",
          "그날부터 작은 습관을 하나씩 만들기 시작했습니다.",
        ],
        image:
          "https://images.unsplash.com/photo-1457694587812-e8bf29a43845?w=1200&q=80",
      },
      {
        title: "자투리 시간, 가장 효율적인 공부 시간",
        paragraphs: [
          "자투리 시간의 핵심은 ‘복습’입니다.",
          "방금 배운 내용을 바로 복습하면, 같은 공부라도 효과가 완전히 다릅니다.",
          "예를 들어 한국사 수업이 끝난 직후 10분만 교과서를 다시 읽어보세요. 그 10분이면 충분합니다.",
          "그런데 학교가 끝나고 집에서 복습하려면 30분 이상 걸리고 집중도 잘 되지 않습니다.",
          "기억이 생생할 때 복습하면 훨씬 짧은 시간으로도 내용이 오래 남습니다.",
          "수학도 마찬가지예요.",
          "‘수업이 끝나면 교과서 문제를 진도에 맞춰 풀어보기’라는 작은 규칙을 세워보세요.",
          "쉬는 시간 10분 동안이라도 방금 배운 예제를 풀어보면, 개념이 훨씬 단단하게 잡힙니다.",
          "하루 7교시 기준으로 생각해보면, 수업마다 쉬는 시간 10분을 복습에 쓰는 건 수업이 끝난 뒤 30분씩 복습하는 것과 같습니다.",
          "30분×7교시, 무려 3시간 반의 공부 시간을 앞당기는 셈이죠.",
          "자투리 시간은 짧지만, 그 효율은 하루의 흐름을 완전히 바꿉니다.",
        ],
        image:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80",
      },
      {
        title: "독하게 마음먹기, 그러나 작게 시작하기",
        paragraphs: [
          "물론 말처럼 쉽지 않습니다.",
          "쉬는 시간에는 잠시 눈을 붙이고 싶고, 친구들과 웃으며 이야기하는 게 훨씬 즐겁죠.",
          "그 마음, 너무 잘 압니다. 저도 그랬어요.",
          "하지만 그 짧은 순간을 어떻게 쓰느냐가 하루를, 그리고 성적을 바꿉니다.",
          "공부를 잘하는 학생과 그렇지 않은 학생의 차이는 바로 ‘독하게 마음을 먹었냐’에 있습니다.",
          "수업 시간에 집중하고, 야자 시간에 딴짓하지 않으며, 급식실 줄을 설 때 단어를 외우는 것, 이런 사소한 순간들의 누적이 성적을 바꿉니다.",
          "하지만 처음부터 모든 걸 바꾸려고 하면 오래가지 않습니다.",
          "대신 오늘부터 하나만 정해보세요.",
        ],
        list: [
          "쉬는 시간 10분 복습하기",
          "급식실 줄 설 때 영어 단어 한 세트 외우기",
          "등교길에 암기 노트 보기",
        ],
      },
      {
        title: "꾸준함은 완벽함보다 강하다",
        paragraphs: [
          "많은 학생들이 “계획을 세우는 건 잘하는데 지키질 못한다”고 말합니다.",
          "하지만 공부에서 중요한 건 ‘완벽한 계획’이 아니라 꾸준히 이어지는 실행입니다.",
          "자투리 시간을 활용하는 습관이 생기면, 굳이 공부 계획을 빽빽하게 채우지 않아도 자연스럽게 루틴이 만들어집니다.",
          "쉬는 시간에 복습하고, 수업이 끝나면 바로 다음 과목 준비를 하는 것만으로도 공부의 리듬이 생깁니다.",
          "처음엔 10분이 전부일지 몰라도, 그 시간이 쌓이면 하루가 달라지고, 하루가 달라지면 결국 성적이 달라집니다.",
          "공부는 긴 시간을 버티는 일이 아니라, 짧은 시간을 모으는 일입니다.",
          "성적을 바꾸는 건 긴 시간이 아니라, 마음먹은 10분입니다.",
          "오늘 쉬는 시간 10분, 그 시간부터 한번 바꿔보세요.",
        ],
      },
    ],
  },
  "dont-give-up": {
    hero: "https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=1400&q=80",
    sections: [
      {
        paragraphs: [
          "공부가 하기 싫은 날은 누구에게나 있습니다. 컨디션이 나쁘고, 마음이 무거울 때는 책상에 앉는 것 자체가 부담이 되죠.",
          "그럴수록 중요한 건 ‘오늘을 버리는가, 오늘을 최소로 지키는가’입니다.",
          "무너진 하루는 회복에 두 배의 시간이 들지만, 지켜낸 하루는 내일의 의지를 만들어요.",
        ],
      },
      {
        title: "의지를 믿지 말고 구조를 만든다",
        paragraphs: [
          "의지는 매일 일정하지 않습니다. 대신 구조는 흔들리지 않습니다.",
          "공부가 하기 싫은 날은 목표를 낮추고, 구조를 단순하게 바꾸는 게 핵심이에요.",
        ],
        list: [
          "‘책상에 앉기’만 목표로 두기",
          "25분 집중 + 5분 휴식 한 세트만 완주하기",
          "오늘 할 일 3개 중 1개만 끝내기",
        ],
      },
      {
        title: "포기 대신 전환을 선택하기",
        paragraphs: [
          "완전히 놓기 전에, 과목을 바꿔보세요. 머리가 안 돌아갈 때는 암기 과목으로 전환하는 게 효과적입니다.",
          "또는 장소를 바꾸는 것도 좋습니다. 도서관→카페, 방→거실처럼 환경을 바꾸면 흐름이 다시 살아납니다.",
        ],
      },
      {
        title: "오늘을 지키는 최소 행동",
        paragraphs: [
          "공부는 결과보다 ‘끊기지 않는 흐름’이 더 중요합니다.",
          "오늘의 최소 행동은 내일의 자신감을 만들어 줍니다.",
          "오늘은 10분이라도 좋습니다. 그 10분이 다음날 1시간을 만듭니다.",
        ],
      },
    ],
  },
  "productive-now-1": {
    hero: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1400&q=80",
    sections: [
      {
        paragraphs: [
          "지금 당장 생산적으로 공부하고 싶다면, ‘계획-집중-점검’의 짧은 구조를 만들어야 합니다.",
          "시간이 없을수록 길게 계획하는 대신 짧게 실행하는 방식이 효과적입니다.",
        ],
      },
      {
        title: "5분 계획",
        paragraphs: [
          "오늘 해야 할 일을 크게 3개만 적습니다.",
          "각 항목을 25분 단위로 쪼개면 부담이 확 줄어듭니다.",
        ],
      },
      {
        title: "25분 집중",
        paragraphs: [
          "한 번에 모든 것을 끝내려 하지 말고, 딱 25분만 몰입해보세요.",
          "타이머를 켜고, 핸드폰은 시야 밖에 두는 것부터 시작합니다.",
        ],
      },
      {
        title: "5분 점검",
        paragraphs: [
          "끝나자마자 방금 한 일을 3줄로 정리합니다.",
          "무엇이 어려웠는지 기록해두면 다음 공부가 훨씬 수월해집니다.",
        ],
      },
    ],
  },
  "my-curriculum": {
    hero: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1400&q=80",
    sections: [
      {
        paragraphs: [
          "공부는 누군가의 커리큘럼을 따라가기 전에, 나만의 커리큘럼을 만드는 순간부터 달라집니다.",
          "내 수준과 목표에 맞는 ‘중간 목표’가 있어야 흔들리지 않습니다.",
        ],
      },
      {
        title: "3단계 커리큘럼 만들기",
        paragraphs: [
          "첫째, 지금 실력을 진단합니다.",
          "둘째, 4주 단위 목표를 만듭니다.",
          "셋째, 하루 루틴으로 잘게 쪼갭니다.",
        ],
      },
      {
        title: "중간 목표가 주는 힘",
        paragraphs: [
          "중간 목표는 실패를 줄여줍니다.",
          "‘한 달 후 모의고사 1등급’처럼 멀리 있는 목표보다, ‘이번 주에 오답노트 10문제’ 같은 목표가 실천을 만듭니다.",
        ],
      },
      {
        title: "커리큘럼은 수정하는 것",
        paragraphs: [
          "완벽한 계획보다 중요한 건, 매주 수정하는 습관입니다.",
          "일주일에 한 번, 내가 놓친 부분을 확인하고 커리큘럼을 조정하세요.",
        ],
      },
    ],
  },
  "english-grade-strategy": {
    hero: "https://images.unsplash.com/photo-1456428199391-a3b1cb5e93ab?w=1400&q=80",
    sections: [
      {
        paragraphs: [
          "내신 영어는 범위가 좁고, 그만큼 정확도가 승부를 가릅니다.",
          "상위권은 ‘암기’가 아니라 ‘패턴’을 통해 문제를 풀어요.",
        ],
      },
      {
        title: "지문 구조를 먼저 본다",
        paragraphs: [
          "지문을 읽기 전에 제목과 첫 문장을 확인하고, 전개 구조를 예측합니다.",
          "문장마다 ‘주장-근거-예시’를 표시하면 오답이 줄어듭니다.",
        ],
      },
      {
        title: "오답은 문장 단위로",
        paragraphs: [
          "틀린 문제는 문장 단위로 다시 씁니다.",
          "왜 틀렸는지, 어떤 연결어를 놓쳤는지 적어두는 게 핵심입니다.",
        ],
      },
      {
        title: "반복은 양보다 질",
        paragraphs: [
          "같은 지문을 3번 읽어도, 매번 ‘목적’을 다르게 두세요.",
          "1회차는 흐름, 2회차는 근거, 3회차는 선택지 검증.",
        ],
      },
    ],
  },
  "korean-grade-strategy": {
    hero: "https://images.unsplash.com/photo-1491841651911-c44c30c34548?w=1400&q=80",
    sections: [
      {
        paragraphs: [
          "국어는 한 과목처럼 보이지만, 실제로는 문학/비문학/문법 세 과목입니다.",
          "각 영역마다 공부법을 달리해야 점수가 안정됩니다.",
        ],
      },
      {
        title: "문학: 작품의 흐름을 잡기",
        paragraphs: [
          "작품을 ‘요약’하는 연습을 해보세요.",
          "줄거리보다 감정 변화, 시점 변화에 집중하는 게 고득점의 핵심입니다.",
        ],
      },
      {
        title: "비문학: 구조로 읽기",
        paragraphs: [
          "문단의 역할을 표시하면서 읽으면 글의 중심이 보입니다.",
          "정의-예시-반박 구조를 익히면 지문이 짧아집니다.",
        ],
      },
      {
        title: "문법: 하루 10문제 루틴",
        paragraphs: [
          "문법은 누적형입니다. 매일 10문제씩 작은 루틴을 만들어 주세요.",
          "틀린 개념은 ‘오답노트’보다 ‘개념 요약’이 먼저입니다.",
        ],
      },
    ],
  },
  "math-error-notes": {
    hero: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1400&q=80",
    sections: [
      {
        paragraphs: [
          "수학 공부의 핵심은 오답노트입니다.",
          "하지만 많은 학생들이 오답노트를 ‘틀린 문제 모음집’으로만 쓰고 있어요.",
        ],
      },
      {
        title: "오답노트는 사고 기록",
        paragraphs: [
          "틀린 이유를 ‘한 줄’로 끝내지 마세요.",
          "내가 어떤 발상에서 막혔는지, 어떤 조건을 놓쳤는지를 적어야 합니다.",
        ],
      },
      {
        title: "3단계 작성법",
        paragraphs: [
          "1) 오답 이유: 계산 실수/조건 누락/개념 혼동",
          "2) 정답 접근: 문제를 다시 풀며 핵심 발상 기록",
          "3) 재발 방지: 비슷한 유형에서 적용할 규칙",
        ],
      },
      {
        title: "복습 루틴",
        paragraphs: [
          "오답노트는 주 2회만 봐도 충분합니다.",
          "다시 풀 수 있는 문제와 아직 막히는 문제를 구분하는 게 핵심입니다.",
        ],
      },
    ],
  },
  "suneung-korean-reading": {
    hero: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=1400&q=80",
    sections: [
      {
        paragraphs: [
          "수능 국어는 ‘모든 것을 읽는 시험’이 아닙니다.",
          "읽어야 할 것을 읽고, 버려야 할 것을 버리는 시험입니다.",
        ],
      },
      {
        title: "읽기 우선순위를 세우자",
        paragraphs: [
          "첫 문단에서 글의 목적을 먼저 파악하세요.",
          "모든 정보에 매달리지 말고, 질문과 연결된 정보만 표시합니다.",
        ],
      },
      {
        title: "선지로 돌아가기",
        paragraphs: [
          "문제를 먼저 보고 지문으로 돌아가는 방식이 효과적일 때가 많습니다.",
          "선지에서 요구하는 정보가 무엇인지 확인하면 읽는 범위가 줄어듭니다.",
        ],
      },
      {
        title: "정리의 습관",
        paragraphs: [
          "지문을 읽을 때마다 ‘요약 한 줄’을 남겨 보세요.",
          "읽기의 방향이 잡히면 시간과 점수가 동시에 올라갑니다.",
        ],
      },
    ],
  },
};

export default function ColumnDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = COLUMN_ARTICLES.find((item) => item.slug === params.slug);
  if (!article) return notFound();

  if (article.status !== "published") {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-10">
        <Link
          href="/home"
          className="text-sm text-gray-400 flex items-center gap-1 mb-6"
        >
          <ArrowLeft size={16} /> 홈으로
        </Link>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <h1 className="text-xl font-black text-gray-900 mb-2">
            준비 중인 칼럼입니다.
          </h1>
          <p className="text-sm text-gray-500">
            곧 공개될 예정이에요. 조금만 기다려주세요!
          </p>
        </div>
      </div>
    );
  }

  const content = CONTENT_BY_SLUG[article.slug];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-6">
        <Link
          href="/home"
          className="text-sm text-gray-400 flex items-center gap-1 mb-5"
        >
          <ArrowLeft size={16} /> 홈으로
        </Link>
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            [설스터디] 서울대쌤 칼럼
          </span>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">
            {article.title}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {article.subtitle}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-gray-400 font-bold">
            <span>{article.author}</span>
            <span>·</span>
            <span>{article.date}</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-16 space-y-8">
        {content?.hero && (
          <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white">
            <img
              src={content.hero}
              alt="칼럼 이미지"
              className="w-full h-[220px] object-cover"
            />
          </div>
        )}
        {content?.sections?.length ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-gray-700 leading-relaxed text-sm">
            <div className="space-y-6">
              {content.sections.map((section, index) => (
                <div
                  key={`${article.slug}-section-${index}`}
                  className="space-y-4"
                >
                  {section.title && (
                    <h2 className="text-lg font-black text-gray-900">
                      {section.title}
                    </h2>
                  )}
                  {section.paragraphs.map((paragraph, idx) => (
                    <p key={`${article.slug}-paragraph-${index}-${idx}`}>
                      {paragraph}
                    </p>
                  ))}
                  {section.list && (
                    <ul className="list-disc list-inside space-y-1">
                      {section.list.map((item, idx) => (
                        <li key={`${article.slug}-list-${index}-${idx}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.image && (
                    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white">
                      <img
                        src={section.image}
                        alt="칼럼 이미지"
                        className="w-full h-[200px] object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
