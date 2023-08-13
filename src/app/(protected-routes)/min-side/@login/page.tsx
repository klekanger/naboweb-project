import AlertUser from '@/components/alert-user';

export default function Login() {
  return (
    <div>
      <AlertUser
        alertTitle="Du er ikke logget inn"
        alertMessage={`
        Du må være logget inn for å se informasjon beregnet på beboere i Boligsameiet Gartnerihagen. 
        
        På denne siden vil du kunne administrere din brukerkonto, og hvis du har tilgang kunne administrere andre brukerkontoer.
        
        Hvis du ikke har brukerkonto, ta kontakt med styret.`}
      />
    </div>
  );
}
