import React from "react";

import Link, { LinkProps } from "next/link";

type LinkOrButtonProps =
  | LinkProps
  | (Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "href"> & {
      href?: undefined;
    });

const LinkOrButton: React.FC<LinkOrButtonProps> = (props) => {
  if ("href" in props && props.href) {
    return <Link {...props} />;
  } else {
    return (
      <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)} />
    );
  }
};

export default LinkOrButton;
