"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import DataTable from '@/components/DataTable/DataTable';
import Navbar from '@/components/Navbar';

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
  const { user, loading } = useAuth();
  const [userId, setUserId] = useState(null)
  const [data, setData] = useState([]);
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // Redirect to login if not authenticated
    }
    if (user) {
      setUserId(user.uid)
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!userId) {
      return
    }
    const type = "POST"
    const headers = {
        "Content-Type": "application/json",
    }
    const body = JSON.stringify({ 
        userId,
    })
    fetch('/api/fetch-data', { method: type, headers, body })
      .then((response) => response.json())
      .then((data) => {
        setData(data);
      });
  }, [userId])

  if (loading) {
    return (<p>Loading...</p>);
  }
  
  if (!user) {
    return null;
  }

  const sortedByDate = data.sort((a, b) => new Date(b.date) - new Date(a.date))
  const categories = aggredgateData(sortedByDate)
  const currencyTotal = categories.get("CurrenciesTotal")
  const categoryTotal = categories.get("CategoriesTotal")
  return (
    <>
      <Navbar />
      <div className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">Your Current Spending</h1>
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
    </>
  );
}