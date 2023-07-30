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
      } fixed z-50 flex w-full flex-wrap items-center justify-between break-words bg-brand-dark px-8 py-3 text-slate-50 dark:bg-brand-darkTransparent`}
    >
      <Link href="/" className="cursor-pointer">
        <Image src={logo} alt="Gartnerihagen-logo" />
      </Link>
      <div>
        <div className="flex">
          <Link
            href="/informasjon"
            className="m-auto mr-8 cursor-pointer font-light transition duration-300 hover:text-green-200"
          >
            For beboere
          </Link>

          <Link
            href="/blog-collection"
            className="m-auto mr-8 cursor-pointer  font-light transition duration-300 hover:text-green-200"
          >
            Blogg
          </Link>

          <Link
            href="/om-boligsameiet-gartnerihagen"
            className="m-auto mr-8 cursor-pointer  font-light transition duration-300 hover:text-green-200"
          >
            Om oss
          </Link>

          <Link
            href="/styret"
            className="m-auto cursor-pointer  font-light transition duration-300 hover:text-green-200"
          >
            Styret
          </Link>

          <div>
            <Button className="ml-8 cursor-pointer self-end">
              <LogIn className="mr-2" /> Logg inn
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => {
                if (theme === 'dark') {
                  setTheme('light');
                } else {
                  setTheme('dark');
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
