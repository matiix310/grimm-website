import { Navbar } from "@/components/home/Navbar";

const NavbarLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="size-full">{children}</div>
    </div>
  );
};

export default NavbarLayout;
