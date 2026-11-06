#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const server = new Server(
  {
    name: "gitguardian-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "gitguardian_secret_scan_repo",
        description: "Scan git repository for leaked API keys, tokens, credentials, and secrets using GitGuardian ggshield.",
        inputSchema: {
          type: "object",
          properties: {
            allSecrets: {
              type: "boolean",
              description: "Whether to scan for all secrets, ignoring none.",
            },
          },
        },
      },
      {
        name: "gitguardian_secret_scan_path",
        description: "Scan specific file or directory path for leaked API keys, tokens, and secrets using GitGuardian ggshield.",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to file or folder to scan.",
            },
          },
          required: ["path"],
        },
      },
      {
        name: "gitguardian_status",
        description: "Check GitGuardian CLI (ggshield) version and authentication status.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "gitguardian_status") {
    try {
      const { stdout: versionOut } = await execAsync("ggshield --version");
      let authStatus = "";
      try {
        const { stdout: statusOut } = await execAsync("ggshield api-status");
        authStatus = statusOut;
      } catch (err) {
        authStatus = err.stdout || err.stderr || err.message;
      }
      return {
        content: [
          {
            type: "text",
            text: `GitGuardian Version:\n${versionOut.trim()}\n\nAPI Status:\n${authStatus.trim()}`,
          },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error checking status: ${err.message}` }],
      };
    }
  }

  if (name === "gitguardian_secret_scan_repo") {
    const allFlag = args?.allSecrets ? "--all-secrets" : "";
    try {
      const { stdout, stderr } = await execAsync(`ggshield secret scan repo . --exit-zero ${allFlag}`);
      return {
        content: [{ type: "text", text: stdout || stderr || "No secrets detected." }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: err.stdout || err.stderr || err.message }],
      };
    }
  }

  if (name === "gitguardian_secret_scan_path") {
    const targetPath = args?.path || ".";
    try {
      const { stdout, stderr } = await execAsync(`ggshield secret scan path -r --use-gitignore -y "${targetPath}" --exit-zero`);
      return {
        content: [{ type: "text", text: stdout || stderr || "No secrets detected in path." }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: err.stdout || err.stderr || err.message }],
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("GitGuardian MCP Server error:", err);
  process.exit(1);
});
