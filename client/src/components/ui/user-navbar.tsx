
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, LogOut } from 'lucide-react';

export function UserNavbar({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn(
        "flex items-center space-x-4 lg:space-x-6",
        className
      )}
      {...props}
    >
      <Link
        href="/dashboard"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Dashboard
      </Link>
      <Link
        href="/dashboard/consulta"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Consulta
      </Link>
      <Link
        href="/dashboard/entrenamiento"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Entrenamiento
      </Link>
      <Link
        href="/dashboard/agente"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Agente
      </Link>
    </nav>
  );
}
