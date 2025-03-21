"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// import { handleConfirmSignUp } from "@/lib/cognitoActions";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";

function ConfirmButton({children}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" aria-disabled={pending}>
      {children}
    </Button>
  );
}

export function ConfirmPage({
  className,
  ...props
}) {
  // const [errorMessage, dispatch] = useActionState(handleConfirmSignUp, undefined);
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Please confirm your email</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={() => {}}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="grid gap-3">
                <Label >Code</Label>
                <Input id="code" required />
              </div>
              <div className="flex flex-col gap-3">
                <ConfirmButton>
                  Confirm
                </ConfirmButton>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
            <div className="mt-4 text-center text-sm">
              Didn&apos;t receive an email?{" "}
              <a href="#" className="underline underline-offset-4">
                Resend Code
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
