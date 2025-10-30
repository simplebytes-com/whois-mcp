# WHOIS MCP Server

A Model Context Protocol (MCP) server that provides comprehensive WHOIS domain lookup using the proper WHOIS protocol (TCP port 43). Queries authoritative WHOIS servers directly with support for 877+ TLDs and parsing for 169 country-code TLDs.

## Features

- **Native WHOIS Protocol**: Direct TCP port 43 connections to authoritative WHOIS servers
- **877+ TLDs Supported**: Comprehensive dictionary of WHOIS servers for all major TLDs
- **169 ccTLD Parsers**: Format-specific parsing for country-code TLDs (.gg, .pl, .jp, .kr, .ru, .de, .it, etc.)
- **Auto-Update**: Refresh WHOIS server dictionary from IANA with built-in tool
- **Comprehensive Parsing**: Extracts registrar, dates, nameservers, status, DNSSEC, contacts
- **Lightweight**: Single-file executable, minimal dependencies
- **Easy Integration**: Works with Claude Desktop and any MCP-compatible client

## Installation

```bash
npm install whois-mcp
```

Or use directly with npx:

```bash
npx whois-mcp
```

## Usage

### Option 1: Local Installation (Recommended for Claude Desktop)

Add to your Claude Desktop configuration file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "whois": {
      "command": "npx",
      "args": ["-y", "whois-mcp"]
    }
  }
}
```

Restart Claude Desktop, and you'll see the WHOIS tools in the 🔌 menu.

### Option 2: Hosted Version

This server is also available as a hosted service at **mcp.domaindetails.com** for HTTP-based integrations.

## Available Tools

### `whois_lookup`

Look up domain registration information using the proper WHOIS protocol (port 43).

**Parameters:**
- `domain` (string, required): Domain name to look up (e.g., google.com, theo.gg, mineo.pl)
- `include_raw` (boolean, optional): Include raw WHOIS response data (default: false)

**Example Request:**
```json
{
  "domain": "theo.gg",
  "include_raw": false
}
```

**Example Response:**
```json
{
  "domain": "theo.gg",
  "found": true,
  "method": "whois",
  "server": "whois.gg",
  "timestamp": "2025-10-30T11:11:32.936Z",
  "registrar": "NameCheap, Inc (https://www.namecheap.com)",
  "registrant": "Redacted for privacy",
  "creationDate": "2021-01-14T00:00:00Z",
  "expirationDate": "2026-01-14T00:00:00Z",
  "nameservers": [
    "dns1.registrar-servers.com",
    "dns2.registrar-servers.com"
  ],
  "status": [
    "Active",
    "Transfer Prohibited by Registrar"
  ],
  "parsed": {
    "domainName": "theo.gg",
    "registrar": "NameCheap, Inc (https://www.namecheap.com)",
    "creationDate": "2021-01-14T00:00:00Z",
    "expirationDate": "2026-01-14T00:00:00Z",
    "nameservers": ["dns1.registrar-servers.com", "dns2.registrar-servers.com"],
    "registrant": "Redacted for privacy",
    "status": ["Active", "Transfer Prohibited by Registrar"],
    "dnssec": null,
    "lastModified": null
  }
}
```

### `list_supported_tlds`

List all TLDs that have WHOIS servers available for querying.

**Parameters:**
- `limit` (number, optional): Maximum number of TLDs to return (default: all)

**Example Response:**
```json
{
  "totalCount": 877,
  "returnedCount": 10,
  "tlds": [
    "aaa",
    "aarp",
    "abarth",
    "abb",
    "abbott",
    "abbvie",
    "abc",
    "able",
    "abogado",
    "abudhabi"
  ],
  "timestamp": "2025-10-30T11:11:32.936Z"
}
```

### `refresh_whois_servers`

Refresh the WHOIS server dictionary by fetching the latest TLD list from IANA. Run this periodically to ensure the server list is up-to-date with new TLDs.

**Example Response:**
```json
{
  "success": true,
  "message": "WHOIS server dictionary refreshed successfully",
  "previousCount": 877,
  "currentCount": 880,
  "added": 3,
  "timestamp": "2025-10-30T11:11:32.936Z",
  "output": "Sync complete! Updated whois_dict.json"
}
```

## WHOIS Data

The server queries authoritative WHOIS servers via TCP port 43 and parses responses to extract:

- **Domain Name**: Canonical domain name
- **Registrar**: Domain registrar/registry information
- **Registration Dates**: Creation, expiration, and last modified dates
- **Registrant**: Domain owner information (when available, may be redacted for privacy)
- **Admin Contact**: Administrative contact (when available)
- **Tech Contact**: Technical contact (when available)
- **Nameservers**: DNS nameservers for the domain
- **Status**: Domain status codes (active, transfer prohibited, etc.)
- **DNSSEC**: DNSSEC signing status

### Supported TLDs

The server includes a comprehensive dictionary (`whois_dict.json`) with WHOIS servers for:

- **Generic TLDs**: .com, .net, .org, .info, .biz, etc.
- **Country-code TLDs**: 169 ccTLDs with format-specific parsers (.gg, .pl, .jp, .kr, .ru, .de, .it, .fr, .uk, .au, .nz, .ca, etc.)
- **New gTLDs**: .app, .dev, .ai, .io, .me, .ly, and hundreds more

### Parser Features

The included WHOIS parser supports diverse response formats:

- **Standard formats**: Colon-separated key-value pairs
- **.gg/.je style**: Natural language dates ("30th April 2003")
- **.jp style**: Square bracket format `[Domain Name] GOOGLE.JP`
- **.kr style**: Dotted dates `2007. 03. 02.`
- **.ru style**: Cyrillic fields with IP addresses
- **Multi-line sections**: Status blocks, nameserver lists, contact blocks

## Technical Details

### Architecture

- **Protocol**: Native WHOIS (TCP port 43) via Node.js `net` module
- **Parser**: Based on [whois-parser](https://github.com/simplebytes-com/whois-parser) with 169 ccTLD parsers
- **Dictionary**: whois_dict.json with 877+ WHOIS server mappings
- **Update Script**: fetch-iana-servers.js syncs latest TLDs from IANA
- **Build**: Single-file executable via esbuild

### Attribution

This MCP server uses the comprehensive WHOIS parser from:
- **Repository**: https://github.com/simplebytes-com/whois-parser
- **Author**: Simple Bytes LLC
- **License**: MIT

The parser includes support for 169 country-code TLDs with format-specific parsing logic.

## Development

```bash
# Clone repository
git clone https://github.com/simplebytes-com/whois-mcp.git
cd whois-mcp

