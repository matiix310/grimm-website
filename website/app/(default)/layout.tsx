import { Navbar } from "@/components/home/Navbar";

const NavbarLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div>
      <Navbar />
      <div>{children}</div>
    </div>
  );
};

export default NavbarLayout;
