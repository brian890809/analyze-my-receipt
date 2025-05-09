/* eslint-disable react/no-unescaped-entities */
"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
import { validateURL } from '@/util/validate';

const NewReceiptBreadcrumb = () => (
    <Breadcrumb>
    <BreadcrumbList>
        <BreadcrumbItem>
        <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
        <BreadcrumbPage>Add New Receipt</BreadcrumbPage>
        </BreadcrumbItem>
    </BreadcrumbList>
    </Breadcrumb>
)

export default function AddNewReceiptPage() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { user, loading:AuthLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
    if (!AuthLoading && !user) {
        router.push("/login"); // Redirect to login if not authenticated
    }
    }, [user, AuthLoading, router]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateURL(url)) {
            setError("Please enter a valid URL.");
            return;
        }
        if (!user.uid) {
            setError("Please log in to submit a receipt.");
            return;
        }
        
        const localApiUrl = '/api/add-new-receipt'
        const type = "POST"
        const headers = {
            "Content-Type": "application/json",
        }
        const body = JSON.stringify({ 
            url,
            userId: user.uid
        })
        
        setLoading(true);
        try {
            const response = await fetch(localApiUrl, { method: type, headers, body });
            const data = await response.json(); 
            if (response.ok) {
                setSuccess("URL submitted successfully!");
            } else {
                setError("Failed to submit the URL:", data.errors);
            }
        } catch (err) {
            setError("An error occurred:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-6 max-w-2xl m-auto">
            <NewReceiptBreadcrumb />
            <div className="mt-10 flex items-center justify-center">
                <div className="">
                    <h1 className="text-2xl font-bold mb-4">Add New Receipt</h1>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="urlInput" className="block text-sm font-medium mb-2">
                            Enter the receipt page URL:
                        </label>
                        <Input
                            id="urlInput"
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/receipt"
                            className="mb-2"
                        />
                        <small className="block text-gray-500 mb-4">
                            Tip: Ensure the URL starts with "http://" or "https://". <br />
                            For email receipts, forward to <a href="mailto:sendto@analyzemyreceipt.com">sendto@analyzemyreceipt.com</a>
                        </small>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Submitting..." : "Submit"}
                        </Button>
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