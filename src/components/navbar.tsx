'use client';

import { Button } from '@/components/ui/button';
import { LogIn, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import gartnerihagenLogo from 'public/gartnerihagen.svg';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isMenuHidden, setIsMenuHidden] = useState(false);
  const logo = gartnerihagenLogo as string;
  const { theme, setTheme } = useTheme();

  const handleScroll = () => {
    if (typeof window !== 'undefined') {
      if (window.scrollY > window.innerHeight * 0.15) {
        setIsMenuHidden(true);
      } else {
        setIsMenuHidden(false);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!mounted) return null;

  return (
    <nav
      className={`${
        isMenuHidden ? 'hide-on-scroll' : ''
      } fixed z-50 flex w-full flex-wrap items-center justify-between break-words bg-neutral-950 px-8 py-3 text-slate-50`}
    >
      <Link href="/" className="cursor-pointer">
        <Image src={logo} alt="Gartnerihagen-logo" />
      </Link>
      <div>
        <div className="flex">
          <p className="m-auto mr-8 text-xl font-light transition duration-300 hover:text-green-200">
            <Link href="/informasjon" className="cursor-pointer">
              For beboere
            </Link>
          </p>
          <p className="m-auto mr-8 text-xl font-light transition duration-300 hover:text-green-200">
            <Link href="/blog-collection" className="cursor-pointer">
              Blogg
            </Link>
          </p>
          <p className="m-auto mr-8 text-xl font-light transition duration-300 hover:text-green-200">
            <Link
              href="/om-boligsameiet-gartnerihagen"
              className="cursor-pointer"
            >
              Om oss
            </Link>
          </p>
          <p className="m-auto text-xl font-light transition duration-300 hover:text-green-200">
            <Link href="/styret" className="cursor-pointer">
              Styret
            </Link>
          </p>
          <div>
            <Button className="ml-8 cursor-pointer self-end bg-brand-primaryButton  text-brand-black transition duration-300 hover:bg-emerald-200">
              <LogIn className="mr-2" /> Logg inn
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => {
                if (theme === 'dark') {
                  setTheme('light');
                  console.log('light');
                } else {
                  setTheme('dark');
                  console.log('dark');
                }
              }}
            >
              {theme === 'light' ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
