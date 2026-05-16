## TODO - Airtribe bot / Railway deploy fix

- [ ] Inspect current build/compile output behavior for Railway container (`dist/index.js` missing)
- [ ] Fix Dockerfile/railway start command so compiled output path matches what container runs
- [ ] Ensure TypeScript build produces `dist/index.js` during `npm run build`
- [ ] Verify ESM/NodeNext compatibility (file extensions, start command)
- [ ] Run local `npm run build` and confirm `/dist/index.js` exists
- [ ] Run `docker build` (optional) and smoke-run container entrypoint locally
- [ ] Document required Railway settings (build command + start command + env vars)

