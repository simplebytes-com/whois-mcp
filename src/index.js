import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { WhoisClient } from "./whois-client.js";
import { WhoisLookupTool, RefreshServersTool, ListTLDsTool } from "./whois-tools.js";

/**
 * WHOIS MCP Server
 * Domain WHOIS lookup server using proper WHOIS protocol (port 43)
 * Supports 1,260+ TLDs with parsing for 169 ccTLDs
 */
class WhoisMcpServer {
  constructor() {
    this.server = new Server(
      {
        name: "whois-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize WHOIS client
    this.whoisClient = new WhoisClient();

    // Initialize tools
    this.whoisLookupTool = new WhoisLookupTool(this.whoisClient);
    this.refreshServersTool = new RefreshServersTool(this.whoisClient);
    this.listTLDsTool = new ListTLDsTool(this.whoisClient);

    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          this.whoisLookupTool.getToolDefinition(),
          this.refreshServersTool.getToolDefinition(),
          this.listTLDsTool.getToolDefinition(),
        ],
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result;

        switch (name) {
          case "whois_lookup":
            result = await this.whoisLookupTool.execute(args);
            break;

          case "refresh_whois_servers":
            result = await this.refreshServersTool.execute(args);
            break;

          case "list_supported_tlds":
            result = await this.listTLDsTool.execute(args);
            break;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Log to stderr so it doesn't interfere with stdio communication
    console.error("WHOIS MCP Server running on stdio");
    console.error(`Loaded ${this.whoisClient.getServerCount()} WHOIS servers`);
  }
}

// Start the server
const server = new WhoisMcpServer();
server.run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
