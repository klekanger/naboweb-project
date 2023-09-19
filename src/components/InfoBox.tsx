type InfoBoxProps = {
  title: string;
  message: string;
};

export default function InfoBox({ title, message }: InfoBoxProps) {
  return (
    <div className="break-words rounded-md bg-secondary px-8 pb-12 pt-8 md:pb-16 md:pt-16">
      <h1 className="mb-6 text-5xl font-bold">{title}</h1>
      <p className="text-lg">{message}</p>
    </div>
  );
}
