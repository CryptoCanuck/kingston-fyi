// Side-effect CSS imports from packages (e.g. Payload admin styles) have no type
// declarations; `next build` handles them, but standalone `tsc --noEmit` needs this.
declare module '@payloadcms/next/css'
declare module '*.css'
declare module '*.scss'
