"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import DataTable from '@/components/DataTable/DataTable';
import Navbar from '@/components/Navbar';
import TasteProfile from '@/components/TasteProfile';
import { getStandardCurrencyCode } from '@/util/currency-code';
import { parse } from "date-fns";
import { DollarSign, Tag } from "lucide-react";

const aggredgateData = (data) => {
  const categories = new Map()
  categories.set("CurrenciesTotal", new Map())
  categories.set("CategoriesTotal", new Map())

  const currencyTotal = categories.get("CurrenciesTotal")
  const categoryTotal = categories.get("CategoriesTotal")
  data.forEach((entry) => {
    const category = entry.category
    const currency = getStandardCurrencyCode(entry.currency)

    currencyTotal.set(currency, (currencyTotal.get(currency) || 0) + entry.grandTotal)
    categoryTotal.set(category, (categoryTotal.get(category) || 0) + entry.grandTotal)
  })  
  return categories
}

// Format currency properly
const formatCurrency = (amount, currency) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (e) {
    // Fallback for invalid currency codes
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
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
        setData(data.map(entry => ({
          ...entry,
          currency: getStandardCurrencyCode(entry.currency),
          date: parse(entry.date, "yyyy-MM-dd", new Date())
        })));
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
      <div className="min-h-screen p-4 md:p-8 container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Currency Summary Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-border/40 p-6 transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-heading font-semibold text-foreground/90">By Currency</h2>
                </div>
                <div className="space-y-3">
                  {Array.from(currencyTotal).map(([currency, total]) => (
                    <div key={currency} className="flex justify-between items-center border-b border-border/30 pb-2">
                      <span className="font-medium text-foreground/80">{currency}</span>
                      <span className="text-right font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                        {formatCurrency(total, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Category Summary Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-border/40 p-6 transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-foreground to-accent-foreground/70 flex items-center justify-center shadow-sm">
                    <Tag className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-heading font-semibold text-foreground/90">By Category</h2>
                </div>
                <div className="space-y-3">
                  {Array.from(categoryTotal)
                    .sort((a, b) => b[1] - a[1]) // Sort categories by amount (descending)
                    .map(([category, total]) => {
                      // Use USD as default but this could be improved to use the user's preferred currency
                      const primaryCurrency = currencyTotal.size > 0 ? Array.from(currencyTotal.keys())[0] : 'USD';
                      return (
                        <div key={category} className="flex justify-between items-center border-b border-border/30 pb-2">
                          <span className="font-medium text-foreground/80">{category}</span>
                          <span className="text-right font-semibold text-foreground/90">
                            {formatCurrency(total, primaryCurrency)}
                          </span>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-1">
            <TasteProfile />
          </div>
        </div>
        <DataTable data={sortedByDate} />
      </div>
    </>
  );
}