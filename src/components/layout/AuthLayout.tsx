type AuthLayoutProps = {
  left: React.ReactNode;
  right: React.ReactNode;
};

export function AuthLayout({ left, right }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <section className="flex items-center justify-center p-10">
          {left}
        </section>

        <section className="flex items-center justify-center p-10">
          {right}
        </section>
      </div>
    </main>
  );
}