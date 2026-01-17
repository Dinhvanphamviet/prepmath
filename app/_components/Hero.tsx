"use client";

import React from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function Hero() {
  return (
    <div className='w-full relative min-h-screen overflow-hidden flex flex-col items-center justify-center bg-background selection:bg-primary/30'>
      {/* Decorative Floating Blobs */}
      <div className="purple w-72 h-72 bg-purple-300 floating-shape top-0 -left-4 mix-blend-multiply opacity-70 animate-blob"></div>
      <div className="yellow w-72 h-72 bg-yellow-300 floating-shape top-0 -right-4 animation-delay-2000 mix-blend-multiply opacity-70 animate-blob"></div>
      <div className="pink w-72 h-72 bg-pink-300 floating-shape -bottom-8 left-20 animation-delay-4000 mix-blend-multiply opacity-70 animate-blob"></div>

      {/* Hero Content */}
      <div className='relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto space-y-10'>
        <div className="animate-in fade-in zoom-in duration-700 space-y-4">
          <span className="px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 text-primary font-bold text-sm shadow-sm inline-block animate-bounce delay-700">
            ✨ Cách học Toán thú vị nhất!
          </span>
          <h1 className='font-extrabold text-5xl md:text-8xl tracking-tight text-foreground text-shadow-clay leading-tight'>
            Nâng Tầm <br />
            <span className="text-primary relative inline-block">
              Kỹ Năng Toán
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-300/60 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
        </div>

        <p className='text-xl md:text-2xl text-muted-foreground max-w-2xl font-medium leading-relaxed'>
          Tham gia cùng hàng ngàn học sinh chinh phục các kỳ thi THPT, HSA và TSA với nền tảng gami hóa.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <Link href="/login">
            <Button className='clay-button text-white text-xl px-10 py-8 font-bold hover:scale-105 active:scale-95 transition-all w-full sm:w-auto'>
              Bắt Đầu Ngay 🚀
            </Button>
          </Link>
          <Link href="#courses">
            <Button className='clay-button bg-white text-slate-900 hover:bg-gray-50 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 dark:border-slate-800 border border-transparent text-xl px-10 py-8 font-bold hover:scale-105 active:scale-95 transition-all w-full sm:w-auto'>
              Khám Phá Khóa Học
            </Button>
          </Link>
        </div>



      </div>
    </div>
  )
}

export default Hero