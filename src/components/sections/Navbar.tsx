"use client";

import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import {
  Button,
  ButtonGroup,
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@nextui-org/react";
import { LogIn, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import logoLight from "/public/logo-light.svg";

const menuItems = [
  {
    id: "menu-1",
    title: "For beboere",
    href: "/informasjon",
    protected: true,
  },
  {
    id: "menu-2",
    title: "Blogg",
    href: "/blog-collection",
    protected: false,
  },
  {
    id: "menu-3",
    title: "Om oss",
    href: "/om-boligsameiet-gartnerihagen",
    protected: false,
  },
  { id: "menu-4", title: "Styret", href: "/styret", protected: false },
  { id: "menu-5", title: "Min side", href: "/min-side", protected: true },
];

export default function Navbar() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // When the user navigates to a new page, always close the hamburger menu
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <NextUINavbar
      classNames={{
        base: "dark:bg-black/80 bg-brand-white/70",
        item: "text-brand-black dark:text-brand-white",
      }}
      onMenuOpenChange={() => {
        setIsMenuOpen(!isMenuOpen);
      }}
      isMenuOpen={isMenuOpen}
      shouldHideOnScroll={false}
      maxWidth="2xl"
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
              src={logoLight}
              alt="Gartnerihagen-logo"
              className="-mt-3 sm:-ml-12 sm:h-16 lg:ml-0 lg:w-auto"
              priority
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden gap-8 lg:flex" justify="end">
        {menuItems.map((item) => {
          if (item.protected && !user) return null;

          return (
            <NavbarItem
              key={item.id}
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
            {isSignedIn ? (
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
        </ButtonGroup>
      </NavbarContent>

      <NavbarMenu className="pt-8">
        {menuItems.map((item) => {
          if (item.protected && !user) return null;

          return (
            <NavbarMenuItem
              key={item.id}
              className="hover:text-brand-hoverButtonColor duration-100 transition"
            >
              <Link className="w-full" href={item.href}>
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
        </ButtonGroup>
      </NavbarMenu>
    </NextUINavbar>
  );
}

// TODO
// Implement dropdown menu
// https://nextui.org/docs/components/navbar#with-dropdown-menu
