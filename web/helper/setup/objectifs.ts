import type { Payload } from "../main";
import '../styles/helper-objectifs.css'

export default async (payload: Payload) => {
    document.querySelectorAll('#objectifs-active button.lvl')
        .forEach(el => el.addEventListener('click', () => el.classList.toggle('active')))

}