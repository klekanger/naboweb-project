import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div>
        <p>
          Boligsameiet Gartnerihagen <br />
          <Link
            href="/cookies-og-personvern-gdpr"
            className="cursor-pointer text-xs"
          >
            Personvernerklæring
          </Link>
        </p>
      </div>
      <div>
        <p>
          Epost:{" "}
          <a href="mailto:post@gartnerihagen-askim.no">
            post@gartnerihagen-askim.no
          </a>
          <br />
          Telefon: +47 - 4021 0140 <br />
        </p>
        <br />
        <div className="text-brand-logoLightGreen md:pt-4">
          <a href="https://naboweb.no">
            <Image
              src="/naboweb-darkmode.png"
              alt="Naboweb logo"
              width={335}
              height={53}
              className="m-auto px-8 pb-2"
            />
          </a>
          Nettsider for sameier og borettslag
        </div>
      </div>
      <div>
        <p>
          Webdesign og utvikling:
          <br />
          <a href="https://www.lekanger.no">
            Lekanger tekst og kode &copy; {currentYear}{" "}
          </a>
        </p>
      </div>
    </footer>
  );
}

// TODO fetch this from sanity
