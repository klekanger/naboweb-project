import ServiceBox from '@/components/servicebox';

export default function Page() {
  return (
    <>
      <ServiceBox />
      <div className="bg-primaryLight break-words rounded-md px-4 pb-12 pt-8 text-gray-900">
        <h1 className="mb-6 text-5xl font-bold text-slate-950">
          Informasjon fra styret
        </h1>
        <p className="text-lg text-gray-700">
          På denne siden finner du nyttig informasjon fra styret. Ta kontakt
          hvis det er noe du savner, eller har tilbakemeldinger.
        </p>
      </div>
    </>
  );
}
