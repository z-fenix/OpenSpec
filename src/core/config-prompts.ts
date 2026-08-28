import * as yaml from 'yaml';
import type { ProjectConfig } from './project-config.js';

/**
 * Serialize config to YAML string with helpful comments.
 *
 * Only the fields present on `config` are written as live values; the rest are
 * emitted as commented scaffolding. This keeps a minimal caller (e.g. a store
 * root passing only `{ schema }`) producing a minimal legacy config, while a
 * full `openspec init` writes artifacts_dir, a starter context, and rules.
 *
 * @param config - Partial config object (schema required, other fields optional)
 * @returns YAML string ready to write to file
 */
export function serializeConfig(config: Partial<ProjectConfig>): string {
  const lines: string[] = [];

  // Schema (required)
  lines.push(`schema: ${config.schema}`);
  lines.push('');

  // Artifacts directory (optional) - the root holding changes/ and specs/,
  // relative to the project root. Omitted entirely when not set so legacy
  // single-root configs stay minimal (runtime defaults to 'openspec').
  if (config.artifacts_dir !== undefined) {
    lines.push('# Directory holding changes/ and specs/, relative to the project root.');
    lines.push(`artifacts_dir: ${config.artifacts_dir}`);
    lines.push('');
  }

  if (config.context !== undefined) {
    lines.push('context: |');
    // A block-scalar source ends with a newline; dropping it here avoids
    // emitting a trailing whitespace-only line inside the block.
    for (const line of config.context.replace(/\n$/, '').split('\n')) {
      lines.push(`  ${line}`);
    }
    lines.push('');
  } else {
    // Context section with comments
    lines.push('# Project context (optional)');
    lines.push('# This is shown to AI when creating artifacts.');
    lines.push('# Add your tech stack, conventions, style guides, domain knowledge, etc.');
    lines.push('# Example:');
    lines.push('#   context: |');
    lines.push('#     Tech stack: TypeScript, React, Node.js');
    lines.push('#     We use conventional commits');
    lines.push('#     Domain: e-commerce platform');
    lines.push('');
  }

  // Rules: a real block when the caller supplies one (yaml.stringify handles
  // any quoting), otherwise the commented scaffolding.
  if (config.rules !== undefined && Object.keys(config.rules).length > 0) {
    lines.push('# Per-artifact rules');
    lines.push(...yaml.stringify({ rules: config.rules }).trimEnd().split('\n'));
    lines.push('');
  } else {
    lines.push('# Per-artifact rules (optional)');
    lines.push('# Add custom rules for specific artifacts.');
    lines.push('# Example:');
    lines.push('#   rules:');
    lines.push('#     proposal:');
    lines.push('#       - Keep proposals under 500 words');
    lines.push('#       - Always include a "Non-goals" section');
    lines.push('#     tasks:');
    lines.push('#       - Break tasks into chunks of max 2 hours');
    lines.push('');
  }

  // Operation guidance section with comments
  lines.push('# Per-operation guidance (optional)');
  lines.push('# Add advisory guidance for how apply and archive work should be conducted.');
  lines.push('# This is separate from artifact rules above.');
  lines.push('# Example:');
  lines.push('#   operations:');
  lines.push('#     apply:');
  lines.push('#       guidance:');
  lines.push('#         - Keep test summaries concise');
  lines.push('#     archive:');
  lines.push('#       guidance:');
  lines.push('#         - Summarize the archive outcome before finishing');

  return lines.join('\n') + '\n';
}
