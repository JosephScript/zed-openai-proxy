# Azure OpenAI Proxy for Zed

A Proxy for [Zed](https://zed.dev) to use Azure OpenAI API, using NodeJS (with zero runtime `node_module` dependencies).

Streamline communication between Zed and Azure OpenAI with this lightweight proxy server, designed for Node.js users. Easily set up and run with environment variables for hassle-free integration.

## Features

- Converts requests from Zed into Azure OpenAI's expected format.
- Streams events seamlessly for real-time interactions.
- Easily configurable via CLI environment variables.

## Usage

You can use this proxy server directly with `npx`:

```bash
npx zed-openai-proxy
```

### Environment Variables

The script will automatically include the following keys:

Command Line Examples
Setting Environment Variables in Linux/Mac:

```sh
# Temporary (current session only)
export AZURE_API_ENDPOINT=https://<subdomain>.openai.azure.com/openai/deployments/<deployment>
export AZURE_API_VERSION=2025-01-01-preview
export AZURE_API_KEY=your-api-key
export PROXY_PORT=8000
```

Or instead you can also pass environment variables inline during execution:

```bash
AZURE_API_ENDPOINT=https://<subdomain>.openai.azure.com/openai/deployments/<deployment> \
AZURE_API_VERSION=2025-01-01-preview \
AZURE_API_KEY=your-api-key \
PROXY_PORT=8000 npx zed-openai-proxy
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
          "api_version": "2025-01-01-preview", // change to your desired API version
          "display_name": "gpt-4o", // change to your desired display name
          "name": "gpt-4o" // this is your model name in Azure
        }
      ]
    }
  }
```

And, finally in the Assistant panel's configuration, add random text in the API key for OpenAI. Such as `sk_azure`, which will allow it to work.

### Project Structure
```
azure-openai-zed-proxy/
├── .husky/             # Commit hooks
├── dist/
│   └── proxy.js        # Bundled version created by `esbuild`
├── proxy.js             # Original source file
├── esbuild.js           # Esbuild configuration
├── package.json         # NPM package configuration
└── node_modules/
```

## Contribution

Feel free to open issues or submit pull requests to improve the functionality.

### Development

0) Use `nvm` to set your node version to LTS.
1) Clone the repo
2) Either set the environment variables as above, or create a `.env` file in the project root.
3) `npm install`
4) Run the project using `node proxy.js` or `node --env-file=.env proxy.js` if using a `.env` file.

## License

MIT
