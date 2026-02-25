import { LoginProtector } from "../../components/LoginProtector";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LoginProtector>{children}</LoginProtector>;
}
