# WHOIS MCP Server

A simple Model Context Protocol (MCP) server that provides WHOIS domain lookup capabilities using IANA's WHOIS service.

## Features

- **IANA WHOIS**: Uses IANA's official WHOIS service at https://www.iana.org/whois
- **Simple & Reliable**: Direct queries to authoritative WHOIS source
- **Comprehensive Data**: Returns full WHOIS records with parsed fields
- **Lightweight**: Minimal dependencies
- **Easy Integration**: Works with any MCP-compatible client

## Installation

```bash
npm install whois-mcp
```

Or use directly with npx:

```bash
npx whois-mcp
```

## Usage

### Option 1: Local Installation (Recommended)

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

### Option 2: Hosted Version

This server is also available as a hosted service at **mcp.domaindetails.com** for HTTP-based integrations:

```
GET https://mcp.domaindetails.com/lookup/{domain}?prefer_whois=true
POST https://mcp.domaindetails.com/mcp/call-tool
```

The hosted version runs on Cloudflare Workers for global low-latency access. Use the local version for Claude Desktop and the hosted version for custom HTTP integrations.

## Available Tools

### `whois_lookup`

Look up domain information using IANA's WHOIS service.

**Parameters:**
- `domain` (string, required): The domain name to look up (e.g., example.com)
- `include_raw` (boolean, optional): If true, include raw WHOIS response data

**Example Response:**
```json
{
  "domain": "example.com",
  "found": true,
  "method": "whois",
  "timestamp": "2025-01-30T10:30:00Z",
  "domainName": "EXAMPLE.COM",
  "organization": "Internet Assigned Numbers Authority",
  "createdDate": "1995-08-14",
  "updatedDate": "2023-08-14",
  "status": ["clientDeleteProhibited", "clientTransferProhibited"],
  "nameservers": ["A.IANA-SERVERS.NET", "B.IANA-SERVERS.NET"],
  "referralServer": "whois://whois.iana.org",
  "whois": {
    "domain": "EXAMPLE.COM",
    "organisation": "Internet Assigned Numbers Authority",
    "created": "1995-08-14",
    "changed": "2023-08-14",
    "nserver": ["A.IANA-SERVERS.NET", "B.IANA-SERVERS.NET"]
  }
}
```

## WHOIS Data

The IANA WHOIS service provides authoritative information including:
- Domain name and registration dates
- Organization/registrant information
- Administrative and technical contacts
- Nameserver information
- Domain status codes
- Referral servers for detailed lookups

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
```

## License

MIT

## Related Projects

- [domaindetails-mcp](https://github.com/simplebytes-com/domaindetails-mcp) - Full-featured domain research toolkit with RDAP, WHOIS, and more
- [rdap-mcp](https://github.com/simplebytes-com/rdap-mcp) - Simple RDAP-only MCP server
- [DomainDetails.com](https://domaindetails.com) - Full-featured domain research SaaS
