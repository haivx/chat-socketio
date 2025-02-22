"use client";
// @TODO: make this server components

import { startTransition, useActionState } from "react";
import * as actions from "@/actions";

const Header = () => {
  const [, action] = useActionState(actions.signOut, {
    success: false,
    message: "",
  });
  const handleLogout = () => {
    startTransition(() => {
      action();
    });
  };
  return (
    <header className="container flex justify-end p-2 mx-auto">
      <span
        className="text-white font-bold cursor-pointer"
        onClick={handleLogout}
      >
        Logout
      </span>
    </header>
  );
};

export default Header;
