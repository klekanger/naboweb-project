'use client';

import { Button, ButtonGroup } from '@nextui-org/react';
import { Paperclip } from 'lucide-react';
import Link from 'next/link';

export default function ServiceBox() {
  return (
    <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
      <Button
        as={Link}
        href="/"
        startContent={<Paperclip className="absolute left-6" />}
        size="lg"
      >
        Vedtekter
      </Button>
      <Button
        as={Link}
        href="/"
        startContent={<Paperclip className="absolute left-6" />}
        size="lg"
      >
        Retningslinjer
      </Button>{' '}
      <Button
        as={Link}
        href="/"
        startContent={<Paperclip className="absolute left-6" />}
        size="lg"
      >
        Klippeliste 2023
      </Button>{' '}
      <Button
        as={Link}
        href="/"
        startContent={<Paperclip className="absolute left-6" />}
        size="lg"
      >
        Oversikt over beboere
      </Button>{' '}
      <Button
        as={Link}
        href="/informasjon/referater"
        startContent={<Paperclip className="absolute left-6" />}
        size="lg"
      >
        Dokumenter fra årsmøter
      </Button>{' '}
      <Button
        as={Link}
        href="/informasjon/dokumenter"
        startContent={<Paperclip className="absolute left-6" />}
        size="lg"
      >
        Diverse dokumenter
      </Button>
    </div>
  );
}

/* 
<Link className={`h-16 font-semibold`} href="/">
Vedtekter
</Link>
<Link className={`h-16 font-semibold`} href="/">
Retningslinjer
</Link>
<Link className={`h-16 font-semibold`} href="/">
Klippeliste 2023
</Link>
<Link className={`h-16 font-semibold`} href="/">
Oversikt over beboere
</Link>
<Link className={`h-16 font-semibold`} href="/">
Dokumenter fra årsmøter
</Link>
<Link className={`h-16 font-semibold`} href="/">
Diverse dokumenter
</Link> */
