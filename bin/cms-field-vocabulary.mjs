#!/usr/bin/env node

import {
  checkProjection,
  resolveProjectionFields,
  syncProjection,
} from '../dist/index.js';

function usage() {
  console.error([
    'Usage:',
    '  cms-field-vocabulary sync --config <path> [--if-needed]',
    '  cms-field-vocabulary check --config <path>',
    '  cms-field-vocabulary resolve --config <path> --field-id <id>... [--rendering-selection <field-id>:<discriminator>=<value>]... --output <path>',
  ].join('\n'));
}

function parseRenderingSelection(value) {
  const match = /^([^:]+):([^=]+)=([^=]+)$/.exec(value);
  if (!match) {
    throw new Error('--rendering-selection must use <field-id>:<discriminator>=<value>');
  }
  return { fieldId: match[1], discriminator: match[2], value: match[3] };
}

function parseArguments(argv) {
  const [command, ...rest] = argv;
  const options = {
    command,
    config: null,
    output: null,
    fieldIds: [],
    renderingSelections: [],
    ifNeeded: false,
    seen: new Set(),
  };
  function readValue(index, flag) {
    const value = rest[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value`);
    return value;
  }
  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];
    if (argument === '--if-needed') {
      if (options.seen.has(argument)) throw new Error(`Duplicate option: ${argument}`);
      options.seen.add(argument);
      options.ifNeeded = true;
    }
    else if (argument === '--config' || argument === '--output') {
      if (options.seen.has(argument)) throw new Error(`Duplicate option: ${argument}`);
      options.seen.add(argument);
      const value = readValue(index, argument);
      if (argument === '--config') options.config = value;
      else options.output = value;
      index += 1;
    }
    else if (argument === '--field-id') {
      options.seen.add(argument);
      options.fieldIds.push(readValue(index, argument));
      index += 1;
    }
    else if (argument === '--rendering-selection') {
      options.seen.add(argument);
      options.renderingSelections.push(parseRenderingSelection(readValue(index, argument)));
      index += 1;
    }
    else throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

function rejectOptions(options, command, flags) {
  for (const flag of flags) {
    if (options.seen.has(flag)) throw new Error(`${flag} is not valid for ${command}`);
  }
}

try {
  const options = parseArguments(process.argv.slice(2));
  if (!options.config) throw new Error('--config is required');
  if (options.command === 'sync') {
    rejectOptions(options, 'sync', ['--output', '--field-id', '--rendering-selection']);
    const status = await syncProjection({ configPath: options.config, ifNeeded: options.ifNeeded });
    console.log(status === 'current' ? 'CMS field projection is current.' : 'CMS field projection synchronized.');
  } else if (options.command === 'check') {
    rejectOptions(options, 'check', ['--if-needed', '--output', '--field-id', '--rendering-selection']);
    await checkProjection({ configPath: options.config });
    console.log('CMS field projection is current.');
  } else if (options.command === 'resolve') {
    rejectOptions(options, 'resolve', ['--if-needed']);
    if (!options.output) throw new Error('--output is required');
    if (options.fieldIds.length === 0) throw new Error('resolve requires at least one --field-id');
    const selected = await resolveProjectionFields({
      configPath: options.config,
      fieldIds: options.fieldIds,
      renderingSelections: options.renderingSelections,
      output: options.output,
    });
    console.log(`Resolved ${selected?.contracts.length || 0} selected CMS field contract(s).`);
  } else {
    usage();
    process.exitCode = 2;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  usage();
  process.exitCode = 1;
}
