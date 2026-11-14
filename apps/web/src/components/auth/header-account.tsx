"use client";

import { LogOut } from "lucide-react";

import { useAuthModal } from "@/components/auth/auth-modal-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type HeaderAccountProps = {
  /** Classes for the quiet "Entrar" button and the account trigger. */
  className?: string;
  /** Classes for the highlighted "Criar conta" button. */
  ctaClassName?: string;
};

/** Signed out: "Entrar" + "Criar conta", both opening the auth modal. Signed in: account menu. */
export function HeaderAccount({ className, ctaClassName }: HeaderAccountProps) {
  const { open } = useAuthModal();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <span className={cn(className, "min-w-20")} aria-hidden="true" />;
  }

  const user = session?.user;
  if (!user) {
    return (
      <>
        <button type="button" className={cn(className, "min-w-20")} onClick={() => open()}>
          Entrar
        </button>
        <button type="button" className={ctaClassName} onClick={() => open()}>
          Criar conta
        </button>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className} aria-label="Abrir menu da conta">
        <UserAvatar name={user.name} email={user.email} image={user.image} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void authClient.signOut()}>
          <LogOut />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserAvatar({
  name,
  email,
  image,
}: {
  name: string;
  email: string;
  image?: string | null;
}) {
  if (image) {
    return <img src={image} alt="" className="size-7 rounded-full object-cover" />;
  }

  const initial = (name || email).charAt(0).toUpperCase();
  return (
    <span className="flex size-7 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-xs">
      {initial}
    </span>
  );
}
