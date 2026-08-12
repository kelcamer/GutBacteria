import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
//
// base: './' (relative asset paths) rather than a hardcoded absolute path,
// because where this ends up served is still an open question - for now
// the deploy workflow puts it at /GutBacteria/react-preview/ alongside the
// untouched existing app (see .github/workflows/deploy-react-port.yml for
// why), but that's explicitly a temporary preview arrangement, not the
// final URL. Relative paths work correctly regardless of the subpath, no
// config change needed when that eventually moves. There's no client-side
// router in this app (tab switching is plain useState, matching the
// original), so relative base has no routing caveats to worry about here.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
