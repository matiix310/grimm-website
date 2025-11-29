"use client";

import { Menu, X } from "lucide-react";
import { Button } from "../ui/Button";
import React from "react";
import { MenuButton } from "./Navbar";
import Link from "next/link";

type MobileMenuProps = {
  buttons: MenuButton[];
};

const MobileMenu = ({ buttons }: MobileMenuProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="size-10 [&>svg]:size-8 z-20"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X /> : <Menu />}
      </Button>
      {open && (
        <div className="fixed top-20 left-0 h-screen w-screen z-10 bg-background flex flex-col">
          {buttons.map((button) => (
            <Link key={button.link} href={button.link} onClick={() => setOpen(false)}>
              <Button
                size="lg"
                variant={button.variant}
                className="w-full rounded-none text-2xl py-7"
              >
                {button.name}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export { MobileMenu };
