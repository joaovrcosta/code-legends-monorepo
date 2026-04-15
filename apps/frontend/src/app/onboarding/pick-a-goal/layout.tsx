export default function PickAGoalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <div className="w-full bg-[#0D0D12] flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
