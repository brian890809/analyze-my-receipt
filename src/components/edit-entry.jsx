"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { marshall } from "@aws-sdk/util-dynamodb";


export default function EditEntry({ isOpen, onClose, entry, onUpdate }) {
  const [formData, setFormData] = useState(entry)
  const [updatedItems, setUpdatedItems] = useState({uuid: entry.uuid, merchant: entry.merchant, time: entry.time})
  // Update form data when user changes
  useEffect(() => {
    setFormData(entry)
  }, [entry])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "total" || name === "tax" || name === "tip" || name === "grandTotal" ) {
      setUpdatedItems((prev) => ({ ...prev, [name]: Number(value) }))
      setFormData((prev) => ({ ...prev, [name]: Number(value) }))
    } else {
      setUpdatedItems((prev) => ({ ...prev, [name]: value }))
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Add merchant#time
    updatedItems["merchant#time"] = `${updatedItems.merchant}#${updatedItems.time}`
    // removing merchant and time from the updatedItems object because DynamoDB does not have these 2 keys
    delete updatedItems.merchant
    delete updatedItems.time
    const returnData = {
      frontend: formData,
      backend: marshall(updatedItems),
    }
    onUpdate(returnData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="max-h-[90vh]">
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input
                id="category"
                name="category"
                type="category"
                value={formData.category}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="Merchant" className="text-right">
                Merchant
              </Label>
              <Input
                id="merchant"
                name="merchant"
                type="text"
                value={formData.merchant}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <Separator />
            <Item items={formData.items} setFormData={setFormData} setUpdatedItems={setUpdatedItems}/>
            <Separator />
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="total" className="text-right">
                Subtotal
              </Label>
              <Input
                id="total"
                name="total"
                type="number"
                value={formData.total}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tax" className="text-right">
                Tax
              </Label>
              <Input
                id="tax"
                name="tax"
                type="number"
                value={formData.tax}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tip" className="text-right">
                Tip
              </Label>
              <Input
                id="tip"
                name="tip"
                type="number"
                value={formData.tip}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grandTotal" className="text-right">
                Grand Total
              </Label>
              <Input
                id="grandTotal"
                name="grandTotal"
                type="number"
                value={formData.grandTotal}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">
                Currency
              </Label>
              <Input
                id="currency"
                name="currency"
                type="text"
                value={formData.currency}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const Item = ({items, setFormData, setUpdatedItems}) => {
  const handleChange = (e, i) => {
    const { name, value } = e.target
    const item = items[i]
    if (name === "price" || name === "quantity") {
      item[name] = Number(value)
    } else {
      item[name] = value
    }
    const newTotal = Number(item.price) * Number(item.quantity)
    item.total = newTotal
    items[i] = item // update the items array with the updated item
    setUpdatedItems((prev) => ({ ...prev, items: items }))
    setFormData((prev) => ({ ...prev, items: items }))
  }
  return items.map((item, i) => (
    <div key={i} className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="description" className="text-right">
        {`Item ${i + 1}`}
      </Label>
      <Input
        id="description"
        name="description"
        type="text"
        value={item.description}
        onChange={(e) => handleChange(e, i)}
        className="col-span-3"
      />
      <Label htmlFor="price" className="col-start-2 text-right">
        Price
      </Label>
      <Input
        id="price"
        name="price"
        type="number"
        value={item.price}
        onChange={(e) => handleChange(e, i)}
        className="col-span-2"
      />
      <Label htmlFor="quantity" className="col-start-2 text-right">
        Quantity
      </Label>
      <Input
        id="quantity"
        name="quantity"
        type="number"
        value={item.quantity}
        onChange={(e) => handleChange(e, i)}
        className="col-span-2"
      />
      <Label htmlFor="total" className="col-start-2 text-right">
        Total
      </Label>
      <Label className="col-span-2">
        {Number(item.price) * Number(item.quantity)}
      </Label>
  </div>
  ))
}
