import AlertUser from "./AlertUser";

export default function NotLoggedIn() {
  return (
    <div className="container flex justify-center">
      <AlertUser
        alertTitle="Manglende rettigheter"
        alertMessage="Du må være logget inn og ha fått tilgang av styret for å se denne siden."
      />
    </div>
  );
}
