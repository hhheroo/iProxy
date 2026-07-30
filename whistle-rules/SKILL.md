---
name: whistle-rules
description: >-
  Author correct Whistle / iProxy rule syntax (pattern, file/xfile, host, map
  remote, filters). iProxy adds double-backtick embeds file://``content``;
  full upstream Whistle syntax (fenced embeds, ${} templates) also works. Use
  when creating or updating whistle/iProxy rules, map local/remote, hosts,
  CDN-to-local proxies, or mentions of whistle、规则、file://、xfile、iproxy.
---

# Whistle Rules

Based on official English docs: [avwo/whistle `docs/en/docs`](https://github.com/avwo/whistle/tree/master/docs/en/docs) (rules at [`docs/en/docs/rules`](https://github.com/avwo/whistle/tree/master/docs/en/docs/rules)). Read this skill before writing rules.

- Quick ref, iProxy dialect, protocol index: [reference/reference.md](reference/reference.md)
- **Full official rule docs (English mirror):** [reference/rules/](reference/rules/) — open the matching `.md` (e.g. [file.md](reference/rules/file.md), [pattern.md](reference/rules/pattern.md))
- Common examples: [examples.md](examples.md)

For a given protocol: **read the iProxy dialect extension first, then the full `reference/rules/<name>.md`** (upstream Whistle syntax is supported).

**iProxy supports full upstream Whistle syntax**; see the double-backtick extension below.

## When to use

- Creating or updating Whistle / iProxy rules
- Mapping remote URLs / CDN assets to local files or directories
- Hosts / reverse-proxy to localhost / API mocks

## iProxy dialect (extension)

iProxy is compatible with **native Whistle syntax** (markdown fenced embeds, `{key}`, `${}` templates, etc. — see [operation.md](reference/rules/operation.md) / [file.md](reference/rules/file.md)).

**Extension:** wrap protocol values in **double backticks** on both sides (two `` ` `` characters each end):

````txt
# iProxy extension: double backticks (good for multiline JSON)
www.example.com/api file://``
{"status":"ok","data":[]}
``

www.example.com/ok file://``{"status":"ok"}``

# Upstream Whistle also works
``` body.json
{"ok":true}
```
www.example.com/api file://{body.json}

www.example.com/jsonp file://`(${query.callback}({"ok":1}))`

# Short literals
www.example.com/ok file://({"status":"ok"})
````

Notes:

- Do not invent a “standalone key block in single backticks + `{key}`”; use either Whistle `` ``` key `` fences or `` file://``content`` ``
- Match captures `$1`…`$9` are distinct from `${...}` templates; both work in iProxy

## iProxy workflow

iProxy embeds Whistle. Use MCP `iproxy` / `user-iproxy`:

1. `list-rules` → list rules
2. `get-rule` → read content
3. `create-rule` / `update-rule` → write rules (Whistle syntax + optional double-backtick extension)
4. `set-system-proxy` / `set-proxy-on-lan` when needed

Do **not** invent syntax from memory; check this section, [reference/reference.md](reference/reference.md), or `reference/rules/`.

## Core syntax

```txt
pattern operation [lineProps...] [filters...]
```

- **pattern**: match request URL (below)
- **operation**: `protocol://value`, or multiple operations separated by spaces
- Lines starting with `#` are comments

Combine operations on one line:

```txt
www.example.com/* file:///static-files cache://3600 resCors://*
```

## Pattern cheat sheet (easy to get wrong)

| Pattern | Meaning |
|---------|---------|
| `example.com` | Any protocol/port on that host |
| `https://example.com/path` | **Path prefix** match (`/` boundary) |
| `https://example.com/path?x` | Exact path + query **prefix** |
| `$https://example.com/path` | **Exact** path (no subpaths) |
| `^https://*.example.com/a/*` | Path/query wildcards require `^` |
| `/regexp/i` | JS regexp |

Wildcards: `*` does not cross `.`/`/`; `**` can cross path segments (not `?`). Captures: `$1`…`$9`.

Path-prefix maps **auto-join** the remaining path (file drops query; remote URL keeps query).

## Local files: `file` / `xfile`

```txt
# Directory map: remaining path appended
https://cdn.example.com/pkg/ file:///Users/me/proj/dist/

# Exact single file: disable path join
$https://www.example.com/a/manifest.json file://</Users/me/proj/dist/manifest.json>

# Inline JSON: iProxy double backticks; short literals also (); Whistle fences OK
api.example.com/ok file://``{"status":"ok"}``
api.example.com/ok file://({"status":"ok"})

# Missing local → continue to origin (common for static assets)
cdn.example.com/static/ xfile:///Users/me/proj/dist/
```

Notes:

- Absolute paths: `file:///Users/...` (three slashes)
- `file://success` is treated as a path → 404; use `file://(success)`, iProxy `` file://``...`` ``, or Whistle `{key}` / fences
- `<path>` **disables** auto path join
- `file` miss → **404**; `xfile` miss → **continue to origin**
- Windows: `file://D:\path\to`; `~` allowed

## Map Remote / Hosts

```txt
# URL rewrite (auto-join remaining path)
fe-boe.example.com/api http://localhost:3008/api
fe-boe.example.com http://localhost:8080

# Disable join
www.example.com/path https://<www.test.com/fixed>

# DNS / port change (server still sees original Host)
www.example.com 127.0.0.1:5173
www.example.com host://www.test.com:8080
```

When both `host` and `proxy` match, `host` wins by default; use `lineProps://proxyHost` to combine.

## Filters (optional)

```txt
www.example.com/api file:///mock/ok.json includeFilter://m:POST
www.example.com/api file:///mock excludeFilter://*/api/auth
```

Multiple filters on one rule are **OR**. Common: `m:` method, `b:` body, `reqH.key:`, `s:` status.

## Agent checklist

Before finishing a rule:

1. [ ] Use `$` for exact single-file URL match?
2. [ ] Single file uses `file://<absolute-path>` to disable join?
3. [ ] Directory target ends with `/`, and remote prefix path aligns?
4. [ ] Need origin fallback → `xfile`, not `file`?
5. [ ] Inline: short `()`, or multiline via iProxy `` file://``...`` `` / Whistle fence+`{key}`?
6. [ ] If using templates, is `${...}` correct?
7. [ ] Path wildcards prefixed with `^`?
8. [ ] Local files/dirs exist?

## Official docs

- [en/docs/rules](https://github.com/avwo/whistle/tree/master/docs/en/docs/rules)
- [pattern](https://github.com/avwo/whistle/blob/master/docs/en/docs/rules/pattern.md)
- [rule](https://github.com/avwo/whistle/blob/master/docs/en/docs/rules/rule.md)
- [file](https://github.com/avwo/whistle/blob/master/docs/en/docs/rules/file.md)
- [operation](https://github.com/avwo/whistle/blob/master/docs/en/docs/rules/operation.md)
- [protocols](https://github.com/avwo/whistle/blob/master/docs/en/docs/rules/protocols.md)