# Install dependencies
npm install

# Build
npm run build

# Test locally
node build/index.js

# Test with specific domains
node test-simple.js
```

### Build Process

The build script:
1. Bundles source files with esbuild
2. Adds shebang for CLI execution
3. Copies whois_dict.json and fetch-iana-servers.js to build directory
4. Makes the executable file

### Updating the WHOIS Dictionary

The WHOIS server dictionary can be updated from IANA:

```bash
cd src
node fetch-iana-servers.js
```

This fetches the latest TLD list from https://data.iana.org/TLD/tlds-alpha-by-domain.txt and updates whois_dict.json with current WHOIS servers.

## Examples

### Example 1: .com Domain (google.com)

```json
{
  "domain": "google.com",
  "found": true,
  "server": "whois.verisign-grs.com",
  "registrar": "MarkMonitor Inc.",
  "creationDate": "1997-09-15T04:00:00Z",
  "expirationDate": "2028-09-14T04:00:00Z",
  "nameservers": ["NS1.GOOGLE.COM", "NS2.GOOGLE.COM", "NS3.GOOGLE.COM", "NS4.GOOGLE.COM"],
  "status": ["clientDeleteProhibited", "clientTransferProhibited", "clientUpdateProhibited"],
  "dnssec": "unsigned"
}
```

### Example 2: .gg ccTLD (theo.gg)

```json
{
  "domain": "theo.gg",
  "found": true,
  "server": "whois.gg",
  "registrar": "NameCheap, Inc",
  "registrant": "Redacted for privacy",
  "creationDate": "2021-01-14T00:00:00Z",
  "expirationDate": "2026-01-14T00:00:00Z",
  "nameservers": ["dns1.registrar-servers.com", "dns2.registrar-servers.com"],
  "status": ["Active", "Transfer Prohibited by Registrar"]
}
```

### Example 3: .pl ccTLD (mineo.pl)

```json
{
  "domain": "mineo.pl",
  "found": true,
  "server": "whois.dns.pl",
  "registrar": "Dynadot LLC",
  "creationDate": "2021.02.18 23:49:54",
  "expirationDate": "2027.02.18 23:49:54",
  "nameservers": ["josephine.ns.cloudflare.com", "kenneth.ns.cloudflare.com"],
  "dnssec": "Unsigned",
  "lastModified": "2024.09.03 13:16:45"
}
```

## Troubleshooting

### No WHOIS Server Found

If you get "No WHOIS server found for TLD", try refreshing the dictionary:

```
Use the refresh_whois_servers tool to update from IANA
```

### Connection Timeout

Some WHOIS servers have rate limiting. Wait a few seconds and retry. The default timeout is 30 seconds.

### Parsing Issues

The parser supports 169 ccTLDs, but some registries use unique formats. The raw WHOIS data is always available with `include_raw: true`.

## License

MIT

## Related Projects

- [domaindetails-mcp](https://github.com/simplebytes-com/domaindetails-mcp) - Full-featured domain research toolkit with RDAP, WHOIS, and DNS lookup
- [rdap-mcp](https://github.com/simplebytes-com/rdap-mcp) - Simple RDAP-only MCP server
- [whois-parser](https://github.com/simplebytes-com/whois-parser) - Comprehensive WHOIS parser for 169 ccTLDs
- [DomainDetails.com](https://domaindetails.com) - Full-featured domain research SaaS

## Support

- **Issues**: https://github.com/simplebytes-com/whois-mcp/issues
- **Website**: https://domaindetails.com
- **Email**: support@domaindetails.com
