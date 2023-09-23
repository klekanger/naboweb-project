import type { StaticImport } from 'next/dist/shared/lib/get-img-props';

declare module 'public/logo-dark.svg' {
  const content: StaticImport;
  export default content;
}
