export type SeafoodItem = {
    category: string,
    description: string,
    fairfield: string,
    fairfieldStatus: string,
    eastgate: string,
    eastgateStatus: string,
}

export const getPrice = (item: SeafoodItem, userIP: string, selectedStore: string): string => {

    if (selectedStore == 'fairfield') {
        return item.fairfield
    }

    if (selectedStore == 'eastgate') {
        return item.eastgate
    }

    if (userIP == "74.219.230.226") {
        return item.fairfield
    }

    if (userIP == "74.219.230.226") {
        return item.eastgate
    }

    return item.fairfield
}

const endpoints = {
    proxy: 'api/seafood.json',
    online: 'https://mobile-api.junglejims.com/seafood.json',
}

export const fetchSeafoodData = async (): Promise<SeafoodItem[]> => {
    try {
        const response = await fetch(import.meta.env.PROD ? endpoints.online : endpoints.proxy);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const seafoodData = await response.json();
        console.log(seafoodData);
        return seafoodData.seafood as SeafoodItem[]
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error; // Ensure the error is propagated if necessary
    }

}

export const searchItems = (seafoodItems: SeafoodItem[], searchQuery: string): SeafoodItem[] => {
    // filter bottle list based on query match, runs more frequently
    const cleanQuery = `${searchQuery}`.toLowerCase()
    if (cleanQuery) {
        return seafoodItems.filter((item) => {
            return (
                `${item.category}`?.toLowerCase().includes(cleanQuery) ||
                ` ${item.description}`?.toLowerCase().includes(cleanQuery) ||
                `${item.eastgate}`?.toLowerCase().includes(cleanQuery) ||
                `${item.fairfield}`?.toLowerCase().includes(cleanQuery)
            );
        })
    } else {
        return seafoodItems
    }
}

export const filterCategory = (seafoodItems: SeafoodItem[], selectedCategories: string[]): SeafoodItem[] => {
    // a more lightweight version that runs on an array of queries
    //console.log(additionalQueries);

    if (selectedCategories.length > 0) {
        return seafoodItems.filter((item) => {
            return selectedCategories.some((query) => {
                return (
                    item.category?.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase().includes(query.toLowerCase())
                );
            });
        });
    } else {
        return seafoodItems
    }
}

export const filterTypes = (seafoodItems: SeafoodItem[], selectedTypes: string[]): SeafoodItem[] => {
    // a more lightweight version that runs on an array of queries
    //console.log(additionalQueries);

    if (selectedTypes.length > 0) {
        return seafoodItems.filter((item) => {
            return selectedTypes.some((query) => {
                return (
                    item.description?.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase().includes(query.toLowerCase())
                );
            });
        });
    } else {
        return seafoodItems
    }
}


export const sortBottles = (filteredSeafoodItems: SeafoodItem[], sortQuery: string, store:string, IP: string): SeafoodItem[] => {
    // Sort the filtered array by Vintage year, with undated bottles at the bottom
    const cleanPrice = (price: string): number => {
        // Remove non-numeric characters except periods (.) using a regex
        const cleanedPrice = `${price}`.replace(/[^0-9.]/g, '');
        return cleanedPrice === "" ? 0.0 : parseFloat(cleanedPrice); // Convert cleaned string to a float
    };

    if (sortQuery === '') {
        return filteredSeafoodItems
    } else {
        let sortedSeafoodItems: SeafoodItem[] = filteredSeafoodItems
        switch (sortQuery) {
            case "price ascending":
                {
                    filteredSeafoodItems.sort((a, b) => {
                        const aPrice = cleanPrice(getPrice(a, store, IP) ?? '99999999'); // Convert price to number
                        const bPrice = cleanPrice(getPrice(b, store, IP) ?? '99999999');

                        return aPrice - bPrice; // Ascending order by Price
                    })
                    break;
                }
            case "price descending":
                {
                    filteredSeafoodItems.sort((a, b) => {
                        const aPrice = cleanPrice(getPrice(a, store, IP) ?? '0'); // Convert price to number
                        const bPrice = cleanPrice(getPrice(b, store, IP) ?? '0');

                        return bPrice - aPrice; // Ascending order by Price
                    })
                    break;
                }
            case "alphabetically":
                {
                    filteredSeafoodItems.sort((a, b) => {
                        return a.description?.localeCompare(b.description);
                    })
                    break;
                }


        }


        return sortedSeafoodItems
    }
}

export const assembleSeafoodTypes = (seafoodItems: SeafoodItem[], types: string[]): string[] => {

    // Create a Set to store wine types that appear in the descriptions or countries
    const matchingTypes = new Set<string>();

    // Loop through each wine bottle
    seafoodItems.forEach((item) => {
        const description = item.description?.toLowerCase();
        const category = item.category?.toLowerCase();

        // Check each wine type if it's in the description or country
        types.forEach((type) => {
            const typeLower = type?.toLowerCase();

            // Add to set if found in either description or country
            if (description?.includes(typeLower) || category?.includes(typeLower)) {
                matchingTypes.add(type);
            }
        });
    });
    const sortedTypes = Array.from(matchingTypes).sort((a, b) => {
        return a.localeCompare(b);
    })
    console.log(sortedTypes);
    
    // Return only wine types that matched
    return sortedTypes;
};

