"use client";

import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Navbar as NextUINavbar,
} from "@heroui/react";
import {
  ChevronDown,
  Files,
  Info,
  LogIn,
  LogOut,
  MessagesSquare,
  NotebookPen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import logoLight from "public/logo-light.svg";

export default function Navbar() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, [pathname]);

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
        {isClient && isLoaded && user && (
          <Dropdown className="hidden lg:block">
            <NavbarItem>
              <DropdownTrigger>
                <Button
                  disableRipple
                  className="p-0 bg-transparent data-[hover=true]:bg-transparent text-base hover:text-brand-secondary duration-200 transition"
                  endContent={
                    <ChevronDown className="h-[1.2rem] w-[1.2rem] mt-1" />
                  }
                  radius="sm"
                  variant="light"
                >
                  For beboere
                </Button>
              </DropdownTrigger>
            </NavbarItem>

            <DropdownMenu
              aria-label="ACME features"
              className="w-[340px]"
              itemClasses={{
                base: "gap-4",
              }}
            >
              <DropdownItem
                as={Link}
                key="informasjon"
                description="Blogginnlegg, dokumenter og annet fra styret."
                startContent={<Info />}
                href="/information"
              >
                Informasjon fra styret
              </DropdownItem>

              <DropdownItem
                as={Link}
                key="oppslagstavle"
                description="Oppslag om stort og smått fra beboere og styret."
                startContent={<MessagesSquare />}
                href="/messageboard"
              >
                Oppslagstavle
              </DropdownItem>

              <DropdownItem
                as={Link}
                key="møtereferater"
                description="Referater fra årsmøter."
                startContent={<NotebookPen />}
                href="/information/referater"
              >
                Møtereferater
              </DropdownItem>

              <DropdownItem
                as={Link}
                key="diverse-dokumenter"
                description="Husfarger og andre dokumenter fra styret."
                startContent={<Files />}
                href="/information/dokumenter"
              >
                Diverse dokumenter
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}

        <NavbarItem
          isActive={pathname.startsWith("/blog-collection")}
          className="hover:text-brand-secondary duration-200 transition"
        >
          <Link href="/blog-collection">Blogg</Link>
        </NavbarItem>

        <NavbarItem
          isActive={pathname.startsWith("/om-boligsameiet-gartnerihagen")}
          className="hover:text-brand-secondary duration-200 transition"
        >
          <Link href="/om-boligsameiet-gartnerihagen">Om oss</Link>
        </NavbarItem>

        <NavbarItem
          isActive={pathname.startsWith("/styret")}
          className="hover:text-brand-secondary duration-200 transition"
        >
          <Link href="/styret">Styret</Link>
        </NavbarItem>

        {isClient && isLoaded && user && (
          <NavbarItem
            isActive={pathname.startsWith("/min-side")}
            className="hover:text-brand-secondary duration-200 transition"
          >
            <Link href="/min-side">Min side</Link>
          </NavbarItem>
        )}

        {isClient && isLoaded && (
          <ButtonGroup>
            <NavbarItem>
              {isSignedIn ? (
                <SignOutButton redirectUrl="/">
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
        )}
      </NavbarContent>

      {/* ************** */}
      {/* HAMBURGER MENU */}
      {/* ************** */}
      <NavbarMenu className="pt-8 text-center">
        {isClient && isLoaded && user && (
          <>
            <NavbarItem
              isActive={pathname.startsWith("/information")}
              className="text-brand-black duration-100 transition hover:text-brand-black/60 dark:text-brand-white dark:hover:text-brand-white/60"
            >
              <Link href="/information">Informasjon fra styret</Link>
            </NavbarItem>

            <NavbarItem
              isActive={pathname.startsWith("/messageboard")}
              className="text-brand-black duration-100 transition hover:text-brand-black/60 dark:text-brand-white dark:hover:text-brand-white/60"
            >
              <Link href="/messageboard">Oppslagstavle</Link>
            </NavbarItem>

            <NavbarItem
              isActive={pathname.startsWith("/information/referater")}
              className="text-brand-black duration-100 transition hover:text-brand-black/60 dark:text-brand-white dark:hover:text-brand-white/60"
            >
              <Link href="/information/referater">Møtereferater</Link>
            </NavbarItem>

            <NavbarItem
              isActive={pathname.startsWith("/information/dokumenter")}
              className="text-brand-black duration-100 transition hover:text-brand-black/60 dark:text-brand-white dark:hover:text-brand-white/60"
            >
              <Link href="/information/dokumenter">Diverse dokumenter</Link>
            </NavbarItem>

            <hr className="my-4" />
          </>
        )}

        <NavbarItem
          isActive={pathname.startsWith("/blog-collection")}
          className="text-brand-black duration-100 transition hover:text-brand-black/60 dark:text-brand-white dark:hover:text-brand-white/60"
        >
          <Link href="/blog-collection">Blogg</Link>
        </NavbarItem>

        <NavbarItem
          isActive={pathname.startsWith("/om-boligsameiet-gartnerihagen")}
          className="text-brand-black duration-100 transition hover:text-brand-black/60 dark:text-brand-white dark:hover:text-brand-white/60"
        >
          <Link href="/om-boligsameiet-gartnerihagen">Om oss</Link>
        </NavbarItem>

        <NavbarItem
          isActive={pathname.startsWith("/styret")}
          className="text-brand-black duration-100 transition hover:text-brand-black/60 dark:text-brand-white dark:hover:text-brand-white/60"
        >
          <Link href="/styret">Styret</Link>
        </NavbarItem>

        {isClient && isLoaded && user && (
          <NavbarItem
            isActive={pathname.startsWith("/min-side")}
            className="text-brand-black duration-100 transition hover:text-brand-black/60 dark:text-brand-white dark:hover:text-brand-white/60"
          >
            <Link href="/min-side">Min side</Link>
          </NavbarItem>
        )}

        <ButtonGroup className="mt-8">
          <NavbarMenuItem>
            {isClient && isLoaded && user ? (
              <SignOutButton redirectUrl="/">
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
