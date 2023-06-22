import Image from 'next/image';
import heroImage from 'public/gartnerihagen-fellesomrade-3200x1800.webp';

export default function HeroWide() {
  return (
    <div className="-mt-12 w-screen max-w-full">
      <div className="overflow-hidden">
        <Image
          src={heroImage}
          alt="Boligsameiet Gartnerihagen"
          priority={true}
        />
      </div>
    </div>
  );
}
