<p align="center"><img src="assets/hero.svg" alt="d04-http-client animated SVG banner" width="100%"></p>

# d04-http-client

A small fetch wrapper with timeouts, retries, JSON parsing, and typed HTTP errors.

## Features
- Dependency-free ES modules for Node.js 20+
- Explicit configuration and predictable return values
- Error handling designed for production integration
- Small public API with no framework lock-in

## Install
```bash
npm install
```

## Usage
```js
import { createHttpClient } from "d04-http-client";
const api = createHttpClient({ baseUrl: "https://api.example.com", timeoutMs: 5000, retries: 2 });\nconst result = await api.get("/health");\nconsole.log(result.data);
```

## API
See `src/index.js` for the complete exported API and option types. The module is intentionally framework-neutral and can be integrated into Express, Fastify, workers, or plain Node.js services.

## Development
```bash
npm test
```

## License
MIT
