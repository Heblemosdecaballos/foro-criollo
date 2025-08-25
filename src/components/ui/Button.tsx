// src/components/ui/Button.tsx
import { cn } from "@/src/lib/utils";
export default function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("btn btn-olive", className)} {...props} />;
}
