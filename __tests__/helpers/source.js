const fs = require('fs');
const path = require('path');
const {parse} = require('@babel/parser');

// Shared source-reading helpers for the guard suites.
//
// `read` strips comments before returning. Every guard here asserts what
// the code must NOT do, and the fixes are documented in comments that
// necessarily quote the removed behaviour ("no SSN", "was
// support@keystone.example", "no longer says 'Autopay on'"). Matching raw
// text makes a test fail on its own explanation — which happened twice
// before this was factored out.
//
// Babel's parser rather than a hand-rolled scanner: a scanner that tracks
// quote characters mis-parses JSX prose like `don't` or `isn’t` as an
// opening string and silently stops stripping for the rest of the file.

const SRC = path.join(__dirname, '..', '..', 'src');

const stripComments = src => {
  const ast = parse(src, {
    sourceType: 'module',
    errorRecovery: true,
    plugins: ['jsx', 'typescript', 'classProperties', 'optionalChaining'],
  });
  const chars = src.split('');
  for (const {start, end} of ast.comments ?? []) {
    for (let i = start; i < end; i += 1) {
      // Preserve newlines so line-based regexes keep their shape.
      if (chars[i] !== '\n') chars[i] = ' ';
    }
  }
  return chars.join('');
};

const readRaw = rel => fs.readFileSync(path.join(SRC, rel), 'utf8');
const read = rel => stripComments(readRaw(rel));

/** Every .js/.jsx/.ts/.tsx file under src/, as paths relative to src/. */
const allSourceFiles = (dir = SRC) =>
  fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return allSourceFiles(full);
    return /\.(js|jsx|ts|tsx)$/.test(e.name) ? [path.relative(SRC, full)] : [];
  });

// Copy as a READER sees it, not as it is typed.
//
// A phrase test that greps raw source cannot see user-facing text,
// for two reasons that both produced false passes here:
//
//   1. JSX wraps. `Pay rent in two{'\n'}          taps` contains neither
//      "two taps" nor "in two taps" as a substring — the words are split
//      across lines with indentation between them. Every claim written
//      across a line break was invisible to the old regex.
//   2. Identifiers and imports are not copy, so grepping whole files
//      produces noise that pushes you toward narrow allowlists — and an
//      allowlist is how landlord screens, receipts and fixtures escaped
//      the sweep entirely.
//
// So: collect string literals, template chunks and JSX text via the AST,
// then collapse all whitespace. What comes back is what a person reads.
const userFacingCopy = src => {
  const ast = parse(src, {
    sourceType: 'module',
    errorRecovery: true,
    plugins: ['jsx', 'typescript', 'classProperties', 'optionalChaining'],
  });

  const out = [];
  const seen = new Set();

  // Presentation attributes are not copy. `className="text-inactive_text"`
  // contains "active"; `font-open-sauce-sans` contains "sans". Including
  // them buries the real findings in styling noise, which is what pushes
  // a phrase test toward a hand-picked allowlist.
  const SKIP_ATTRS = new Set([
    'className',
    'style',
    'testID',
    'accessibilityRole',
    'key',
    'name', // icon names
    'source',
    'resizeMode',
    'keyboardType',
    'autoCapitalize',
    'autoComplete',
    'barStyle',
    'backgroundColor',
    'tintColor',
    'color',
  ]);

  const walk = (node, skip) => {
    if (!node || typeof node.type !== 'string' || seen.has(node)) return;
    seen.add(node);

    if (!skip) {
      if (node.type === 'StringLiteral') out.push(node.value);
      if (node.type === 'JSXText') out.push(node.value);
      if (node.type === 'TemplateElement') out.push(node.value.cooked ?? '');
    }

    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'comments') continue;
      const child = node[key];
      const childSkip =
        skip ||
        (node.type === 'JSXAttribute' && SKIP_ATTRS.has(node.name?.name)) ||
        // Object keys used as style/class maps.
        (node.type === 'ObjectProperty' && SKIP_ATTRS.has(node.key?.name));
      if (Array.isArray(child)) child.forEach(c => walk(c, childSkip));
      else if (child && typeof child.type === 'string') walk(child, childSkip);
    }
  };
  walk(ast.program, false);

  const looksLikeClassNames = t =>
    /^[\w\s:/[\].%-]+$/.test(t) &&
    /(^|\s)(text|font|bg|px|py|mt|mb|ml|mr|p|m|w|h|flex|items|justify|rounded|border|gap|leading|tracking|min|max|absolute|relative|self|opacity)-/.test(
      t,
    );

  return out
    // Import specifiers are string literals too; drop obvious paths.
    .filter(t => !/^[./@][\w./@-]*$/.test(t.trim()))
    .map(t => t.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter(t => !looksLikeClassNames(t))
    // Identifier-shaped values (query keys, storage keys, enum members,
    // capability names). These are code, not copy, and leaving them in
    // creates PHANTOM PHRASES: strings are joined with a space so that
    // text split across sibling JSX nodes still matches, which meant the
    // row title "Credit building" sitting next to the literal
    // 'creditReporting' from can(...) read as "building creditReporting"
    // and tripped the credit pattern.
    .filter(
      t =>
        !/^[A-Z0-9_]+$/.test(t) && // SCREAMING_CASE
        !/^[a-z0-9]+([_-][a-z0-9]+)+$/.test(t) && // kebab / snake
        // camelCase ONLY (internal capital after a lowercase start).
        // Not a bare capitalised word — "Protected", "Covered" and
        // "Paid" are real one-word copy and must stay visible.
        !/^[a-z]+[A-Z][a-zA-Z0-9]*$/.test(t),
    );
};

/** Normalised copy for a file, joined so cross-node phrases still match. */
const copyOf = rel => userFacingCopy(readRaw(rel)).join(' ');

module.exports = {
  SRC,
  stripComments,
  read,
  readRaw,
  allSourceFiles,
  userFacingCopy,
  copyOf,
};
