import AlertUser from '@/components/alert-user';

export default function Login() {
  return (
    <div className="bg-primaryLight break-words rounded-md px-4 pb-12 pt-8 text-gray-900">
      <h1 className="mb-6 text-5xl font-bold text-slate-950">
        Informasjon fra styret
      </h1>
      <p className="text-lg text-gray-700">
        På denne siden finner du nyttig informasjon fra styret. Ta kontakt hvis
        det er noe du savner, eller har tilbakemeldinger.
      </p>

      <AlertUser
        alertTitle="Du er ikke logget inn"
        alertMessage={`
        Du må være logget inn for å se informasjon beregnet på beboere i Boligsameiet Gartnerihagen. 
        
        På denne siden vil du få oversikt over dokumenter og annen nyttig informasjon for beboere. 
        
        Du vil også kunne lese artikler beregnet på beboere. 
        
        Hvis du ikke har brukerkonto, ta kontakt med styret.`}
      />
    </div>
  );
}
