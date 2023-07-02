'use client';

import Image from 'next/image';
import Link from 'next/link';
import gartnerihagenLogo from 'public/gartnerihagen.svg';
import { use, useEffect, useState } from 'react';

export default function Navbar() {
  const [isMenuHidden, setIsMenuHidden] = useState(false);
  const logo = gartnerihagenLogo as string;

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
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
          <button className="m-auto ml-8 flex h-10 w-32 cursor-pointer items-center justify-center rounded-md bg-primaryButton px-4 text-center align-middle font-semibold text-slate-950 transition duration-300 hover:bg-emerald-200">
            <span className="flex-grow">Logg inn</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
