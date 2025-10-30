import { WhoisClient } from './whois-client.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * WHOIS Lookup Tool
 */
export class WhoisLookupTool {
  constructor(whoisClient) {
    this.whoisClient = whoisClient;
  }

  getToolDefinition() {
    return {
      name: 'whois_lookup',
      description: 'Look up domain information using WHOIS protocol (port 43). Queries authoritative WHOIS servers for domain registration details including registrar, registrant, dates, nameservers, and status. Supports 1,260+ TLDs.',
      inputSchema: {
        type: 'object',
        properties: {
          domain: {
            type: 'string',
            description: 'The domain name to look up (e.g., example.com, theo.gg, mineo.pl)'
          },
          include_raw: {
            type: 'boolean',
            description: 'If true, include raw WHOIS response data in the result',
            default: false
          }
        },
        required: ['domain'],
        additionalProperties: false
      }
    };
  }

  async execute(params) {
    const { domain, include_raw = false } = params;

    if (!domain) {
      throw new Error('Domain parameter is required');
    }

    const result = await this.whoisClient.lookupDomain(domain);

    return this.formatResult(result, include_raw);
  }

  formatResult(result, includeRaw) {
    const formatted = {
      domain: result.domain,
      found: result.found,
      method: result.method || 'whois',
      server: result.server,
      timestamp: result.timestamp
    };

    if (!result.found) {
      formatted.error = result.error || 'Domain not found or WHOIS query failed';
      return formatted;
    }

    // Add parsed data
    if (result.parsed) {
      formatted.parsed = result.parsed;

      // Extract commonly used fields for easy access
      if (result.parsed.registrar) formatted.registrar = result.parsed.registrar;
      if (result.parsed.registrant) formatted.registrant = result.parsed.registrant;
      if (result.parsed.admin) formatted.admin = result.parsed.admin;
      if (result.parsed.tech) formatted.tech = result.parsed.tech;
      if (result.parsed.creationDate) formatted.creationDate = result.parsed.creationDate;
      if (result.parsed.expirationDate) formatted.expirationDate = result.parsed.expirationDate;
      if (result.parsed.updatedDate) formatted.updatedDate = result.parsed.updatedDate;
      if (result.parsed.status) formatted.status = result.parsed.status;
      if (result.parsed.nameservers) formatted.nameservers = result.parsed.nameservers;
      if (result.parsed.dnssec) formatted.dnssec = result.parsed.dnssec;
    }

    // Include raw data if requested
    if (includeRaw && result.rawData) {
      formatted.rawData = result.rawData;
    }

    return formatted;
  }
}

/**
 * Refresh WHOIS Servers Tool
 */
export class RefreshServersTool {
  constructor(whoisClient) {
    this.whoisClient = whoisClient;
  }

  getToolDefinition() {
    return {
      name: 'refresh_whois_servers',
      description: 'Refresh the WHOIS server dictionary by fetching the latest TLD list from IANA. This updates the list of available WHOIS servers for domain lookups. Run this periodically to ensure the server list is up-to-date.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false
      }
    };
  }

  async execute(params) {
    try {
      const scriptPath = join(__dirname, 'fetch-iana-servers.js');
      const oldCount = this.whoisClient.getServerCount();

      console.error(`Running IANA server fetch script...`);
      console.error(`Script path: ${scriptPath}`);

      // Run the fetch script
      const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, {
        cwd: __dirname,
        timeout: 60000 // 60 second timeout
      });

      if (stderr) {
        console.error(`Script stderr: ${stderr}`);
      }

      console.error(`Script output: ${stdout}`);

      // Reload the WHOIS servers
      this.whoisClient.loadWhoisServers();
      const newCount = this.whoisClient.getServerCount();

      return {
        success: true,
        message: 'WHOIS server dictionary refreshed successfully',
        previousCount: oldCount,
        currentCount: newCount,
        added: Math.max(0, newCount - oldCount),
        timestamp: new Date().toISOString(),
        output: stdout.trim()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

/**
 * List Supported TLDs Tool
 */
export class ListTLDsTool {
  constructor(whoisClient) {
    this.whoisClient = whoisClient;
  }

  getToolDefinition() {
    return {
      name: 'list_supported_tlds',
      description: 'List all supported TLDs (Top-Level Domains) that have WHOIS servers available. Returns the complete list of TLDs that can be queried.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of TLDs to return (default: all)',
            default: null
          }
        },
        additionalProperties: false
      }
    };
  }

  async execute(params) {
    const { limit } = params;

    const allTLDs = this.whoisClient.getAvailableTLDs();
    const tlds = limit ? allTLDs.slice(0, limit) : allTLDs;

    return {
      totalCount: allTLDs.length,
      returnedCount: tlds.length,
      tlds: tlds,
      timestamp: new Date().toISOString()
    };
  }
}
