Frontend build and deployment

Usage:

1. Install dependencies:
   cd frontend
   npm install

2. Create optimized build (minifies assets and copies to dist/):
   npm run build

3. Serve the dist folder using your static server (nginx, static hosting, or the backend Express server which will serve dist if present):
   Example (local): npx http-server frontend/dist -p 8080

Notes and suggestions:
- The build keeps only minified .min.js and .min.css files in dist/ to reduce payload.
- Fonts are loaded via Google Fonts. For privacy and faster loading consider self-hosting or using font-display swap.
- Consider adding content-hash fingerprinting for long-term caching and cache-busting on deploy.
- Optional: enable source maps in minify.js for easier debugging in production; ping me and I will add them.
