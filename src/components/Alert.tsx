export default function Alert({ message }: { message: string }) {
  return (
    <div className="alert">
      <span className="alert__message">{message}</span>
    </div>
  );
}
