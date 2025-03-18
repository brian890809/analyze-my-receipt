"use client";

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { handleSignUp } from "@/lib/cognitoActions";

function SignUpButton({children}) {
    const { pending } = useFormStatus();
  
    return (
      <Button className="w-full" aria-disabled={pending}>
        {children}
      </Button>
    );
  }

export default function SignUpPage({
    className,
    ...props
}) {
    const [errorMessage, dispatch] = useActionState(handleSignUp, undefined);
    return (
        <section className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>
                        Welcome! Create an account to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch}>
                        <div className="flex flex-col gap-6">
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstname" className="block text-sm">
                                            Firstname
                                        </Label>
                                        <Input type="text" required name="firstname" id="firstname" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastname" className="block text-sm">
                                            Lastname
                                        </Label>
                                        <Input type="text" required name="lastname" id="lastname" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="block text-sm">
                                        Email
                                    </Label>
                                    <Input type="email" required name="email" id="email" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pwd" className="text-title text-sm">
                                        Password
                                    </Label>
                                    <Input type="password" required name="pwd" id="pwd" className="input sz-md variant-mixed" />
                                </div>
                                <SignUpButton>Continue</SignUpButton>
                            </div>
                        </div>

                        <div className="mt-4 text-center text-sm">
                            Have an account ?{" "}
                            <Link href="/login" className="underline underline-offset-4">Log In</Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </section>
    )
}
