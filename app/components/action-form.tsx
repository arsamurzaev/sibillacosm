"use client";

import type { ComponentProps, FormEvent, ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type ServerAction = (formData: FormData) => Promise<void>;

interface ActionFormProps
  extends Omit<ComponentProps<"form">, "action" | "children" | "onSubmit"> {
  action: ServerAction;
  children: ReactNode;
  resetOnSuccess?: boolean;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  refreshOnSuccess?: boolean;
}

export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
  onSuccess,
  onError,
  refreshOnSuccess = true,
  ...props
}: ActionFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (pending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    setPending(true);

    void (async () => {
      try {
        await action(formData);

        if (resetOnSuccess) {
          form.reset();
        }

        onSuccess?.();

        if (refreshOnSuccess) {
          router.refresh();
        }
      } catch (error) {
        console.error(error);
        onError?.(error);
      } finally {
        setPending(false);
      }
    })();
  };

  return (
    <form
      {...props}
      onSubmit={handleSubmit}
      className={cn(className)}
      aria-busy={pending}
      data-pending={pending ? "true" : "false"}
    >
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
    </form>
  );
}
