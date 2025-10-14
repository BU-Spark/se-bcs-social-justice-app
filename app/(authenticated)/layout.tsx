import Sidebar from "../components/Sidebar";
import OnboardingWrapper from "../components/OnboardingWrapper";
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingWrapper>  
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </OnboardingWrapper>  
  );
}
