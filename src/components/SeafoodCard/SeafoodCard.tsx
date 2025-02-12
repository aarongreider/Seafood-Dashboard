import { getPrice, SeafoodItem } from "../../utils"
import './SeafoodCard.css'

interface cardProps {
    item: SeafoodItem
    store: string
    IP: string
}

export function SeafoodCard({ item, store, IP}: cardProps) {
    return <>
        <div className="seafoodItem">
            <div>
                <p>{item.category}</p>
                <h2>{item.description}</h2>
                
            </div>
            <div>
                <h3>{`${getPrice(item, store, IP) ?? ""}`}</h3>
            </div>
        </div>
    </>
}