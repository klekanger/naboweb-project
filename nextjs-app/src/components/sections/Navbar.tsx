"use client";

import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { ButtonGroup } from "@heroui/react";
import CustomButton from "@/components/CustomButton";
import {
  ChevronDown,
  Files,
  Info,
  LogIn,
  LogOut,
  Menu,
  X,
  MessagesSquare,
  NotebookPen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import logoLight from "../../../public/logo-light.svg";

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

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50 dark:bg-black/80 bg-brand-white/70 backdrop-blur-md border-b border-border w-full">
      <div className="max-w-7xl px-4 h-18 flex justify-between mx-auto items-center">
        {/* Mobile menu toggle and logo */}
        <div className="flex items-center gap-4 flex-1 lg:flex-none">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="z-50 lg:hidden p-2"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-brand-black dark:text-brand-white" />
            ) : (
              <Menu className="h-6 w-6 text-brand-black dark:text-brand-white" />
            )}
          </button>
          <Link
            href="/"
            className="cursor-pointer"
            aria-label="Gartnerihagen-logo"
          >
            <Image
              src={logoLight}
              alt="Gartnerihagen-logo"
              className="-mt-3 sm:-ml-12 sm:h-16 lg:ml-0 lg:w-auto"
              priority
            />
          </Link>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {isClient && isLoaded && user && (
            <div className="relative group">
              <CustomButton
                variant="ghost"
                className="p-0 bg-transparent text-base hover:text-brand-secondary duration-200 transition text-brand-black dark:text-brand-white"
              >
                For beboere
                <ChevronDown className="h-[1.2rem] w-[1.2rem] mt-1 ml-1" />
              </CustomButton>
              <div className="absolute top-full left-0 mt-2 w-[340px] bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="flex flex-col p-2 gap-0.5">
                  <Link
                    href="/information"
                    className="flex items-start gap-4 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Info className="h-5 w-5 mt-1.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        Informasjon fra styret
                      </span>
                      <span className="text-sm text-foreground/60">
                        Blogginnlegg, dokumenter og annet fra styret.
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/messageboard"
                    className="flex items-start gap-4 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <MessagesSquare className="h-5 w-5 mt-1.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">Oppslagstavle</span>
                      <span className="text-sm text-foreground/60">
                        Oppslag om stort og smått fra beboere og styret.
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/information/referater"
                    className="flex items-start gap-4 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <NotebookPen className="h-5 w-5 mt-1.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">Møtereferater</span>
                      <span className="text-sm text-foreground/60">
                        Referater fra årsmøter.
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/information/dokumenter"
                    className="flex items-start gap-4 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Files className="h-5 w-5 mt-1.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">Diverse dokumenter</span>
                      <span className="text-sm text-foreground/60">
                        Husfarger og andre dokumenter fra styret.
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/blog-collection"
            className={`text-brand-black dark:text-brand-white hover:text-brand-secondary duration-200 transition ${
              isActive("/blog-collection") ? "text-brand-secondary" : ""
            }`}
          >
            Blogg
          </Link>

          <Link
            href="/om-boligsameiet-gartnerihagen"
            className={`text-brand-black dark:text-brand-white hover:text-brand-secondary duration-200 transition ${
              isActive("/om-boligsameiet-gartnerihagen")
                ? "text-brand-secondary"
                : ""
            }`}
          >
            Om oss
          </Link>

          <Link
            href="/styret"
            className={`text-brand-black dark:text-brand-white hover:text-brand-secondary duration-200 transition ${
              isActive("/styret") ? "text-brand-secondary" : ""
            }`}
          >
            Styret
          </Link>

          {isClient && isLoaded && user && (
            <Link
              href="/min-side"
              className={`text-brand-black dark:text-brand-white hover:text-brand-secondary duration-200 transition ${
                isActive("/min-side") ? "text-brand-secondary" : ""
              }`}
            >
              Min side
            </Link>
          )}

          {isClient && isLoaded && (
            <ButtonGroup>
              {isSignedIn ? (
                <SignOutButton redirectUrl="/">
                  <CustomButton className="ml-8">
                    <LogOut className="mr-1" />
                    Logg ut
                  </CustomButton>
                </SignOutButton>
              ) : (
                <SignInButton>
                  <CustomButton className="ml-8">
                    <LogIn className="mr-1" />
                    Logg inn
                  </CustomButton>
                </SignInButton>
              )}
            </ButtonGroup>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden pt-8 pb-4 px-4 text-center border-t border-border">
          {isClient && isLoaded && user && (
            <>
              <Link
                href="/information"
                className={`block py-2 text-brand-black dark:text-brand-white duration-100 transition hover:text-brand-black/60 dark:hover:text-brand-white/60 ${
                  isActive("/information") ? "text-brand-secondary" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Informasjon fra styret
              </Link>

              <Link
                href="/messageboard"
                className={`block py-2 text-brand-black dark:text-brand-white duration-100 transition hover:text-brand-black/60 dark:hover:text-brand-white/60 ${
                  isActive("/messageboard") ? "text-brand-secondary" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Oppslagstavle
              </Link>

              <Link
                href="/information/referater"
                className={`block py-2 text-brand-black dark:text-brand-white duration-100 transition hover:text-brand-black/60 dark:hover:text-brand-white/60 ${
                  isActive("/information/referater")
                    ? "text-brand-secondary"
                    : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Møtereferater
              </Link>

              <Link
                href="/information/dokumenter"
                className={`block py-2 text-brand-black dark:text-brand-white duration-100 transition hover:text-brand-black/60 dark:hover:text-brand-white/60 ${
                  isActive("/information/dokumenter")
                    ? "text-brand-secondary"
                    : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Diverse dokumenter
              </Link>

              <hr className="my-4" />
            </>
          )}

          <Link
            href="/blog-collection"
            className={`block py-2 text-brand-black dark:text-brand-white duration-100 transition hover:text-brand-black/60 dark:hover:text-brand-white/60 ${
              isActive("/blog-collection") ? "text-brand-secondary" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Blogg
          </Link>

          <Link
            href="/om-boligsameiet-gartnerihagen"
            className={`block py-2 text-brand-black dark:text-brand-white duration-100 transition hover:text-brand-black/60 dark:hover:text-brand-white/60 ${
              isActive("/om-boligsameiet-gartnerihagen")
                ? "text-brand-secondary"
                : ""
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Om oss
          </Link>

          <Link
            href="/styret"
            className={`block py-2 text-brand-black dark:text-brand-white duration-100 transition hover:text-brand-black/60 dark:hover:text-brand-white/60 ${
              isActive("/styret") ? "text-brand-secondary" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Styret
          </Link>

          {isClient && isLoaded && user && (
            <Link
              href="/min-side"
              className={`block py-2 text-brand-black dark:text-brand-white duration-100 transition hover:text-brand-black/60 dark:hover:text-brand-white/60 ${
                isActive("/min-side") ? "text-brand-secondary" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Min side
            </Link>
          )}

          <div className="mt-8 flex justify-center">
            {isClient && isLoaded && user ? (
              <SignOutButton redirectUrl="/">
                <CustomButton variant="primary">
                  <LogOut className="mr-2" />
                  Logg ut
                </CustomButton>
              </SignOutButton>
            ) : (
              <SignInButton>
                <CustomButton variant="primary">
                  <LogIn className="mr-2" />
                  Logg inn
                </CustomButton>
              </SignInButton>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
