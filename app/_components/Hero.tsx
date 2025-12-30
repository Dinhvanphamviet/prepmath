"use client";

import React from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function Hero() {
  return (
    <div className='w-full relative h-screen overflow-hidden'>
      <Image src="/hero2.gif" alt="Hero Image" width={1000} height={1000}
        className='w-full h-full object-cover absolute inset-0' />

      <div className='absolute w-full flex flex-col items-center mt-24'>
        <h2 className='font-bold text-7xl font-game'>START YOUR</h2>
        <h2 className='font-bold text-8xl font-game text-yellow-400 mt-10'
          style={{
            textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000"
          }}
        > EXAM ADVENTURE</h2>

        <h2 className='mt-5 font-game text-3xl'>Thi thử như thi thật cho THPT • HSA • TSA</h2>
        <Link href="/login">
          <Button className='font-game text-2xl p-6 mt-7' variant={"pixel"}>
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default Hero