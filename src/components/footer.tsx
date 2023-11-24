import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div>
        <p>
          &copy; {currentYear} Boligsameiet Gartnerihagen <br />
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
        <p className="text-brand-logoLightGreen">
          Vil du ha en nettside som dette? <br />
          Ta kontakt med <a href="mailto:kurt@lekanger.no">kurt@lekanger.no</a>
        </p>
      </div>
      <div>
        <p>
          Webdesign: <a href="https://www.lekanger.no">Kurt Lekanger</a>
          <br />
          Bygget med Next.js og Tailwind CSS
        </p>
      </div>
    </footer>
  );
}
