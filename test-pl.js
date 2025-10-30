#!/usr/bin/env node
import { WhoisClient } from './src/whois-client.js';

async function test() {
  const client = new WhoisClient();
  console.log('Testing mineo.pl...\n');

  try {
    const result = await client.lookupDomain('mineo.pl');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
