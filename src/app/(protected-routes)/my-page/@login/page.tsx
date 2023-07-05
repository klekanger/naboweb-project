import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Login() {
  return (
    <div>
      <h1>My Page - please log in</h1>
      <Alert>
        <AlertTitle>Logg inn for å se denne siden</AlertTitle>
        <AlertDescription className="">
          {`
            Du må være logget inn for å se informasjon beregnet på beboere i Boligsameiet Gartnerihagen. 
            
            På denne siden vil du kunne administrere din brukerkonto, og hvis du har tilgang kunne administrere andre brukerkontoer.
            
            Hvis du ikke har brukerkonto, ta kontakt med styret.`}
        </AlertDescription>
      </Alert>
      <p>fsdfsdfas dfa sdf asdf asdf</p>
      <p>
        fsdfsdfas dfa sdf asdf asdffsdfsdfas dfa sdf asdf asdffsdfsdfas dfa sdf
        asdf asdffsdfsdfas dfa sdf asdf asdffsdfsdfas dfa sdf asdf asdffsdfsdfas
        dfa sdf asdf asdffsdfsdfas dfa sdf asdf asdffsdfsdfas dfa sdf asdf
        asdffsdfsdfas dfa sdf asdf asdffsdfsdfas dfa sdf asdf asdffsdfsdfas dfa
        sdf asdf asdffsdfsdfas dfa sdf asdf asdffsdfsdfas dfa sdf asdf
        asdffsdfsdfas dfa sdf asdf asdffsdfsdfas dfa sdf asdf asdf
      </p>
    </div>
  );
}
