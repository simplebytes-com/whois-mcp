import { whoisQuery, parseWhoisData } from './whois-parser.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * WHOIS client that queries domain WHOIS servers and parses responses
 */
export class WhoisClient {
  constructor() {
    this.timeout = 30000; // 30 seconds
    this.loadWhoisServers();
  }

  /**
   * Load WHOIS server dictionary
   */
  loadWhoisServers() {
    try {
      const dictPath = join(__dirname, 'whois_dict.json');
      const dictData = readFileSync(dictPath, 'utf-8');
      this.whoisServers = JSON.parse(dictData);
      console.error(`Loaded ${Object.keys(this.whoisServers).length} WHOIS servers`);
    } catch (error) {
      console.error(`Failed to load WHOIS dictionary: ${error.message}`);
      this.whoisServers = {};
    }
  }

  /**
   * Get WHOIS server for a TLD
   * @param {string} tld - Top-level domain
   * @returns {string|null} WHOIS server or null
   */
  getWhoisServer(tld) {
    return this.whoisServers[tld.toLowerCase()] || null;
  }

  /**
   * Extract TLD from domain
   * @param {string} domain - Domain name
   * @returns {string} TLD
   */
  extractTLD(domain) {
    const parts = domain.split('.');
    return parts[parts.length - 1];
  }

  /**
   * Look up domain using WHOIS protocol
   * @param {string} domain - Domain name to look up
   * @returns {Promise<Object>} WHOIS lookup result
   */
  async lookupDomain(domain) {
    if (!domain) {
      throw new Error('Domain parameter is required');
    }

    // Clean domain name
    domain = domain.toLowerCase().trim();

    // Extract TLD
    const tld = this.extractTLD(domain);
    const whoisServer = this.getWhoisServer(tld);

    if (!whoisServer) {
      return {
        domain,
        found: false,
        error: `No WHOIS server found for TLD: ${tld}`,
        timestamp: new Date().toISOString()
      };
    }

    try {
      // Query WHOIS server
      console.error(`Querying ${whoisServer} for ${domain}...`);
      const rawWhois = await whoisQuery(domain, whoisServer, this.timeout);

      // Parse WHOIS response
      const parsed = parseWhoisData(rawWhois, domain);

      return {
        domain,
        found: true,
        method: 'whois',
        server: whoisServer,
        timestamp: new Date().toISOString(),
        rawData: rawWhois,
        parsed: parsed || {}
      };

    } catch (error) {
      return {
        domain,
        found: false,
        error: error.message,
        server: whoisServer,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get available TLDs
   * @returns {string[]} List of TLDs
   */
  getAvailableTLDs() {
    return Object.keys(this.whoisServers).sort();
  }

  /**
   * Get server count
   * @returns {number} Number of WHOIS servers
   */
  getServerCount() {
    return Object.keys(this.whoisServers).length;
  }
}
