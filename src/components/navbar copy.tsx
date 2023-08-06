'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUser } from '@auth0/nextjs-auth0/client';
import { LogIn, Moon, RefreshCw, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gartnerihagenLogo from 'public/gartnerihagen.svg';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMenuHidden, setIsMenuHidden] = useState(false);
  const logo = gartnerihagenLogo as string;
  const { theme, setTheme } = useTheme();
  const { user, error, isLoading } = useUser();

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
  if (error) return <div>{error.message}</div>;

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
            className="m-auto mr-8 cursor-pointer font-light duration-300 transition hover:text-green-200"
          >
            For beboere
          </Link>

          <Link
            href="/blog-collection"
            className="m-auto mr-8 cursor-pointer  font-light duration-300 transition hover:text-green-200"
          >
            Blogg
          </Link>

          <Link
            href="/om-boligsameiet-gartnerihagen"
            className="m-auto mr-8 cursor-pointer  font-light duration-300 transition hover:text-green-200"
          >
            Om oss
          </Link>

          <Link
            href="/styret"
            className="m-auto cursor-pointer  font-light duration-300 transition hover:text-green-200"
          >
            Styret
          </Link>

          <div>
            {user ? (
              <Button
                className="ml-8 cursor-pointer self-end"
                onClick={() => router.push('/api/auth/logout')}
              >
                <Avatar className="-translate-x-2 scale-75">
                  <AvatarImage src={user?.picture || ''} />
                  <AvatarFallback>xx</AvatarFallback>
                </Avatar>
                Logg ut
              </Button>
            ) : (
              <Button
                className="ml-8 cursor-pointer self-end"
                onClick={() => router.push('/api/auth/login')}
              >
                {isLoading ? (
                  <RefreshCw className="mr-2 animate-spin" />
                ) : (
                  <LogIn className="mr-2" />
                )}
                Logg inn
              </Button>
            )}

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
