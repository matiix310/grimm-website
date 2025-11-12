"use client";

import { redirect } from "next/navigation";
import React from "react";

type SpamLinkProps = {
  href: string;
  count: number;
} & React.ComponentProps<"div">;

const SpamLink = ({ href, count, ...rest }: SpamLinkProps) => {
  const [counter, setCounter] = React.useState(0);

  React.useEffect(() => {
    if (counter >= count) redirect(href);
  }, [counter, count, href]);

  return <div onClick={() => setCounter((old) => old + 1)} {...rest} />;
};

export { SpamLink };
