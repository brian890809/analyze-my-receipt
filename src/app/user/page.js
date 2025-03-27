'use client'

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
import { X } from "lucide-react"
import { validateEmail } from '@/util/validate';

const UserBreadcrumb = () => (
    <Breadcrumb>
        <BreadcrumbList>
            <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
            <BreadcrumbPage>User Emails</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>
)

export default function UserSettingsPage() {
    const { user, loading: AuthLoading } = useAuth();
    const [userId, setUserId] = useState(null)
    const [emails, setEmails] = useState([]) // for existing
    const [newEmails, setNewEmails] = useState([""]) // for new
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter()

    useEffect(() => {
        if (!user && !AuthLoading) {
            router.push("/login"); // Redirect to login if not authenticated
        }
        if (user) {
            setUserId(user.uid)
        }
    }, [user, AuthLoading, router]);
    
    useEffect(() => {
        if (!userId) {
            return
        }
        // get list of emails from backend
        const type = "POST"
        const headers = {
            "Content-Type": "application/json",
        }
        const body = JSON.stringify({ 
            userId
        })
        fetch('/api/get-user-emails', { method: type, headers, body })
        .then((res) => res.json())
        .then((data) => {
            if (data.emails && data.emails.length > 0) {
                setEmails(data.emails)
            } else {
                setEmails([])
            }
        })
    }, [userId])
    const handleInputChange = (value, index) => {
        const list = [...newEmails]
        list[index] = value
        setNewEmails(list)
    }
    
    const addNewInput = () => {
        setNewEmails([...newEmails, ""])
    }
    
    const removeInput = (index) => {
        if (newEmails.length > 1) {
            const newList = newEmails.filter((_, i) => i !== index)
            setNewEmails(newList)
        } else {
            setNewEmails([""])
        }
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        const allValid = newEmails.every(email => validateEmail(email) === true)
        if (!allValid) {
            console.log("Some inputs are not valid emails, please try again")
            return
        }
        // submit emails here along with userId
        const type = "POST"
        const headers = {
            "Content-Type": "application/json",
        }
        const body = JSON.stringify({ 
            userId,
            emails: newEmails
        })
        const res = await fetch('/api/new-user-emails', { method: type, headers, body })
        const data = await res.json()
        if (res.ok) {
            setSuccess("Emails added successfully")
            router.refresh()
        } else {
            setError(data.error)
        }

    }
    return (
        <div className="min-h-screen p-6 max-w-2xl m-auto">
            <UserBreadcrumb />
            <div className="mt-10 flex items-center justify-center">
                <div className="">
                    <h1 className="text-2xl font-bold mb-4">User Emails</h1>
                    {emails.length === 0 ? (<span className="text-sm text-gray-700">No Emails Associated Yet</span>) : (
                        emails.map((email, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-2"
                            >
                                <span className="text-sm text-gray-700">{email.emailOrUid.slice(6)}</span>
                            </div>
                        ))
                    )}
                    <h1 className="text-2xl font-bold my-4">Additional Emails</h1>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="urlInput" className="block text-sm font-medium mb-3">
                            Enter additional emails to be included in the dashboard:
                        </label>
                        <div className="flex flex-col content-center items-center gap-4 mb-5">
                            {newEmails.map((input, index) => (
                                <div key={index} className="flex flex-row w-full gap-4">
                                    <Input
                                        value={input}
                                        onChange={(e) => handleInputChange(e.target.value, index)}
                                        placeholder="example@me.com"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => removeInput(index)}
                                        aria-label="Remove input"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                        </div>
                        <div className="flex justify-between">
                            <Button type="button" variant="outline" onClick={addNewInput}>
                                Add New
                            </Button>
                            <Button type="submit">
                                {loading ? "Submitting..." : "Submit"}
                            </Button>
                        </div>
                    </form>
                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert variant="success" className="mt-4">
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </div> 
        </div>
    );
}