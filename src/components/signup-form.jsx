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

export default function SignUpPage({
    className,
    formData, 
    onInputChange, 
    onSubmit,
    states,
    ...props
  }) {
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
                    <form onSubmit={onSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstname" className="block text-sm">
                                            First name
                                        </Label>
                                        <Input type="text" required name="firstname" id="firstname" placeholder="Haiwen" onChange={onInputChange} value={formData.firstname} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastname" className="block text-sm">
                                            Last name
                                        </Label>
                                        <Input type="text" required name="lastname" id="lastname" placeholder="Wang" onChange={onInputChange} value={formData.lastname} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="block text-sm">
                                        Email
                                    </Label>
                                    <Input type="email" required name="email" id="email" placeholder="m@example.com" onChange={onInputChange} value={formData.email} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-title text-sm">
                                        Password
                                    </Label>
                                    <Input type="password" required name="password" id="password" className="input sz-md variant-mixed" onChange={onInputChange} value={formData.password} />
                                </div>
                                <Button className="w-full" type="submit">
                                    Sign Up
                                </Button>
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
