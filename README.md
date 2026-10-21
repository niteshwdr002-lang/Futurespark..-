# Future Spark

A responsive, honeybee-inspired educational website built with plain HTML, CSS, and JavaScript.

## Files
- `index.html` — all page sections and the Explore More popup
- `style.css` — layout, honeycomb visual theme, hexagon navigation, responsive styling
- `script.js` — page navigation, popup interactions, quiz, facts, green mission, challenges, and topic details

## Run locally
Open `index.html` in a modern browser. The site does not require a build step or framework. Google Fonts are loaded online; system fonts are used as fallback.

## Publish with GitHub Pages
1. Upload all three website files (`index.html`, `style.css`, `script.js`) to the root of your GitHub repository.
2. Open the repository's **Settings → Pages**.
3. Choose **Deploy from a branch**, select your main branch and `/ (root)`, then save.
4. Wait for GitHub Pages to publish the site and open the URL shown in the Pages settings.

## Notes
- The seven main sections are navigated through the floating bottom hexagon bar.
- Explore More opens four activities: Quick Quiz, Did You Know, Make a Difference, and Future Challenge.
- The contact form opens the visitor's email app using a `mailto:` link. It does not send/store messages by itself; connect a form backend or service if you need submissions delivered automatically.
- This is a static website. Some educational topic cards open interactive detail dialogs rather than separate HTML files, keeping the GitHub Pages upload simple.
