import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

export default function ServiceBox() {
  return (
    <div className="my-16 grid grid-cols-1 gap-4 md:grid-cols-3">
      <Link
        className={`${buttonVariants({
          variant: 'secondary',
          size: 'lg',
        })} h-16 font-semibold`}
        href="/"
      >
        Vedtekter
      </Link>
      <Link
        className={`${buttonVariants({
          variant: 'secondary',
          size: 'lg',
        })} h-16 font-semibold`}
        href="/"
      >
        Retningslinjer
      </Link>
      <Link
        className={`${buttonVariants({
          variant: 'secondary',
          size: 'lg',
        })} h-16 font-semibold`}
        href="/"
      >
        Klippeliste 2023
      </Link>
      <Link
        className={`${buttonVariants({
          variant: 'secondary',
          size: 'lg',
        })} h-16 font-semibold`}
        href="/"
      >
        Oversikt over beboere
      </Link>
      <Link
        className={`${buttonVariants({
          variant: 'secondary',
          size: 'lg',
        })} h-16 font-semibold`}
        href="/"
      >
        Dokumenter fra årsmøter
      </Link>
      <Link
        className={`${buttonVariants({
          variant: 'secondary',
          size: 'lg',
        })} h-16 font-semibold`}
        href="/"
      >
        Diverse dokumenter
      </Link>
    </div>
  );
}
