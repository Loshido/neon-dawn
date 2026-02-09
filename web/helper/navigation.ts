import { type Page, pages_id, showTemplate } from "./main"

// parse the hash and checks if it is a page
function parseHash(hash: string) {
    const id = hash.slice(1)
    if(pages_id.includes(id)) {
        return id as Page
    }
    return undefined
}

// setup the hash navigation and return the current hash
export function setupHashNavigation() {
    const hash = parseHash(location.hash)
    window.addEventListener('hashchange', e => {
        const id = parseHash(new URL(e.newURL).hash)
        if(!id) return

        showTemplate(id)
    }) 

    return hash
}

export function setupSearchParams() {
    if(location.search.includes('embedded')) 
        sessionStorage.setItem('embedded', '1')

    if(sessionStorage.getItem('embedded') === '1')
        document.body.classList.add('embedded')
}

export function computeDesiredPage(): Page {
    const hash = setupHashNavigation()
    const lastPage = localStorage.getItem('last-page') as Page | null

    return hash || lastPage || 'introduction'
}