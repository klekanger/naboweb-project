export default function EmailAdminPage() {
  return (
    <section className="flex flex-col items-center">
      <h1 className="prose lg:prose-xl text-4xl lg:text-5xl mb-8 font-semibold self-start">
        E-post-administrasjon
      </h1>
      <p className="prose lg:prose-xl mb-8 self-start">
        Her kan du sende ut e-post til alle brukere som har abonnert på
        nyhetsbrev og varsler.
      </p>
    </section>
  );
}
