import { computeDesiredPage, setupSearchParams } from './navigation'

const main = document.querySelector('main') as HTMLDivElement | null
export type Page = 'introduction' | 'objectifs' | 'launch' | 'update' |  'signal' | 'ws' | 'listen'
export const pages_id = ['introduction', 'objectifs', 'launch', 'update',  'signal', 'ws', 'listen']

// payload given to pages constructor
export interface Payload {
    navigate(id: Page): void
}

// pages' id along with their constructor
const pages: Record<Page, null | Promise<any & { default: (payload: Payload) => Promise<void> }>> = {
    introduction: null,
    objectifs: import('./setup/objectifs'),
    launch: import('./setup/launch'),
    update: import('./setup/update'),
    signal: import('./setup/signal'),
    ws: null,
    listen: import('./setup/listen')
}


// shows the page's template on the document
export async function showTemplate(id: Page) {
    if(!main) throw new Error('No main in the page')
    const template = document.getElementById(id + '-template') as HTMLTemplateElement | null
    if(!template) throw new Error('No template for ' + id)

    const transform = () => {
        const clone = document.importNode(template.content, true)
        main.innerHTML = ''
        main.append(clone)
        main.id = id + '-active'
    }
    
    toggleActive(id)
    if(!document.startViewTransition) transform()
    else await document.startViewTransition(transform).finished

    
    if(pages[id] !== null) (await pages[id]).default({
        async navigate(id: Page) {
            await showTemplate(id)
        },
    })

    if(id !== 'introduction') location.hash = id
    else location.hash = ''
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

setupSearchParams()

const target = computeDesiredPage()
showTemplate(target)