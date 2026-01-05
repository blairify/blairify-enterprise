export const runtime = "nodejs";

export default function PublicInterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-screen overflow-y-auto">{children}</div>;
}
