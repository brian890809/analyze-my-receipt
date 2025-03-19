"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import DataTable from '@/components/DataTable';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

const aggredgateData = (data) => {
  const categories = new Map()
  categories.set("CurrenciesTotal", new Map())
  categories.set("CategoriesTotal", new Map())

  const currencyTotal = categories.get("CurrenciesTotal")
  const categoryTotal = categories.get("CategoriesTotal")

  data.forEach((entry) => {
    const category = entry.category
    const currency = entry.currency

    currencyTotal.set(currency, (currencyTotal.get(currency) || 0) + entry.grandTotal)
    categoryTotal.set(category, (categoryTotal.get(category) || 0) + entry.grandTotal)
  })  
  return categories
}

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [data, setData] = useState([]);
  const router = useRouter();
  if (!user) {
    router.push("/login");
  }
  
  useEffect(() => {
    fetch('/api/fetch-data')
      .then((response) => response.json())
      .then((data) => {
        setData(data);
      });
  }, [user])
  console.log("loading", loading)
  if (loading) {
    return <div>Loading...</div>;
  }

  const sortedByDate = data.sort((a, b) => new Date(b.date) - new Date(a.date))
  const categories = aggredgateData(sortedByDate)
  const currencyTotal = categories.get("CurrenciesTotal")
  const categoryTotal = categories.get("CategoriesTotal")
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Your Current Spending</h1>
      <div className="mt-8 flex justify-center">
        <Link href="/add-new-receipt">
          <Button variant="outline">Add a new Receipt</Button>
        </Link>
      </div>
      <div className="flex flex-row justify-around mb-4">
        <div>
          <h2 className="text-xl font-bold">Total Spent by Currency</h2>
          <ul>
            {Array.from(currencyTotal).map(([currency, total]) => (
              <li key={currency}>{currency}: {Math.round((total + Number.EPSILON) * 100) / 100}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-bold">Total Spent by Category</h2>
          <ul>
            {Array.from(categoryTotal).map(([category, total]) => (
              <li key={category}>{category}: {Math.round((total + Number.EPSILON) * 100) / 100}</li>
            ))}
          </ul>
        </div>
      </div>
      <DataTable data={sortedByDate} />
    </div>
  );
}