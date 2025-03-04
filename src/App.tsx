import { useEffect, useRef, useState } from 'react'
import './App.css'
import { fetchSeafoodData, filterCategory, searchItems, sortSeafood, SeafoodItem, setDevelopmentStyles, setWPStyles, filterStore } from './utils'
import { SeafoodCard } from './components/SeafoodCard/SeafoodCard'
import { FilterPanel, WithPopUp, WithSidePanel } from './components/FilterPanel/FilterPanel'
import { LoadingWidget } from './components/LoadingWidget'

const notFoundIcons = [
  `( ╥﹏╥) ノシ`,
  `( ˘ ³˘)ノ°ﾟº❍｡`,
  `(╯°□°)╯`,
  `(╯’□’)╯︵ ┻━┻`,
]

function App() {
  const [appLoading, setAppLoading] = useState<boolean>(true)
  const [seafoodItems, setSeafoodItems] = useState<SeafoodItem[]>([])
  const [filteredSeafoodItems, setFilteredSeafoodItems] = useState<SeafoodItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  //const [types, setTypes] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortQuery, setSortQuery] = useState<string>('')
  const [selectedStore, setSelectedStores] = useState<string[]>(['fairfield'])
  const [userIP, setUserIP] = useState<string>('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  //const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [viewportRes, setViewportRes] = useState({ x: window.innerWidth, y: window.innerHeight })
  const [isMobile, setIsMobile] = useState(viewportRes.x < 650)
  const [jcfDestroyed, setJcfDestroyed] = useState<boolean>(false)
  const [navHeight, setNavHeight] = useState<number>(50)
  const sortRef = useRef<HTMLSelectElement>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {  //execute the initial fetches
    console.log("v .8");


    import.meta.env.PROD ? undefined : setDevelopmentStyles()
    setTimeout(setWPStyles, 500);

    // get user IP
    fetch('https://api64.ipify.org?format=json')
      .then(response => response.json())
      .then(data => setUserIP(data.ip))
      .catch(error => console.error('Error fetching IP:', error));

    const fetchData = async () => {
      try {
        //console.log("Fetching data");
        const data = await fetchSeafoodData();
        setSeafoodItems(data);
        setFilteredSeafoodItems(filterStore(sortSeafood((data), 'category', selectedStore, userIP), selectedStore))
      } catch {
        //console.log("Error fetching data in useEffect");
      }
    };

    fetchData();
  }, [])


  useEffect(() => { // JCF Setting up the window.onload event inside useEffect
    /* UNBIND JCF FROM SELECT OBJECTS */
    let numRecursions = 0;
    const peskyJCF = () => {
      if (!jcfDestroyed && numRecursions < 10) {
        numRecursions++

        try {
          //console.log("Getting JCF Instance");

          const selectElements = document.querySelectorAll('select');
          //console.log("select object: ", selectElement);

          // Get the jcf instance associated with the select element

          selectElements.forEach((selectElement) => {
            // @ts-ignore
            const jcfInstance = jcf.getInstance(selectElement);

            // Check if instance exists and destroy it
            if (jcfInstance) {
              jcfInstance.destroy();
              console.log("Destroying JCF Instance D:<", jcfInstance);
              setJcfDestroyed(true)
            } else {
              //console.log("NO INSTANCE AHHHH");
              setTimeout(peskyJCF, 500)
            }
          })
        } catch (error) {
          console.log(error);
        }
      }
    }

    window.addEventListener('load', peskyJCF);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('load', peskyJCF);
    };
  }, []);

  useEffect(() => { // assemble list of categories and set app loading status
    // map to get an array of categories 
    const categories = seafoodItems
      .map(item => item.category.trim())
      .filter(category => category); // Filter out empty or whitespace-only item
    const uniqueCategories = Array.from(new Set(categories));
    setCategories(uniqueCategories)

    if (appLoading && (seafoodItems.length > 0)) {
      setAppLoading(false)
    }

    /* AUTO GENERATED MATCHING SEAFOOD TYPES */
    //setTypes(assembleSeafoodTypes(seafoodItems, seafoodTypes))
  }, [seafoodItems])


  useEffect(() => {  // when the user searches for a keyword, filter it here
    const filteredList = orderedSeafood()
    setFilteredSeafoodItems(filteredList)

  }, [searchQuery, selectedStore])


  useEffect(() => { // window size listener
    const handleResize = () => {
      setViewportRes({ x: window.innerWidth, y: window.innerHeight })
      setIsMobile(window.innerWidth < 650)
      setNavHeight(document.getElementById('nav')?.offsetHeight ?? 50)
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize); // Check on resize

    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup
    };
  }, [window.innerWidth, window.innerHeight, seafoodItems]);


  const orderedSeafood = (): SeafoodItem[] => {
    // wine type > country > search query > sort
    return sortSeafood(searchItems(filterCategory(filterStore(seafoodItems, selectedStore), selectedCategories), searchQuery), sortQuery, selectedStore, userIP)
  }

  const onSort = () => {
    const currentVal = sortRef.current?.value ?? ''
    setSortQuery(currentVal)

    const sortedList = sortSeafood(filteredSeafoodItems, currentVal, selectedStore, userIP)
    setFilteredSeafoodItems(sortedList)
  }

  const handleFilterCategory = (query: string) => {
    const newArray = selectedCategories;
    if (newArray.includes(query)) {
      newArray.splice(newArray.indexOf(query), 1)
    } else {
      newArray.push(query)
    }

    setSelectedCategories(newArray)
    const filteredList = orderedSeafood()
    setFilteredSeafoodItems(filteredList)
  }

  const handleFilterStore = (query: string) => {
    let newArray = [query]
    setSelectedStores([...newArray])
    const filteredList = orderedSeafood()

    setFilteredSeafoodItems(filteredList)
  }

  /* const handleFilterDescription = (query: string) => {
    const newArray = selectedTypes;
    if (newArray.includes(query)) {
      newArray.splice(newArray.indexOf(query), 1)
    } else {
      newArray.push(query)
    }

    setSelectedTypes(newArray)
    const filteredList = orderedBottles()
    setFilteredSeafoodItems(filteredList)
  } */


  return (
    <>
      <div id="appContainer" ref={appContainerRef}>
        <div style={{
          position: "relative",
          /* transform: `${isMobile ? 'none' : 'translateY(8px)'}` */
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            position: `${isMobile ? 'relative' : 'absolute'}`,
            width: `${isMobile ? '90svw' : '60svw'}`,
            marginBottom: '8px'
          }}>
            <h1 style={{
              textAlign: 'left',
              color: '#e9e5d4',
              margin: 0,
            }}>
              Popular Seafood Items
            </h1>

            {/* Select Store */}
            <div id="chooseStoreContainer">
              <button id="storeFairfield" className={`chooseStore noAppearance ${selectedStore.includes('fairfield') ? 'active' : ''}`}
                onClick={() => {
                  handleFilterStore('fairfield')
                }}>
                FAIRFIELD
              </button>
              <button id="storeEastgate" className={`chooseStore noAppearance ${selectedStore.includes('eastgate') ? 'active' : ''}`}
                onClick={() => {
                  handleFilterStore('eastgate')
                }}>
                EASTGATE
              </button>
            </div>
            {/* <p style={{textAlign: "left", padding: "2px 5px", color: "#e9e5d4"}}>All items are subject to availability</p> */}



          </div>
        </div>

        <div id='toolbarWrapper' style={{ top: `${navHeight + 10}px` }}>
          <div className='filterToolbar'>

            {/* Sort Button */}
            <div style={{ position: 'relative' }}>
              <select id="sortWidget" className="noAppearance" ref={sortRef} onChange={onSort}
                style={{ textAlign: "left", zIndex: 1, width: '77px', }}>
                <option value={'category'}>Sort</option>
                <option value={'category'}>Category</option>
                <option value={'price descending'}>Most $</option>
                <option value={'price ascending'}>Least $</option>
                <option value={'alphabetically'}>A-Z</option>
              </select>
              <span className="material-symbols-outlined selectChevron" style={{
                position: 'absolute',
                right: '3px',
                zIndex: 0,
              }}>keyboard_arrow_down</span>
            </div>

            {/* Search Bar */}
            <div className='inputWrapper' style={{ flexGrow: `${isMobile ? 1 : 0}` }}>
              <input type="text"
                placeholder="Search..."
                value={searchQuery ?? undefined}
                onChange={(e) => setSearchQuery(e.target.value)} />
              <span className="material-symbols-outlined">search</span>
            </div>
          </div>

          {
            isMobile ?
              <div className='filterToolbar'>
                <WithPopUp viewportRes={viewportRes} title='Categories' scrollable={true}>
                  <FilterPanel filters={categories} activeFilters={selectedCategories} handleFilter={handleFilterCategory} />
                </WithPopUp>
                {/*  <WithPopUp viewportRes={viewportRes} title='Fish Types' scrollable={true}>
                  <FilterPanel filters={types} activeFilters={selectedTypes} handleFilter={handleFilterDescription} />
                </WithPopUp> */}

              </div> : undefined
          }
        </div>



        <p style={{
          color: "#e9e5d4", fontWeight: 500, fontStyle: 'italic', width: '100%', textAlign: 'right', paddingRight: '6px', margin: 0,
          marginBottom: `${!isMobile ? "30px" : 0}`
        }}>
          {filteredSeafoodItems.length} Results
          {selectedCategories.length > 0 && ` >`}
          {selectedCategories.map((filter, index) => {
            return <span key={index}>{` ${filter}${index == selectedCategories.length - 1 ? `` : `,`}`}</span>
          })}
          <br />
          All items are subject to availability
        </p>


        {
          appLoading ? <LoadingWidget /> :
            <div id="listWrapper">
              {
                !isMobile ?
                  <div id="filterWrapper" style={{ top: `${navHeight + 10}px` }}>
                    <WithSidePanel viewportRes={viewportRes} scrollable={true}>
                      <FilterPanel filters={categories} activeFilters={selectedCategories} handleFilter={handleFilterCategory} />
                    </WithSidePanel>
                    {/*  <WithSidePanel viewportRes={viewportRes} scrollable={true}>
                      <FilterPanel filters={types} activeFilters={selectedTypes} handleFilter={handleFilterDescription} />
                    </WithSidePanel> */}
                  </div> : undefined
              }
              <div id="seafoodList">
                {filteredSeafoodItems.length > 0 ? filteredSeafoodItems.map((item, index) => {
                  return <SeafoodCard key={index} item={item} selectedStores={selectedStore} IP={userIP}></SeafoodCard>
                }) : <div style={{ flexDirection: 'column' }} className='wineBottle'><p>None of our seafood matches your search!</p><p>{notFoundIcons[Math.floor(Math.random() * 4)]}</p></div>}
              </div>
            </div>
        }
      </div >
    </>
  )
}

export default App