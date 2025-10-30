# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-30

### Added
- Initial release of whois-mcp
- Native WHOIS protocol implementation (TCP port 43)
- 877+ TLD support with comprehensive WHOIS server dictionary
- 169 ccTLD parsers with format-specific parsing logic
- Three MCP tools:
  - `whois_lookup`: Query domain registration data using proper WHOIS protocol
  - `list_supported_tlds`: List all supported TLDs
  - `refresh_whois_servers`: Update WHOIS server dictionary from IANA
- Comprehensive WHOIS parsing for:
  - Domain name and registration dates (creation, expiration, last modified)
  - Registrar and registry information
  - Registrant, admin, and technical contact information
  - Nameserver information
  - Domain status codes
  - DNSSEC signing status
- Format-specific parsers for diverse ccTLD formats:
  - .gg/.je style with natural language dates
  - .jp style with square bracket format
  - .kr style with dotted dates
  - .ru style with Cyrillic fields
  - .de, .it, .fr, .uk, .au, .nz, .ca and many more
- WHOIS parser integration from simplebytes-com/whois-parser
- Auto-updating WHOIS dictionary via fetch-iana-servers.js
- Model Context Protocol (MCP) integration via stdio transport
- Single-file executable built with esbuild
- GitHub Actions workflow for automated publishing
- Comprehensive documentation with examples
- Claude Desktop integration support

### Technical Details
- Protocol: Native WHOIS (TCP port 43) via Node.js net module
- Parser: Based on whois-parser with 169 ccTLD parsers
- Dictionary: whois_dict.json with 877+ WHOIS server mappings
- Update Script: fetch-iana-servers.js syncs latest TLDs from IANA
- Build: Single-file executable via esbuild
- Transport: MCP stdio for local execution

[1.0.0]: https://github.com/simplebytes-com/whois-mcp/releases/tag/v1.0.0
