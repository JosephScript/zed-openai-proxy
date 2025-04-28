#!/usr/bin/env node
import { createServer } from "http";

// Validate required environment variables
function validateEnv() {
  const requiredEnvVars = [
    "AZURE_API_ENDPOINT",
    "AZURE_API_VERSION",
    "AZURE_API_KEY",
  ];
  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }
}

// Validate environment variables
validateEnv();

const AZURE_API_ENDPOINT = process.env.AZURE_API_ENDPOINT;
const AZURE_API_VERSION = process.env.AZURE_API_VERSION;
const AZURE_API_KEY = process.env.AZURE_API_KEY;
const PROXY_PORT = parseInt(process.env.PROXY_PORT || "8000", 10);

const server = createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/chat/completions") {
    let body = "";

    // Collect incoming request data
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        // Parse the incoming JSON payload
        const zedPayload = JSON.parse(body);

        // Transform the request for Azure OpenAI
        const azurePayload = transformRequest(zedPayload);

        // Forward the request to Azure OpenAI
        const azureUrl = `${AZURE_API_ENDPOINT}/chat/completions?api-version=${AZURE_API_VERSION}`;

        const azureResponse = await fetch(azureUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": AZURE_API_KEY,
            Accept: "text/event-stream",
            "User-Agent": "Zed/0.178.5",
          },
          body: JSON.stringify(azurePayload),
        });

        if (!azureResponse.ok) {
          res.writeHead(502, { "Content-Type": "text/plain" });
          res.end(
            `Error communicating with Azure OpenAI: ${azureResponse.statusText}`,
          );
          return;
        }

        // Stream the response back to Zed
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        });
        const reader = azureResponse.body.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value).trim();

          const lines = chunk.split("\n"); // Split chunk into individual lines
          for (const line of lines) {
            if (line.trim() === "") {
              continue; // Skip empty lines
            }

            if (line === "data: [DONE]") {
              res.write("data: [DONE]\n"); // Forward the DONE signal
              continue;
            }

            if (!line.startsWith("data: ")) {
              continue; // Skip unexpected lines
            }

            const jsonStr = line.slice("data: ".length).trim();

            // Sanitize the JSON string to remove trailing non-JSON characters
            const sanitizedJsonStr = jsonStr.replace(/[^}\]]+$/, "");

            try {
              const dataPayload = JSON.parse(sanitizedJsonStr ?? "{}");

              // Skip chunks with empty choices
              if (dataPayload.choices && dataPayload.choices.length === 0)
                continue;

              // Forward valid JSON chunks
              res.write(`data: ${JSON.stringify(dataPayload)}\n`);
            } catch (err) {
              console.error(
                "Error parsing JSON line:",
                err,
                "chunk",
                chunk,
                "Sanitized Chunk:",
                sanitizedJsonStr,
              );
              continue; // Skip malformed lines
            }
          }
        }

        // Ensure EOF is properly handled
        res.write("data: [DONE]\n");
        res.end();
      } catch (err) {
        console.error("Error in proxy:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error in Proxy");
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

// Transform the request for Azure OpenAI
function transformRequest(zedPayload) {
  const systemMessage = {
    role: "system",
    content: "You must always respond in markdown format.",
  };

  if (zedPayload.prompt) {
    const messages = [
      systemMessage,
      { role: "user", content: zedPayload.prompt },
    ];
    return {
      messages,
      temperature: zedPayload.temperature ?? 0.7,
      max_tokens: Math.min(zedPayload.max_tokens ?? 4096, 4096), // Ensure valid max_tokens
      stream: true,
    };
  }

  const azurePayload = { ...zedPayload, stream: true };
  if (!azurePayload.messages) {
    azurePayload.messages = [systemMessage];
  } else {
    azurePayload.messages = [systemMessage, ...azurePayload.messages];
  }
  return azurePayload;
}

// Start the server
server.listen(PROXY_PORT, () => {
  console.log(`Azure OpenAI proxy server running on port ${PROXY_PORT}`);
});
