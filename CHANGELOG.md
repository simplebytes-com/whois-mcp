# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-30

### Added
- Initial release of whois-mcp
- IANA WHOIS service integration
- Comprehensive domain information lookup including:
  - Domain name and registration dates
  - Organization/registrant information
  - Administrative and technical contacts
  - Nameserver information
  - Domain status codes
  - Referral servers
- Model Context Protocol (MCP) integration via stdio transport
- `whois_lookup` tool with optional raw data output
- Lightweight package with minimal dependencies
- WHOIS response parsing for easy access to common fields
- GitHub Actions workflow for automated publishing
- Comprehensive documentation and usage examples

[1.0.0]: https://github.com/simplebytes-com/whois-mcp/releases/tag/v1.0.0
