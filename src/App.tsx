import { useEffect, useRef, useState } from 'react'
import './App.css'
import { fetchSeafoodData, filterCategory, searchItems, sortBottles, SeafoodItem, setDevelopmentStyles, setWPStyles, assembleSeafoodTypes, seafoodTypes, filterTypes } from './utils'
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
  const [types, setTypes] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortQuery, setSortQuery] = useState<string>('')
  const [store, setStore] = useState<string>('')
  const [userIP, setUserIP] = useState<string>('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [viewportRes, setViewportRes] = useState({ x: window.innerWidth, y: window.innerHeight })
  const [isMobile, setIsMobile] = useState(viewportRes.x < 650)
  const [jcfDestroyed, setJcfDestroyed] = useState<boolean>(false)
  const [navHeight, setNavHeight] = useState<number>(50)
  const sortRef = useRef<HTMLSelectElement>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {  //execute the initial fetches
    console.log("v .1");


    import.meta.env.PROD ? undefined : setDevelopmentStyles()
    setTimeout(setWPStyles, 500);

    // get user IP
    fetch('https://api64.ipify.org?format=json')
      .then(response => response.json())
      .then(data => { console.log('User IP:', data.ip); setUserIP(data.ip) })
      .catch(error => console.error('Error fetching IP:', error));

    const fetchData = async () => {
      try {
        //console.log("Fetching data");
        const data = await fetchSeafoodData();
        setSeafoodItems(data);
        setFilteredSeafoodItems(data)
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


  useEffect(() => { // set the loading state of the app when filtered bottles is set successfully
    if (appLoading && (seafoodItems.length > 0)) {
      setAppLoading(false)
    }
    console.log("filteredSeafoodItems: ", filteredSeafoodItems.length);
  }, [filteredSeafoodItems])


  useEffect(() => { // assemble list of wine types and countries to reference
    // map to get an array of categories 
    const categories = seafoodItems
      .map(item => item.category?.replace(/[^a-zA-Z0-9\s]/g, '').trim())
      .filter(category => category); // Filter out empty or whitespace-only item
    const uniqueCategories = Array.from(new Set(categories));
    setCategories(uniqueCategories)



    /* AUTO GENERATED MATCHING SEAFOOD TYPES */
    setTypes(assembleSeafoodTypes(seafoodItems, seafoodTypes))
  }, [seafoodItems])


  useEffect(() => {  // when the user searches for a keyword, filter it here
    const filteredList = orderedBottles()
    setFilteredSeafoodItems(filteredList)
  }, [searchQuery])


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


  const orderedBottles = (): SeafoodItem[] => {
    // wine type > country > search query > sort
    return sortBottles(searchItems(filterCategory(filterTypes(seafoodItems, selectedTypes), selectedCategories), searchQuery), sortQuery, store, userIP)
  }

  const onSort = () => {
    const currentVal = sortRef.current?.value ?? ''
    setSortQuery(currentVal)

    const sortedList = sortBottles(filteredSeafoodItems, currentVal, store, userIP)
    setFilteredSeafoodItems(sortedList)
  }

  const handleFilterCategory = (query: string) => {
    const newArray = selectedCategories;
    if (newArray.includes(query)) {
      newArray.splice(newArray.indexOf(query), 1)
    } else {
      newArray.push(query)
    }
    console.log(newArray);

    setSelectedCategories(newArray)
    const filteredList = orderedBottles()
    setFilteredSeafoodItems(filteredList)
  }

  const handleFilterDescription = (query: string) => {
    const newArray = selectedTypes;
    if (newArray.includes(query)) {
      newArray.splice(newArray.indexOf(query), 1)
    } else {
      newArray.push(query)
    }
    console.log(newArray);

    setSelectedTypes(newArray)
    const filteredList = orderedBottles()
    setFilteredSeafoodItems(filteredList)
  }


  return (
    <>
      <div id="appContainer" ref={appContainerRef}>
        <div style={{
          position: "relative",
          transform: `${isMobile ? 'none' : 'translateY(8px)'}`
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: `${isMobile ? 'relative' : 'absolute'}`,
            width: `${isMobile ? '90svw' : '60svw'}`,
          }}>
            <h1 style={{
              textAlign: 'left',
              color: '#e9e5d4',
              margin: 0,
            }}>
              Popular Seafood Items
            </h1>
          </div>
        </div>

        <div id='toolbarWrapper' style={{ top: `${navHeight + 10}px` }}>
          <div className='filterToolbar'>

            {/* Select Store */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '6px', alignItems: 'center', }}>
              <select id="chooseStore" className="noAppearance" style={{
                width: 'min-content',
              }}
                onChange={(e) => { setStore(e.currentTarget.value) }}>
                <option value="">Change Store</option>
                <option value="fairfield">Fairfield</option>
                <option value="eastgate">Eastgate</option>
              </select>
              <span style={{ height: "min-content" }} className="material-symbols-outlined selectChevron">keyboard_arrow_down</span>
            </div>

            {/* Sort Button */}
            <div style={{ position: 'relative' }}>
              <select id="sortWidget" className="noAppearance" ref={sortRef} onChange={onSort}
                style={{ textAlign: "left", zIndex: 1, width: '63px', }}>
                <option value={''}>Sort</option>
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
            <div className='inputWrapper'>
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
                <WithPopUp viewportRes={viewportRes} title='Ad Categories' scrollable={true}>
                  <FilterPanel filters={categories} activeFilters={selectedCategories} handleFilter={handleFilterCategory} />
                </WithPopUp>
                <WithPopUp viewportRes={viewportRes} title='Fish Types' scrollable={true}>
                  <FilterPanel filters={types} activeFilters={selectedTypes} handleFilter={handleFilterDescription} />
                </WithPopUp>

              </div> : undefined
          }
        </div>



        <p style={{ color: "#e9e5d4", fontWeight: 500, fontStyle: 'italic', width: '100%', textAlign: 'right', paddingRight: '6px', margin: 0 }}>
          {filteredSeafoodItems.length} Results
          {selectedCategories.length > 0 && ` >`}
          {selectedCategories.map((filter, index) => {
            return <span key={index}>{` ${filter}${index == selectedCategories.length - 1 ? `` : `,`}`}</span>
          })}

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
                    <WithSidePanel viewportRes={viewportRes} scrollable={true}>
                      <FilterPanel filters={types} activeFilters={selectedTypes} handleFilter={handleFilterDescription} />
                    </WithSidePanel>
                  </div> : undefined
              }
              <div id="seafoodList">
                {filteredSeafoodItems.length > 0 ? filteredSeafoodItems.map((item, index) => {
                  return <SeafoodCard key={index} item={item} store={store} IP={userIP}></SeafoodCard>
                }) : <div style={{ flexDirection: 'column' }} className='wineBottle'><p>No Wine Bottles Found</p><p>{notFoundIcons[Math.floor(Math.random() * 4)]}</p></div>}
              </div>
            </div>
        }
      </div >
    </>
  )
}

export default App