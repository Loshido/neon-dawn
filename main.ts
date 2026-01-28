// deno -A main.ts
// bun main.ts

const eventSource = new EventSource("http://localhost/listen")

eventSource.addEventListener('open', _ => console.log('open'))
eventSource.addEventListener('message', e => console.log(e.data))
eventSource.addEventListener('error', console.log)