type Vec3<T> = [T, T, T]

interface Position {
    type: 'Position',
    name: string,
    position: Vec3<number>,
    rotation: Vec3<number> | null
}

interface Launch {
    type: 'Launch',
    name: string,
    color: Vec3<number>,
    payload: string
}

interface Update {
    type: 'Update',
    name: string,
    color: Vec3<number> | null,
    new_name: string | null
}

interface Crash {
    type: 'Crash',
    name: string,
}

interface Sync {
    type: 'Sync',
    satellites: {
        name: string,
        color: Vec3<number>,

        position: Vec3<number>,
        rotation: Vec3<number> | null
    }[]
}

export type Events = Position | Launch | Update | Crash | Sync

interface Callback {
    onOpened: () => void,
    onEvent: (event: Events) => void,
    onClosed: () => void
}

export default (cb: Callback) => {
    const eventSource = new EventSource('/listen')

    eventSource.addEventListener('open', cb.onOpened)
    eventSource.addEventListener('message', e => {
        const data = JSON.parse(e.data) as Events

        cb.onEvent(data)
    })
    eventSource.addEventListener('error', cb.onClosed)
}