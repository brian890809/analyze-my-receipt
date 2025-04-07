import { TableBody, TableCell, TableRow } from "@/components/ui/table";

const ItemEntry = ({ items }) => {
    return (
        <TableBody>
            {items.map((item, i) => (
                <TableRow key={i}>
                    <TableCell className="w-1/6"></TableCell>
                    <TableCell className="w-1/3">{item.description}</TableCell>
                    <TableCell className="w-1/6">{item.quantity}</TableCell>
                    <TableCell className="w-1/6">{item.price}</TableCell>
                    <TableCell className="w-1/6">{item.total}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    )
}

export default ItemEntry