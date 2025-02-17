import { getPrice, SeafoodItem } from "../../utils"
import './SeafoodCard.css'

interface cardProps {
    item: SeafoodItem
    selectedStores: string[]
    IP: string
}

export function SeafoodCard({ item, selectedStores, IP }: cardProps) {
    return <>
        <div className="seafoodItem">
            <div>
                <h2 style={{ fontSize: '28px', margin: '0px', lineHeight: 1, textTransform: 'capitalize' }}>
                    {item.description.toLowerCase()}
                </h2>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '12px',
                    rowGap: '2px',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap'
                }}>

                    <p style={{
                        fontSize: '18px',
                        fontWeight: 800,
                        margin: '0px',
                    }}>{item.category}</p>

                    <p style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        margin: '0px',
                    }}>{
                            item.eastgateStatus == "In Stock" && item.fairfieldStatus == "In Stock"
                                ? undefined
                                : /* item.eastgateStatus == "Out of Stock" && item.fairfieldStatus == "Out of Stock"
                                    ? 'OUT OF STOCK' : */
                                item.eastgateStatus == "In Stock"
                                    ? 'EASTGATE ONLY'
                                    : item.fairfieldStatus == "In Stock"
                                        ? 'FAIRFIELD ONLY'
                                        : undefined
                        }</p>
                </div>
            </div>
            <div>
                <h3 style={{
                    fontWeight: 900, textTransform: "lowercase",
                    fontSize: `${getPrice(item, IP, selectedStores) == "Out of Stock" ? '22px' : ''}`
                }}>{`${getPrice(item, IP, selectedStores) ?? ""}`}</h3>
            </div>
        </div>
    </>
}