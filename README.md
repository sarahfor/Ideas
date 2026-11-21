# Project Studio

Sarah Forrest’s project notes and interactive experiments, hosted at **[sarahfor.github.io/Ideas](https://sarahfor.github.io/Ideas/)**.

## Included

- **Hot / Cold:** a phone-to-phone and phone-to-object proximity game concept, with an interactive distance and lighting simulation. Hardware ranging and Oasis control are not connected.
- **Intro format:** “Start each intro with sketching the idea on the whiteboard and then turning it into a visual demo.”
- **You run faster than a…:** a stopwatch idea for timing a run from A to B and eventually comparing the runner’s speed with an animal.
- **Astra assistant panel:** a place to draft a question and copy the selected note as context. Astra is not connected to an AI service.

## Notes and privacy

This repository and its GitHub Pages site are public. Published notes are defined in `src/note-data.ts`.

Creating or editing a note in the site saves a **browser draft** in local storage on the current device. It does not change the repository or synchronize across devices. The interface identifies browser drafts and published notes, and provides Markdown export for one note and JSON export for all notes. Export browser drafts before clearing browsing data or changing devices.

The earlier private Project Studio remains separate; its database is not used by this site. No credentials, private database records, or API keys are required. The three published notes were copied from the project conversation.

## Development

Use Node 22.13 or later and pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The development URL includes `/Ideas/`, matching the repository’s GitHub Pages base path.

```sh
pnpm test
pnpm build
pnpm preview
```

Tests cover browser persistence, unchanged published notes, concurrent edit conflicts, validation, and storage failures. The production build type-checks the application and generates `docs/`.

## Publish an update

GitHub Pages publishes **main → /docs**. The built files are committed so publishing does not require a custom Actions workflow or extra credentials.

1. Edit `src/note-data.ts` to change published notes, or update the application in `src/`.
2. Run `pnpm test` and `pnpm build`.
3. Commit the source and generated `docs/` together, then push to `main`.

GitHub automatically republishes the committed `docs/` folder. Keep the generated `.nojekyll` file. The Hot / Cold simulation lives in `public/demos/hot-cold.html` and is copied into the build.

## Connecting Astra later

An actual assistant will need a separately hosted backend that keeps credentials off the public site. Never place an API key in source code, browser storage, or a `VITE_` environment variable. The current version makes no AI requests.
