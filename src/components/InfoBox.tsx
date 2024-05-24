type InfoBoxProps = {
  title: string;
  message: string;
};

export default function InfoBox({ title, message }: InfoBoxProps) {
  return (
    <div className="break-words rounded-3xl bg-secondary px-8 pb-12 pt-8 md:pb-16 md:pt-16">
      <div className="prose lg:prose-xl">
        <h1 className="text-5xl">{title}</h1>
        <p className="lg:prose-xl">{message}</p>
      </div>
    </div>
  );
}
