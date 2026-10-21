"use client";

import { LogOut } from "lucide-react";

import { useAuthModal } from "@/components/auth/auth-modal-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function HeaderAccount({ className }: { className?: string }) {
  const { open } = useAuthModal();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <span className={cn(className, "min-w-20")} aria-hidden="true" />;
  }

  const user = session?.user;
  if (!user) {
    return (
      <button type="button" className={cn(className, "min-w-20")} onClick={() => open()}>
        Entrar
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className} aria-label="Abrir menu da conta">
        <UserAvatar name={user.name} email={user.email} image={user.image} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
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
