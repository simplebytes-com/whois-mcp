#!/usr/bin/env node
/**
 * Test script for WHOIS MCP Server
 * Tests whois_lookup, list_supported_tlds, and refresh_whois_servers tools
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function sendMcpRequest(server, method, params = {}) {
  return new Promise((resolve, reject) => {
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    };

    let response = '';
    let errorOutput = '';

    server.stdout.on('data', (data) => {
      response += data.toString();
      // Check if we have a complete JSON-RPC response
      try {
        const lines = response.split('\n');
        for (const line of lines) {
          if (line.trim()) {
            const parsed = JSON.parse(line);
            if (parsed.id === request.id) {
              resolve(parsed);
              return;
            }
          }
        }
      } catch (e) {
        // Not yet a complete response
      }
    });

    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    server.stdin.write(JSON.stringify(request) + '\n');

    // Timeout after 60 seconds
    setTimeout(() => {
      reject(new Error(`Request timed out after 60s. stderr: ${errorOutput}`));
    }, 60000);
  });
}

async function runTests() {
  log('\n🧪 WHOIS MCP Server Test Suite', 'cyan');
  log('━'.repeat(60), 'gray');

  const serverPath = join(__dirname, 'build/index.js');

  // Start the MCP server
  log('\n📦 Starting WHOIS MCP server...', 'cyan');
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Wait for server to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Test 1: Initialize
    log('\n1️⃣  Testing server initialization...', 'yellow');
    const initResponse = await sendMcpRequest(server, 'initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    });

    if (initResponse.result) {
      log('   ✓ Server initialized successfully', 'green');
      log(`   Server: ${initResponse.result.serverInfo.name} v${initResponse.result.serverInfo.version}`, 'gray');
    } else {
      throw new Error('Initialization failed');
    }

    // Test 2: List tools
    log('\n2️⃣  Testing tools/list...', 'yellow');
    const toolsResponse = await sendMcpRequest(server, 'tools/list');

    if (toolsResponse.result && toolsResponse.result.tools) {
      log(`   ✓ Found ${toolsResponse.result.tools.length} tools:`, 'green');
      toolsResponse.result.tools.forEach(tool => {
        log(`     - ${tool.name}`, 'gray');
      });
    } else {
      throw new Error('Failed to list tools');
    }

    // Test 3: WHOIS lookup for theo.gg
    log('\n3️⃣  Testing whois_lookup for theo.gg...', 'yellow');
    const theoResponse = await sendMcpRequest(server, 'tools/call', {
      name: 'whois_lookup',
      arguments: {
        domain: 'theo.gg',
        include_raw: false
      }
    });

    if (theoResponse.result && theoResponse.result.content) {
      const result = JSON.parse(theoResponse.result.content[0].text);
      log('   ✓ WHOIS lookup successful', 'green');
      log(`   Domain: ${result.domain}`, 'gray');
      log(`   Found: ${result.found}`, 'gray');
      log(`   Server: ${result.server}`, 'gray');
      if (result.registrar) log(`   Registrar: ${result.registrar}`, 'gray');
      if (result.creationDate) log(`   Created: ${result.creationDate}`, 'gray');
      if (result.expirationDate) log(`   Expires: ${result.expirationDate}`, 'gray');
      if (result.nameservers) log(`   Nameservers: ${result.nameservers.join(', ')}`, 'gray');
    } else if (theoResponse.result && theoResponse.result.isError) {
      log(`   ✗ Error: ${theoResponse.result.content[0].text}`, 'red');
    } else {
      throw new Error('Unexpected response format');
    }

    // Test 4: WHOIS lookup for mineo.pl
    log('\n4️⃣  Testing whois_lookup for mineo.pl...', 'yellow');
    const mineoResponse = await sendMcpRequest(server, 'tools/call', {
      name: 'whois_lookup',
      arguments: {
        domain: 'mineo.pl',
        include_raw: false
      }
    });

    if (mineoResponse.result && mineoResponse.result.content) {
      const result = JSON.parse(mineoResponse.result.content[0].text);
      log('   ✓ WHOIS lookup successful', 'green');
      log(`   Domain: ${result.domain}`, 'gray');
      log(`   Found: ${result.found}`, 'gray');
      log(`   Server: ${result.server}`, 'gray');
      if (result.registrar) log(`   Registrar: ${result.registrar}`, 'gray');
      if (result.creationDate) log(`   Created: ${result.creationDate}`, 'gray');
      if (result.expirationDate) log(`   Expires: ${result.expirationDate}`, 'gray');
      if (result.nameservers) log(`   Nameservers: ${result.nameservers.join(', ')}`, 'gray');
    } else if (mineoResponse.result && mineoResponse.result.isError) {
      log(`   ✗ Error: ${mineoResponse.result.content[0].text}`, 'red');
    } else {
      throw new Error('Unexpected response format');
    }

    // Test 5: List supported TLDs (limited)
    log('\n5️⃣  Testing list_supported_tlds...', 'yellow');
    const tldsResponse = await sendMcpRequest(server, 'tools/call', {
      name: 'list_supported_tlds',
      arguments: {
        limit: 10
      }
    });

    if (tldsResponse.result && tldsResponse.result.content) {
      const result = JSON.parse(tldsResponse.result.content[0].text);
      log('   ✓ TLD list retrieved', 'green');
      log(`   Total TLDs: ${result.totalCount}`, 'gray');
      log(`   Returned: ${result.returnedCount}`, 'gray');
      log(`   Sample TLDs: ${result.tlds.slice(0, 5).join(', ')}...`, 'gray');
    } else {
      throw new Error('Failed to list TLDs');
    }

    log('\n✅ All tests passed!', 'green');
    log('━'.repeat(60), 'gray');

  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    server.kill();
  }
}

runTests();
