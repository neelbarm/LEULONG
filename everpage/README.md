# EverPage — landing page & waitlist

An animated, book-themed landing page for **EverPage**, the reading app that
turns reading into a streak you won't want to break. The whole site is built
like a physical book: you open the cover, and every feature is a two-page
spread with a center gutter, page numbers, and a bookmark that tracks how far
you've read.

## Highlights
- **Open-the-book intro** — a 3D wine-and-gold cover that swings open (click, tap, or Enter).
- **Spreads for each feature** using the app's real brand copy: Shelf, Daily Streaks & Goals, Read with Friends, Beautiful Reading Stats, and the waitlist.
- **Live app screens** shown in floating, mouse-tilting phone mockups.
- **Motion everywhere**: gold-foil shimmer, floating paper particles, count-up stats, an animated goal ring + flame, filling compare bars, a spark chart, and a waitlist that rains little books.
- **Waitlist form** with a success "shelf ticket" and running reader count.
- Fully responsive, `prefers-reduced-motion` aware, no build step, no framework.

## Files
```
everpage/
  index.html     structure / content
  styles.css     brand system + all animations
  app.js         open-the-book, scroll reveals, canvas fx, waitlist
  assets/        the app screenshots used in the phone mockups
```

## Run it
It's static. Just open `index.html` in a browser, or serve the folder:
```bash
cd everpage
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Connect real email capture
The form works in demo mode out of the box (it stores signups in
`localStorage` so the counter feels alive). To collect emails for real, set one
value in `app.js`:
```js
const FORM_ENDPOINT = "https://formspree.io/f/XXXXXXXX"; // or your own API
```
Any endpoint that accepts a JSON `{ "email": "..." }` POST works
(Formspree, Buttondown, a Vercel serverless function, etc.). Until you set it,
signups are kept locally only.

## Deploy
Static, so it drops onto any host. On Vercel: point a project at this folder
(no build command, output = the folder itself) and it ships as-is.

## Notes
- Fonts load from Google Fonts (Fraunces + Inter) with Georgia / system-font
  fallbacks, so it still looks right if fonts are blocked.
- Social links point to the official EverPage Instagram, TikTok, and Substack.
