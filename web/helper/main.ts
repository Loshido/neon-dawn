const main = document.querySelector('main') as HTMLDivElement | null
type Page = 'introduction' | 'objectifs' | 'launch' | 'update' |  'signal' | 'ws' | 'listen'
const pages_id = ['introduction', 'objectifs', 'launch', 'update',  'signal', 'ws', 'listen']

// payload given to pages constructor
export interface Payload {
    navigate(id: Page): void
}

// pages' id along with their constructor
const pages: Record<Page, null | Promise<any & { default: (payload: Payload) => Promise<void> }>> = {
    introduction: null,
    objectifs: null,
    launch: import('./setup/launch'),
    update: import('./setup/update'),
    signal: import('./setup/signal'),
    ws: null,
    listen: import('./setup/listen')
}

// parse the hash and checks if it is a page
function parseHash(hash: string) {
    const id = hash.slice(1)
    if(pages_id.includes(id)) {
        return id as Page
    }
    return undefined
}

// shows the page's template on the document
async function showTemplate(id: Page) {
    if(!main) throw new Error('No main in the page')
    const template = document.getElementById(id + '-template') as HTMLTemplateElement | null
    if(!template) throw new Error('No template for ' + id)

    const transform = () => {
        const clone = document.importNode(template.content, true)
        main.innerHTML = ''
        main.append(clone)
        main.id = id + '-active'
        toggleActive(id)
    }

    if(!document.startViewTransition) transform()
    else document.startViewTransition(transform)

    if(pages[id] !== null) (await pages[id]).default({
        async navigate(id: Page) {
            await showTemplate(id)
        },
    })

    localStorage.setItem('last-page', id)
}

// highlights current active page on the side menu
function toggleActive(id: Page) {
    const div = document.getElementById(id) as HTMLDivElement | null
    if(!div) throw new Error('No div for ' + id)

    document
        .querySelectorAll('aside > div.active')
        .forEach(div => div.classList
            .toggle('active', false))
            
    div.classList.toggle('active', true)
}

// Initializes Menu
Object.keys(pages)
    .map(page => document.getElementById(page) as HTMLDivElement | null)
    .filter(div => !!div)
    .forEach(page => page.addEventListener('click', () => showTemplate(page.id as Page)))

// handles hash navigation
const hash = parseHash(location.hash)
window.addEventListener('hashchange', e => {
    const id = parseHash(new URL(e.newURL).hash)
    if(!id) return

    showTemplate(id)
}) 

// handles page navigation
const lastPage = localStorage.getItem('last-page') as Page | null

// initializes the page
const target: Page = hash || lastPage || 'introduction'
showTemplate(target)