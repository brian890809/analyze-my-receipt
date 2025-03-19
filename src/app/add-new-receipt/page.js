/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState } from "react";
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
import addNewReceipt from "@/pages/api/add-new-receipt";

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

    const validateUrl = (inputUrl) => {
        try {
            new URL(inputUrl);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateUrl(url)) {
            setError("Please enter a valid URL.");
            return;
        }
        
        const localApiUrl = '/api/add-new-receipt'
        const type = "POST"
        const headers = {
            "Content-Type": "application/json",
        }
        const body = JSON.stringify({ url })
        
        setLoading(true);
        try {
            // const response = await addNewReceipt(url);
            const response = await fetch(localApiUrl, { method: type, headers, body });
            const data = await response.json(); 
            if (response.ok) {
                setSuccess("URL submitted successfully!");
            } else {
                setError("Failed to submit the URL. Please try again.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
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