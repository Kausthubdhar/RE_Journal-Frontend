import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create your account — RE Journal",
  description: "Sign up for RE Journal's real estate data, insights and econometric forecasts across India.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <AuthShell variant="signup">
      <SignupForm />
    </AuthShell>
  );
}
