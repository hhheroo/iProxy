# Whistle rules — reference

Official **English** docs mirrored from [avwo/whistle `docs/en/docs/rules`](https://github.com/avwo/whistle/tree/master/docs/en/docs/rules) into [`reference/rules/`](rules/).

Upstream root: [docs/en/docs](https://github.com/avwo/whistle/tree/master/docs/en/docs).

**How to use this skill’s refs**

1. Read **iProxy dialect** below first (always).
2. For syntax / a protocol: open the matching file under [`reference/rules/`](rules/) (full upstream English text).
3. Start points: [rule.md](rules/rule.md) · [pattern.md](rules/pattern.md) · [operation.md](rules/operation.md) · [protocols.md](rules/protocols.md) · [filters.md](rules/filters.md) · [file.md](rules/file.md)

---

## iProxy dialect

iProxy supports **full upstream Whistle syntax** (markdown fenced embeds, `{key}`, `${}` templates — see [operation.md](rules/operation.md), [file.md](rules/file.md)).

**Extension:** wrap protocol values in **double backticks** on both sides (`` `` … `` ``):

```txt
# iProxy extension
www.example.com/api file://``
{"status":"ok","data":[]}
``

pattern file://``{"ok":true}``
```

Also valid (upstream Whistle):

````txt
``` mock.json
{"status":"ok"}
```
www.example.com/api file://{mock.json}

www.example.com/jsonp file://`(${query.callback}({"ok":1}))`
````

Pattern captures `$1`…`$9` still work (match groups; distinct from `${}` templates).

---

## Full protocol catalog

All files live in [`reference/rules/`](rules/). Links below are local English copies.

### Core / meta

| Doc | File |
|-----|------|
| Rule syntax | [rule.md](rules/rule.md) |
| pattern | [pattern.md](rules/pattern.md) |
| operation | [operation.md](rules/operation.md) |
| Protocol list | [protocols.md](rules/protocols.md) |
| Filters overview | [filters.md](rules/filters.md) |
| lineProps | [lineProps.md](rules/lineProps.md) |
| inherit | [inherit.md](rules/inherit.md) |
| frameScript | [frameScript.md](rules/frameScript.md) |

### Special rules

| Protocol | File |
|----------|------|
| `@` remote rules / client certs | [@.md](rules/@.md) |
| `%` plugin vars | [plugin-vars.md](rules/plugin-vars.md) |

### Map Local

| Protocol | File |
|----------|------|
| file | [file.md](rules/file.md) |
| xfile | [xfile.md](rules/xfile.md) |
| tpl | [tpl.md](rules/tpl.md) |
| xtpl | [xtpl.md](rules/xtpl.md) |
| rawfile | [rawfile.md](rules/rawfile.md) |
| xrawfile | [xrawfile.md](rules/xrawfile.md) |

### Map Remote

| Protocol | File |
|----------|------|
| https | [https.md](rules/https.md) |
| http | [http.md](rules/http.md) |
| wss | [wss.md](rules/wss.md) |
| ws | [ws.md](rules/ws.md) |
| tunnel | [tunnel.md](rules/tunnel.md) |

### DNS Spoofing / Proxy

| Protocol | File |
|----------|------|
| host | [host.md](rules/host.md) |
| xhost | [xhost.md](rules/xhost.md) |
| proxy | [proxy.md](rules/proxy.md) |
| xproxy | [xproxy.md](rules/xproxy.md) |
| https-proxy | [https-proxy.md](rules/https-proxy.md) |
| xhttps-proxy | [xhttps-proxy.md](rules/xhttps-proxy.md) |
| socks | [socks.md](rules/socks.md) |
| xsocks | [xsocks.md](rules/xsocks.md) |
| pac | [pac.md](rules/pac.md) |

### Rewrite Request

| Protocol | File |
|----------|------|
| urlParams | [urlParams.md](rules/urlParams.md) |
| pathReplace | [pathReplace.md](rules/pathReplace.md) |
| sniCallback | [sniCallback.md](rules/sniCallback.md) |
| method | [method.md](rules/method.md) |
| tlsOptions (cipher) | [cipher.md](rules/cipher.md) |
| reqHeaders | [reqHeaders.md](rules/reqHeaders.md) |
| forwardedFor | [forwardedFor.md](rules/forwardedFor.md) |
| ua | [ua.md](rules/ua.md) |
| auth | [auth.md](rules/auth.md) |
| cache | [cache.md](rules/cache.md) |
| referer | [referer.md](rules/referer.md) |
| attachment | [attachment.md](rules/attachment.md) |
| reqCharset | [reqCharset.md](rules/reqCharset.md) |
| reqCookies | [reqCookies.md](rules/reqCookies.md) |
| reqCors | [reqCors.md](rules/reqCors.md) |
| reqType | [reqType.md](rules/reqType.md) |
| reqBody | [reqBody.md](rules/reqBody.md) |
| reqMerge | [reqMerge.md](rules/reqMerge.md) |
| reqPrepend | [reqPrepend.md](rules/reqPrepend.md) |
| reqAppend | [reqAppend.md](rules/reqAppend.md) |
| reqReplace | [reqReplace.md](rules/reqReplace.md) |
| reqWrite | [reqWrite.md](rules/reqWrite.md) |
| reqWriteRaw | [reqWriteRaw.md](rules/reqWriteRaw.md) |
| reqRules | [reqRules.md](rules/reqRules.md) |
| reqScript | [reqScript.md](rules/reqScript.md) |

### Rewrite Response

| Protocol | File |
|----------|------|
| statusCode | [statusCode.md](rules/statusCode.md) |
| replaceStatus | [replaceStatus.md](rules/replaceStatus.md) |
| redirect | [redirect.md](rules/redirect.md) |
| locationHref | [locationHref.md](rules/locationHref.md) |
| resHeaders | [resHeaders.md](rules/resHeaders.md) |
| responseFor | [responseFor.md](rules/responseFor.md) |
| resCharset | [resCharset.md](rules/resCharset.md) |
| resCookies | [resCookies.md](rules/resCookies.md) |
| resCors | [resCors.md](rules/resCors.md) |
| resType | [resType.md](rules/resType.md) |
| resBody | [resBody.md](rules/resBody.md) |
| resMerge | [resMerge.md](rules/resMerge.md) |
| resPrepend | [resPrepend.md](rules/resPrepend.md) |
| resAppend | [resAppend.md](rules/resAppend.md) |
| resReplace | [resReplace.md](rules/resReplace.md) |
| htmlPrepend | [htmlPrepend.md](rules/htmlPrepend.md) |
| htmlBody | [htmlBody.md](rules/htmlBody.md) |
| htmlAppend | [htmlAppend.md](rules/htmlAppend.md) |
| cssPrepend | [cssPrepend.md](rules/cssPrepend.md) |
| cssBody | [cssBody.md](rules/cssBody.md) |
| cssAppend | [cssAppend.md](rules/cssAppend.md) |
| jsPrepend | [jsPrepend.md](rules/jsPrepend.md) |
| jsBody | [jsBody.md](rules/jsBody.md) |
| jsAppend | [jsAppend.md](rules/jsAppend.md) |
| trailers | [trailers.md](rules/trailers.md) |
| resWrite | [resWrite.md](rules/resWrite.md) |
| resWriteRaw | [resWriteRaw.md](rules/resWriteRaw.md) |
| resRules | [resRules.md](rules/resRules.md) |
| resScript | [resScript.md](rules/resScript.md) |

### General / Throttle / Tools / Settings / Filters

| Protocol | File |
|----------|------|
| pipe | [pipe.md](rules/pipe.md) |
| delete | [delete.md](rules/delete.md) |
| headerReplace | [headerReplace.md](rules/headerReplace.md) |
| reqDelay | [reqDelay.md](rules/reqDelay.md) |
| resDelay | [resDelay.md](rules/resDelay.md) |
| reqSpeed | [reqSpeed.md](rules/reqSpeed.md) |
| resSpeed | [resSpeed.md](rules/resSpeed.md) |
| weinre | [weinre.md](rules/weinre.md) |
| log | [log.md](rules/log.md) |
| style | [style.md](rules/style.md) |
| enable | [enable.md](rules/enable.md) |
| disable | [disable.md](rules/disable.md) |
| ignore | [ignore.md](rules/ignore.md) |
| skip | [skip.md](rules/skip.md) |
| excludeFilter | [excludeFilter.md](rules/excludeFilter.md) |
| includeFilter | [includeFilter.md](rules/includeFilter.md) |

---

## Agent quick notes (common)

```txt
pattern operation [lineProps...] [filters...]
```

| Need | Typical rule |
|------|----------------|
| Exact file map | `$https://host/path/file.js file://</abs/file.js>` |
| CDN prefix → dir | `https://cdn/.../pkg/ file:///abs/dist/` or `xfile://` if miss→origin |
| Host → local port | `www.example.com 127.0.0.1:5173` |
| URL rewrite | `fe-boe.example.com/api http://localhost:3008/api` |
| iProxy JSON body | `` pattern file://``{"ok":true}`` `` |

**Auto path join:** remaining request path appends to target; disable with `<...>`.  
**file vs xfile:** missing local → 404 vs continue to origin.  
**host vs proxy:** host wins by default; `lineProps://proxyHost` to combine.

More examples: [examples.md](../examples.md).

---

## Sync note

Mirrored from upstream **`docs/en/docs/rules`** (100 `.md` files, English). Re-sync:

```bash
# sparse-checkout docs/en/docs/rules → reference/rules/
git clone --depth 1 --filter=blob:none --sparse https://github.com/avwo/whistle.git
cd whistle && git sparse-checkout set docs/en/docs/rules
cp -R docs/en/docs/rules/. /path/to/whistle-rules/reference/rules/
```
