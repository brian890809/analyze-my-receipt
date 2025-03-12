import DataTable from '@/components/DataTable';
import {fetchData} from '@/fetch-data';

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

export default async function Home() {
  const data = await fetchData();
  const categories = aggredgateData(data)
  const currencyTotal = categories.get("CurrenciesTotal")
  const categoryTotal = categories.get("CategoriesTotal")
  return (
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
      <DataTable data={data} />
    </div>
  );
}