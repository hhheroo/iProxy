# Whistle rules — examples

Agent-oriented patterns for local FE / CDN / API proxy work.

**iProxy:** full Whistle syntax works; extension is double-backtick `` file://``content`` ``. See SKILL.md and [reference/reference.md](reference/reference.md).

## 0. Inline mock

```txt
# iProxy double backticks
$https://www.example.com/api/users file://``
{"list":[{"id":1,"name":"a"}]}
``

www.example.com/api/ok file://``{"ok":true}``
```

Upstream Whistle fence + `{key}` (also OK in iProxy):

````txt
``` users.json
{"list":[]}
```
$https://www.example.com/api/users file://{users.json}
````

Templates (OK in iProxy):

```txt
www.example.com/jsonp file://`(${query.callback}({"ok":1}))`
```

## 1. Single remote file → local file

Exact URL, no path join:

```txt
$https://www.tiktok.com/module_meta/common-login/vmok-manifest.json file://</Users/way/Developer/code.byted.org/tiktok/webapp_monorepo/subspaces/webapp_shared/modules/login-vmok/dist-origin/vmok-manifest.json>
```

Wrong (join can append extra segments; weaker exactness):

```txt
# avoid for single-file pin
https://www.tiktok.com/module_meta/common-login/vmok-manifest.json file:///Users/way/.../vmok-manifest.json
```

## 2. CDN prefix → local dist directory

Remaining path after the matched prefix is appended under `dist-origin/`:

```txt
https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/web/tiktok_fe_login_vmok/ file:///Users/way/Developer/code.byted.org/tiktok/webapp_monorepo/subspaces/webapp_shared/modules/login-vmok/dist-origin/
```

Request  
`.../tiktok_fe_login_vmok/static/js/foo.js`  
→  
`.../dist-origin/static/js/foo.js`

If some assets may be missing locally and should fall back to CDN:

```txt
https://sf16-.../tiktok_fe_login_vmok/ xfile:///Users/way/.../dist-origin/
```

## 3. Combined login-vmok rule set

```txt
# login-vmok local

$https://www.tiktok.com/module_meta/common-login/vmok-manifest.json file://</Users/way/Developer/code.byted.org/tiktok/webapp_monorepo/subspaces/webapp_shared/modules/login-vmok/dist-origin/vmok-manifest.json>

https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/web/tiktok_fe_login_vmok/ xfile:///Users/way/Developer/code.byted.org/tiktok/webapp_monorepo/subspaces/webapp_shared/modules/login-vmok/dist-origin/
```

## 4. BOE / prod host → local servers (Flinx-style)

```txt
# API and SPA to local
fe-boe.byteintl.net/api http://localhost:3008/api
fe-boe.byteintl.net http://localhost:8080

# optional: prod → local (keep commented until needed)
# fe.byteintl.net/api http://localhost:3008/api
# fe.byteintl.net http://localhost:8080
```

## 5. Only one JS from CDN → local

```txt
$https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/react-v18/webapp-desktop/static/js/slardar.f896ab51.js file://</private/tmp/slardar.f896ab51.js>
```

## 6. Mock JSON API

```txt
# iProxy double backticks
www.example.com/api/users file://``{"list":[]}``

# or () / local file / Whistle {key}
www.example.com/api/users file://({"list":[]})
www.example.com/api/users file:///Users/me/mocks/users.json includeFilter://m:GET
www.example.com/api/users file://``{"ok":true}`` includeFilter://m:POST
```

## 7. Wildcard capture to local tree

```txt
^https://cdn.example.com/assets/** file:///Users/me/proj/dist/$1
```

## 8. Hosts to Vite / webpack

```txt
www.example.com 127.0.0.1:5173
# if HTTPS to 127.0.0.1 misbehaves:
www.example.com 127.0.0.1:5173 disable://auto2http
```

## 9. Multi-directory search

```txt
www.example.com/static file:///Users/me/app/dist|/Users/me/app/public
```

First existing file wins; else `file` → 404 (`xfile` → origin).

## iProxy create-rule payload sketch

```json
{
  "name": "login-vmok",
  "enabled": true,
  "content": "$https://www.tiktok.com/module_meta/common-login/vmok-manifest.json file://</Users/way/.../vmok-manifest.json>\n\nhttps://sf16-.../tiktok_fe_login_vmok/ xfile:///Users/way/.../dist-origin/\n"
}
```

After create: ensure system or LAN proxy is on so traffic hits Whistle.
