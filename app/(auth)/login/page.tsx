import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";
import IconApp from "../../assets/icon1.png";

export const metadata: Metadata = {
  title: "Login - Berair",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center items-center">
          <Image src={IconApp} alt={""} className="h-auto w-40 p-8" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Selamat datang kembali
          </h1>
          <p className="text-sm text-muted-foreground">
            Masuukan email dan password untuk masuk ke dalam akunmu
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
