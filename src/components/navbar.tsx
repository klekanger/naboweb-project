"use client";

import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
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
  semanticColors,
} from "@nextui-org/react";
import { LogIn, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import logoDark from "public/logo-dark.svg";
import logoLight from "public/logo-light.svg";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { isSignedIn, user, isLoaded } = useUser();
  const menuItems = [
    { title: "For beboere", href: "/informasjon", protected: true },
    { title: "Blogg", href: "/blog-collection", protected: false },
    {
      title: "Om oss",
      href: "/om-boligsameiet-gartnerihagen",
      protected: false,
    },
    { title: "Styret", href: "/styret", protected: false },
    { title: "Min side", href: "/min-side", protected: true },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // When the user navigates to a new page, always close the hamburger menu
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  if (!mounted) return null;

  return (
    <NextUINavbar
      classNames={{
        base: "dark:bg-black/80 bg-brand-black/10",
        item: "text-brand-black dark:text-brand-white",
      }}
      onMenuOpenChange={() => {
        setIsMenuOpen(!isMenuOpen);
      }}
      isMenuOpen={isMenuOpen}
      shouldHideOnScroll
      maxWidth="full"
      height="4.5rem"
      isBlurred
    >
      <NavbarContent justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="z-50 lg:hidden"
        />
        <NavbarBrand aria-label="Gartnerihagen-logo">
          <Link href="/" className="cursor-pointer">
            <Image
              src={theme === "light" ? logoLight : logoDark}
              alt="Gartnerihagen-logo"
              className="-mt-3 sm:-ml-12 sm:h-16 lg:ml-0 lg:w-auto"
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
              <SignOutButton>
                <Button
                  variant="flat"
                  className="ml-8 bg-secondary"
                  startContent={<LogOut />}
                >
                  Logg ut
                </Button>
              </SignOutButton>
            ) : (
              <SignInButton>
                <Button
                  variant="flat"
                  className="ml-8 bg-secondary"
                  startContent={<LogIn />}
                >
                  Logg inn
                </Button>
              </SignInButton>
            )}
          </NavbarItem>
          <NavbarItem>
            <Button
              variant="light"
              onClick={() => {
                if (theme === "dark") {
                  setTheme("light");
                } else {
                  setTheme("dark");
                }
              }}
              isIconOnly
              className="ml-2"
              aria-label="Bytt mellom mørk og lys modus"
            >
              {theme === "light" ? <Sun /> : <Moon />}
            </Button>
          </NavbarItem>
        </ButtonGroup>
      </NavbarContent>

      <NavbarMenu className="pt-8">
        {menuItems.map((item, index) => {
          if (item.protected && !user) return null;

          return (
            <NavbarMenuItem
              key={index}
              className="hover:text-brand-hoverButtonColor duration-100 transition"
            >
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === menuItems.length - 1
                    ? "danger"
                    : "foreground"
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
              <SignOutButton>
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<LogOut />}
                >
                  Logg ut
                </Button>
              </SignOutButton>
            ) : (
              <SignInButton>
                <Button color="primary" variant="flat" startContent={<LogIn />}>
                  Logg inn
                </Button>
              </SignInButton>
            )}
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Button
              variant="light"
              onClick={() => {
                if (theme === "dark") {
                  setTheme("light");
                } else {
                  setTheme("dark");
                }
              }}
              className="ml-2"
              isIconOnly
            >
              {theme === "light" ? <Sun /> : <Moon />}
            </Button>
          </NavbarMenuItem>
        </ButtonGroup>
      </NavbarMenu>
    </NextUINavbar>
  );
}
