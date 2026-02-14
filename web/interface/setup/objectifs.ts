import type { Payload } from "../main";
import '../styles/helper-objectifs.css'

const objectifs: Objectif[] = [
    {
        code: 'nov-1',
        niveau: 0,
        titre: 'Faire décoler un satellite',
        description: "Essayez de faire décoler un satellite avec cette interface"
    },
    {
        code: 'nov-2',
        niveau: 0,
        titre: 'Maîtrisez le satellite',
        description: "Apprenez à manœuvrer votre satellite (changer d’altitude, d’inclinaison, etc.) via l’interface."
    },
    {
        code: 'nov-3',
        niveau: 0,
        titre: 'Essayez de comprendre les échanges',
        description: "Observez les requêtes et réponses entre l’interface et la simulation."
    },

    {
        code: 'deb-1',
        niveau: 1,
        titre: 'Maîtrisez le satellite sans l\'interface',
        description: "Essayez de faire décoler et de manœuvrer votre satellite avec des outils" +
            "\ncomme Postman, Insomnia, Hoppscotch, ThunderClient, <strong>curl</strong>"
    },
    {
        code: 'deb-2',
        niveau: 1,
        titre: 'Maîtrisez le satellite avec du code',
        description: "Essayez de faire décoler et de manœuvrer votre satellite avec code" +
            "<br/>ex: python, bun/deno/node, ..."
    },

    {
        code: 'int-1',
        niveau: 2,
        titre: 'Trajectoire orbitale',
        description: "Faites suivre à votre satellite une trajectoire orbitale" + 
            "<br>(ex : orbite géostationnaire, espacez les signals de 333ms)."
    },
    {
        code: 'int-2',
        niveau: 2,
        titre: 'Temps réel',
        description: "Utilisez Websocket pour envoyez vos instructions." + 
            "<br>Cela réduit la latence de vos requêtes et libère la bande passante."
    },

    {
        code: 'ava-1',
        niveau: 3,
        titre: 'Centre de contrôle',
        description: "Faites une interface pour contrôler votre satellite" + 
            "<br>(ex: faire une page html/js pour changer l'équation de trajectoire en temps réel)."
    },
    {
        code: 'ava-2',
        niveau: 3,
        titre: 'Centre de contrôle mobile',
        description: "Développez une interface responsive pour contrôler votre satellite depuis votre téléphone"
    },
    {
        code: 'ava-3',
        niveau: 3,
        titre: 'Manette',
        description: "Dans une de vos interfaces, permettez de contrôler le satellite avec un joystick virtuel."
    },
    {
        code: 'ava-4',
        niveau: 3,
        titre: 'Sabotage',
        description: "Suivez un satellite à distance fixe, " +
            "vous pouvez écouter les changements de tous les satellites"
    },

    {
        code: 'exp-1',
        niveau: 4,
        titre: 'Centre d\'observation',
        description: "Développez une interface pour contrôler et visualiser le satellite" + 
            "<br>on peut imaginer des graphiques avec l'altitude et/ou la distance parcourue... au cours du temps."
    },
    {
        code: 'exp-2',
        niveau: 4,
        titre: 'Centre d\'observation espion',
        description: "Développez une interface pour d'espionage" + 
            "<br>écoutez les changements de tous les satellites, et faites des statisitiques." +
            "<br>on peut imaginer des graphiques avec la distance entre chaque satellite, l'altitude, la distance ... au cours du temps"
    },
    {
        code: 'exp-3',
        niveau: 4,
        titre: 'Sabotage sur demande',
        description: "Implémentez une fonction d'espion sur demande dans votre interface. " + 
            "Listez les satellites et permettez de saboter n'importe quel satellite " + 
            "lorsque vous appuyez sur le nom du satellite cible."
    },
]

interface Objectif {
    code: string,
    titre: string,
    description: string
    niveau: 0 | 1 | 2 | 3 |4
}

function createObjectif(obj: Objectif) {
    const div = document.createElement('div')
    div.setAttribute('data-lvl', obj.niveau.toString())
    div.setAttribute('data-code', obj.code)

    const h3 = document.createElement('h3')
    h3.innerText = obj.titre
    const p = document.createElement('p')
    p.innerHTML = obj.description

    div.append(h3, p)

    return div
}

export default async (_payload: Payload) => {
    document.querySelectorAll('#objectifs-active button.lvl')
        .forEach(el => el.addEventListener('click', () => el.classList.toggle('active')))
    
    const parent = document.querySelector('div.objectifs') as HTMLDivElement
    objectifs.map(createObjectif).forEach((obj, i) => 
        setTimeout(() => parent.append(obj), 25 * i))
}