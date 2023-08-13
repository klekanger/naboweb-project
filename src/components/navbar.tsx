'use client';

import {
  Button,
  ButtonGroup,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Navbar as NextUINavbar,
} from '@nextui-org/react';

import { useUser } from '@auth0/nextjs-auth0/client';
import { LogIn, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import logoDark from 'public/logo-dark.svg';
import logoLight from 'public/logo-light.svg';
import { useEffect, useState } from 'react';

export default function App() {
  const menuItems = [
    { title: 'For beboere', href: '/informasjon', protected: false },
    { title: 'Blogg', href: '/blog-collection' },
    {
      title: 'Om oss',
      href: '/om-boligsameiet-gartnerihagen',
      protected: false,
    },
    { title: 'Styret', href: '/styret', protected: false },
    { title: 'Min side', href: '/min-side', protected: true },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, error, isLoading } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  // When the user navigates to a new page, always close the hamburger menu
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  if (!mounted) return null;
  if (error) return <div>{error.message}</div>;

  return (
    <NextUINavbar
      classNames={{
        base: 'dark:bg-black/80 bg-brand-black/10',
        item: 'text-brand-black dark:text-brand-white',
      }}
      onMenuOpenChange={() => setIsMenuOpen(!isMenuOpen)}
      isMenuOpen={isMenuOpen}
      shouldHideOnScroll
      maxWidth="full"
      height="4.5rem"
      isBlurred
    >
      <NavbarContent justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="z-50 lg:hidden"
        />
        <NavbarBrand>
          <Link href="/" className="cursor-pointer">
            <Image
              src={theme === 'light' ? logoLight : logoDark}
              alt="Gartnerihagen-logo"
              className="-mt-3 sm:-ml-12 sm:h-16 lg:ml-0"
              priority
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden gap-8 lg:flex" justify="end">
        {menuItems.map((item, index) => {
          if (item.protected && !user) return null;

          return (
            <NavbarItem
              key={index}
              isActive={pathname.startsWith(item.href)}
              className="text-brand-black duration-100 transition hover:text-brand-black/60 dark:text-brand-white dark:hover:text-brand-white/60"
            >
              <Link href={item.href} className="">
                {item.title}
              </Link>
            </NavbarItem>
          );
        })}

        <ButtonGroup>
          <NavbarItem>
            {user ? (
              <Button
                color="primary"
                onClick={() => router.push('/api/auth/logout')}
                variant="flat"
                className="ml-8"
                startContent={<LogOut />}
              >
                Logg ut
              </Button>
            ) : (
              <Button
                color="primary"
                onClick={() => router.push('/api/auth/login')}
                variant="flat"
                className="ml-8"
                startContent={<LogIn />}
              >
                Logg inn
              </Button>
            )}
          </NavbarItem>
          <NavbarItem>
            <Button
              variant="light"
              onClick={() => {
                if (theme === 'dark') {
                  setTheme('light');
                } else {
                  setTheme('dark');
                }
              }}
              isIconOnly
              className="ml-2"
            >
              {theme === 'light' ? <Sun /> : <Moon />}
            </Button>
          </NavbarItem>
        </ButtonGroup>
      </NavbarContent>

      <NavbarMenu className="pt-8">
        {menuItems.map((item, index) => {
          if (item.protected && !user) return null;

          return (
            <NavbarMenuItem
              key={`${item}-${index}`}
              className="duration-100 transition hover:text-brand-hoverButtonColor"
            >
              <Link
                color={
                  index === 2
                    ? 'primary'
                    : index === menuItems.length - 1
                    ? 'danger'
                    : 'foreground'
                }
                className="w-full"
                href={item.href}
              >
                {item.title}
              </Link>
            </NavbarMenuItem>
          );
        })}
        <ButtonGroup className="mt-8">
          <NavbarMenuItem>
            {user ? (
              <Button
                color="primary"
                onClick={() => router.push('/api/auth/logout')}
                variant="flat"
                startContent={<LogOut />}
              >
                Logg ut
              </Button>
            ) : (
              <Button
                color="primary"
                onClick={() => router.push('/api/auth/login')}
                variant="flat"
                startContent={<LogIn />}
              >
                Logg inn
              </Button>
            )}
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Button
              variant="light"
              onClick={() => {
                if (theme === 'dark') {
                  setTheme('light');
                } else {
                  setTheme('dark');
                }
              }}
              isIconOnly
            >
              {theme === 'light' ? <Sun /> : <Moon />}
            </Button>
          </NavbarMenuItem>
        </ButtonGroup>
      </NavbarMenu>
    </NextUINavbar>
  );
}
