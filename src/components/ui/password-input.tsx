"use client";

import { useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "~/lib/utils";

export function PasswordInput({
  className,
  showButtonClassName,
  ...props
}: Exclude<React.ComponentProps<"input">, "type"> & {
  showButtonClassName?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("rounded-r-none border-r-0", className)}
        {...props}
      />
      <Button
        variant="outline"
        className={cn("h-9 w-9 rounded-l-none border-l-0", showButtonClassName)}
        onClick={(e) => {
          e.preventDefault();
          setShowPassword((prev) => !prev);
        }}
      >
        {showPassword ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </Button>
    </div>
  );
}
