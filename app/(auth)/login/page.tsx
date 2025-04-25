import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login - Berair",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div>
        <LoginForm />
    </div>
  );
}
