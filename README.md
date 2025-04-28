# Azure OpenAI Proxy for Zed

A Proxy for Zed to use Azure OpenAI API, but using NodeJS (with zero `node_module` dependencies)

Streamline communication between Zed and Azure OpenAI with this lightweight proxy server, designed for Node.js users. Easily set up and run with environment variables for hassle-free integration.

## Features

- Converts requests from Zed into Azure OpenAI's expected format.
- Streams events seamlessly for real-time interactions.
- Easily configurable via `.env` files or inline CLI environment variables.

## Usage

You can use this proxy server directly with `npx`:

```bash
npx azure-openai-zed-proxy --env-file=.env
```

### Environment Variables

Create a `.env` file in the same directory where you run the script, and include the following keys:

```plaintext
AZURE_API_ENDPOINT=https://<subdomain>.openai.azure.com/openai/deployments/<deployment>
AZURE_API_VERSION=2025-01-01-preview
AZURE_API_KEY=your-api-key
PROXY_PORT=8000
```

You can also pass environment variables inline:

```bash
AZURE_API_ENDPOINT=https://<subdomain>.openai.azure.com/openai/deployments/<deployment> \
AZURE_API_VERSION=2025-01-01-preview \
AZURE_API_KEY=your-api-key \
PROXY_PORT=8000 node proxy.js
```

## Zed Settings

Finally, add the following model configuration to Zed's `settings.json` file:

```
  "language_models": {
    "openai": {
      "version": "1",
      "api_url": "http://localhost:8000", // adjust to your port
      "available_models": [
        {
          "api_version": "2025-01-01-preview",
          "display_name": "gpt-4o", // change to your desired display name
          "name": "gpt-4o" // this is your model name
        }
      ]
    }
  }
```

And, finally in the Assistant panel's configuration, add random text in the API key for OpenAI. Such as `sk_azure`, which will allow it to work.

### Project Structure
```
azure-openai-zed-proxy/
├── dist/
│   └── proxy.js         # Bundled version created by `esbuild`
├── proxy.js             # Original source file
├── esbuild.js             # Esbuild configuration
├── package.json         # NPM package configuration
└── node_modules/
```

## Contribution

Feel free to open issues or submit pull requests to improve the functionality.

## License

MIT
