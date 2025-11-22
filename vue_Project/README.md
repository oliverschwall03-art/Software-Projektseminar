# vue_Project

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur)
## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
## Security Notice

This project uses the **SheetJS (xlsx)** library to support Excel import and export functionality.  
According to `npm audit`, the current version of `xlsx` has the following known vulnerabilities:

- **Prototype Pollution** (GHSA-4r6h-8v6p-xvw6)
- **Regular Expression Denial of Service (ReDoS)** (GHSA-5pgg-2g8v-p4x9)
- **No fixed version is currently available**

### Why the dependency is still used
- This project runs **entirely in the frontend (browser)**
- No **untrusted or user-uploaded** Excel files are processed
- The project is intended for coursework / internal use
- The vulnerabilities are mainly exploitable in **Node.js backend environments**,  
  not in browser-based frontend applications.

Given the limited attack surface and usage scope, the practical risk for this project is **very low**.  
The dependency can be updated once a patched version becomes available.
