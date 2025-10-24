import { Footer } from "@/components/footer";
import "../globals.css";
import { Navbar } from "@/components/navbar";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="">{children}</main>;
}