export const seafoodTypes = [
    // Finfish
    "Salmon",
    "Tuna",
    "Cod",
    "Trout",
    "Halibut",
    "Snapper",
    "Mackerel",
    "Sardine",
    "Haddock",
    "Pollock",
    "Swordfish",
    "Tilapia",
    "Bass",
    "Flounder",
    "Sole",
    "Grouper",
    "Barramundi",
    "Anchovy",
    "Catfish",
    "Basa",
    "Pangasius",
    "Smelt",
    "Anglerfish",
    "Bream",
    "Perch",
    "Pike",
    
    // Shellfish
    "Shrimp",
    "Prawns",
    "Lobster",
    "Crab",
    "Crawfish",
    "Oysters",
    "Mussels",
    "Clams",
    "Scallops",
    "Abalone",
    "Cockle",
    "Periwinkle",
    
    // Cephalopods
    "Octopus",
    "Squid",
    "Cuttlefish",
    
    // Roe
    "Caviar",
    "Salmon Roe (Ikura)",
    "Flying Fish Roe (Tobiko)",
    "Capelin Roe (Masago)",
    "Lumpfish Roe",
    
    // Echinoderms and other invertebrates
    "Sea Urchin (Uni)",
    "Sea Cucumber",
    
    // Additional types
    "Jellyfish"
  ];
  

import '../../Default CSS/907ce8a0_ai1ec_parsed_css.css'
export const setDevelopmentStyles = () => {
    console.log('setting dev styles');
    
    const DevelopmentStyles = [
        '<link rel="stylesheet" href="../../Default CSS/907ce8a0_ai1ec_parsed_css.css">',
        '<link rel="stylesheet" href="../../Default CSS/ajax-load-more.min.css">',
        '<link rel="stylesheet" href="../../Default CSS/all.css">',
        '<link rel="stylesheet" href="../../Default CSS/bootstrap.min.css">',
        '<link rel="stylesheet" href="../../Default CSS/calendar.css">',
        '<link rel="stylesheet" href="../../Default CSS/czo1ptk.css">',
        '<link rel="stylesheet" href="../../Default CSS/item-search-frontend.css">',
        '<link rel="stylesheet" href="../../Default CSS/jquery.fancybox.css">',
        '<link rel="stylesheet" href="../../Default CSS/jquery.fancybox.min.css">',
        '<link rel="stylesheet" href="../../Default CSS/js_composer.min.css">',
        '<link rel="stylesheet" href="../../Default CSS/perfect-columns.css">',
        '<link rel="stylesheet" href="../../Default CSS/print.min.css">',
        '<link rel="stylesheet" href="../../Default CSS/style-wp.css">',
        '<link rel="stylesheet" href="../../Default CSS/style.css">',
        '<link rel="stylesheet" href="../../Default CSS/style2.css">',
        '<link rel="stylesheet" href="../../Default CSS/styles__ltr.css">',
        '<link rel="stylesheet" href="../../Default CSS/styles.css">',
        '<link rel="stylesheet" href="../../Default CSS/v4-shims.css">',
    ]
    DevelopmentStyles.forEach(style => {
        const template = document.createElement('template');
        template.innerHTML = style.trim(); // Avoid whitespace issues
        document.head.appendChild(template.content);
    });
}

export const setWPStyles = () => {

    // get scrollbar width
    const scrollbarWidth = document.documentElement.clientWidth - window.innerWidth

    // brute force the correct widths and overflow properties
    const wrapper: HTMLDivElement | null = document.getElementById('wrapper') as HTMLDivElement
    const root: HTMLDivElement | null = document.getElementById("root") as HTMLDivElement
    const btn: HTMLLinkElement | null = document.querySelector("#header > div > div.header-holder > div.sub-nav > a")
    const header: HTMLLinkElement | null = document.querySelector("#header")

    const wrapperStyle = {
        overflow: 'visible',
        width: `calc(100svw + ${scrollbarWidth}px)`
    }
    const rootStyle = {
        width: `calc(100svw + ${scrollbarWidth}px)`
    }

    const btnStyle = {
        width: 'auto',
        whiteSpace: 'normal', // Equivalent to text wrapping
        overflow: 'visible'
    };

    const navStyle = {
        position: 'relative',
        zIndex: 101,
    };

    // Apply each style from the object to the element
    wrapper && Object.assign(wrapper.style, wrapperStyle);
    root && Object.assign(root.style, rootStyle);
    btn && Object.assign(btn.style, btnStyle);
    header && Object.assign(header.style, navStyle);

}