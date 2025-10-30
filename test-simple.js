#!/usr/bin/env node
/**
 * Simple direct test of WHOIS client
 */

import { WhoisClient } from './src/whois-client.js';

async function test() {
  console.log('Testing WHOIS client directly...\n');

  const client = new WhoisClient();
  console.log(`Loaded ${client.getServerCount()} WHOIS servers\n`);

  // Test 1: google.com (should be very reliable)
  console.log('Testing google.com...');
  try {
    const result = await client.lookupDomain('google.com');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n---\n');

  // Test 2: theo.gg
  console.log('Testing theo.gg...');
  try {
    const result = await client.lookupDomain('theo.gg');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
