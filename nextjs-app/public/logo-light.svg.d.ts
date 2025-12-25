import type { StaticImport } from 'next/dist/shared/lib/get-img-props';

declare module 'public/logo-light.svg' {
  const content: StaticImport;
  export default content;
}
