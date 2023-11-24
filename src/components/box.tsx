export default function Box({
  children,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`break-words rounded-xl border p-3 ${props?.className ?? ""}`}
    >
      {children}
    </div>
  );
}
