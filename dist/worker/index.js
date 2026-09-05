var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// _defaults.js
var DEFAULT_SETTINGS = {
  colors: {
    bg: "#0d0b1a",
    purple: "#833ab4",
    pink: "#e1306c",
    orange: "#f77737",
    yellow: "#fcaf45",
    magenta: "#bc1888"
  },
  slider: [
    { icon: "fas fa-bullhorn", title: "Sua empresa em destaque", desc: "Milhares de moradores da Vila Valqueire visitam nosso portal todos os dias.", cta: "Anuncie aqui" },
    { icon: "fa-brands fa-instagram", title: "Alcance nas redes sociais", desc: "Divulgue no @vilavalqueirerj e movimente seu Instagram.", cta: "Quero divulgar" },
    { icon: "fas fa-store", title: "Com\xE9rcio local", desc: "Pacotes especiais para lojas, cl\xEDnicas, restaurantes e servi\xE7os do bairro.", cta: "Falar com a equipe" },
    { icon: "fas fa-cake-candles", title: "Eventos e pessoas f\xEDsicas", desc: "Anivers\xE1rios, an\xFAncios, vendas particulares: voc\xEA tamb\xE9m pode anunciar.", cta: "Solicitar or\xE7amento" }
  ],
  banner: {
    tag: "PUBLICIDADE",
    title: "JSMuniz Publicidade",
    desc: "Espa\xE7o reservado para o seu an\xFAncio",
    cta: "Anuncie aqui"
  }
};
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      ...extraHeaders
    }
  });
}
__name(json, "json");
function pickString(value, fallback, max = 200) {
  if (typeof value !== "string") return fallback;
  const t = value.trim().slice(0, max);
  return t || fallback;
}
__name(pickString, "pickString");
var HEX_RE = /^#[0-9a-fA-F]{6}$/;
function sanitizeColors(colors) {
  const d = DEFAULT_SETTINGS.colors;
  if (!colors || typeof colors !== "object") return { ...d };
  const out = {};
  Object.keys(d).forEach((k) => {
    const v = colors[k];
    out[k] = HEX_RE.test(v) ? v : d[k];
  });
  return out;
}
__name(sanitizeColors, "sanitizeColors");
function sanitizeSlider(slider) {
  if (!Array.isArray(slider)) return DEFAULT_SETTINGS.slider;
  const clean = slider.slice(0, 8).map((s) => ({
    icon: pickString(s?.icon, DEFAULT_SETTINGS.slider[0].icon, 80),
    title: pickString(s?.title, "Publicidade", 90),
    desc: pickString(s?.desc, "", 220),
    cta: pickString(s?.cta, "Anuncie aqui", 60)
  }));
  if (clean.length === 0) return DEFAULT_SETTINGS.slider;
  return clean;
}
__name(sanitizeSlider, "sanitizeSlider");
function sanitizeBanner(banner) {
  const d = DEFAULT_SETTINGS.banner;
  if (!banner || typeof banner !== "object") return { ...d };
  return {
    tag: pickString(banner.tag, d.tag, 40),
    title: pickString(banner.title, d.title, 80),
    desc: pickString(banner.desc, d.desc, 160),
    cta: pickString(banner.cta, d.cta, 40)
  };
}
__name(sanitizeBanner, "sanitizeBanner");
function mergeSettings(defaults, stored) {
  const now = {
    colors: { ...defaults.colors, ...stored.colors || {} },
    slider: Array.isArray(stored.slider) && stored.slider.length ? stored.slider : defaults.slider,
    banner: { ...defaults.banner, ...stored.banner || {} }
  };
  return now;
}
__name(mergeSettings, "mergeSettings");
function checkCredentials(request, env) {
  const allowedUser = env.ADMIN_USER || "jsmunize";
  const allowedPass = env.ADMIN_PASS || "jojo7811";
  const auth = request.headers.get("Authorization") || "";
  const [scheme, encoded] = auth.split(" ");
  if (scheme !== "Basic" || !encoded) return false;
  try {
    const decoded = atob(encoded);
    const idx = decoded.indexOf(":");
    if (idx === -1) return false;
    const user = decoded.slice(0, idx);
    const pass = decoded.slice(idx + 1);
    return user === allowedUser && pass === allowedPass;
  } catch (e) {
    return false;
  }
}
__name(checkCredentials, "checkCredentials");

// api/admin/auth.js
async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return json({ ok: false, error: "body" }, 400);
  }
  const allowedUser = env.ADMIN_USER || "jsmunize";
  const allowedPass = env.ADMIN_PASS || "jojo7811";
  if (body.user === allowedUser && body.pass === allowedPass) {
    return json({ ok: true });
  }
  return json({ ok: false, error: "invalid", message: "Usu\xE1rio ou senha inv\xE1lidos." }, 401);
}
__name(onRequestPost, "onRequestPost");

// api/admin/settings.js
async function onRequestPost2(context) {
  const { request, env } = context;
  if (!checkCredentials(request, env)) {
    return json({ ok: false, error: "auth", message: "N\xE3o autorizado." }, 401);
  }
  if (!env.SETTINGS) {
    return json({
      ok: false,
      error: "kv",
      message: 'Binding KV "SETTINGS" n\xE3o configurado. Configure em Cloudflare Pages > Settings > Bindings > KV namespace.'
    }, 500);
  }
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return json({ ok: false, error: "body", message: "JSON inv\xE1lido." }, 400);
  }
  const settings = {
    colors: sanitizeColors(body.colors),
    slider: sanitizeSlider(body.slider),
    banner: sanitizeBanner(body.banner)
  };
  try {
    await env.SETTINGS.put("site_settings", JSON.stringify(settings));
    return json({ ok: true, message: "Configura\xE7\xF5es salvas com sucesso!" });
  } catch (err) {
    return json({ ok: false, error: "save", message: "Falha ao salvar. Tente novamente." }, 500);
  }
}
__name(onRequestPost2, "onRequestPost");

// api/settings.js
async function onRequestGet(context) {
  const { env } = context;
  let settings = { ...DEFAULT_SETTINGS };
  try {
    const raw = await env.SETTINGS.get("site_settings");
    if (raw) {
      settings = mergeSettings(DEFAULT_SETTINGS, JSON.parse(raw));
    }
  } catch (err) {
  }
  return json(settings, 200, { "Cache-Control": "public, max-age=30, s-maxage=30" });
}
__name(onRequestGet, "onRequestGet");

// instagram.js
var GRAPH_URL = "https://graph.facebook.com/v21.0";
function json2(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Access-Control-Allow-Origin": "*",
      ...extraHeaders
    }
  });
}
__name(json2, "json");
async function onRequest(context) {
  const { env } = context;
  const token = env.INSTAGRAM_TOKEN;
  const userId = env.INSTAGRAM_USER_ID;
  if (!token || !userId) {
    return json2({
      ok: false,
      error: "config",
      message: "Defina INSTAGRAM_TOKEN e INSTAGRAM_USER_ID nas vari\xE1veis de ambiente do Cloudflare Pages."
    }, 200);
  }
  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "thumbnail_url",
    "permalink",
    "timestamp",
    "like_count",
    "comments_count"
  ].join(",");
  const url = `${GRAPH_URL}/${userId}/media?fields=${encodeURIComponent(fields)}&limit=12&access_token=${token}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok || data.error) {
      return json2({
        ok: false,
        error: "api",
        message: data.error ? data.error.message : "Erro ao consultar a API do Instagram."
      }, 200);
    }
    const posts = (data.data || []).map((post) => ({
      id: post.id,
      caption: post.caption || "",
      media_type: post.media_type || "IMAGE",
      media_url: post.media_url || "",
      thumbnail_url: post.thumbnail_url || "",
      permalink: post.permalink || "",
      timestamp: post.timestamp || "",
      like_count: post.like_count || 0,
      comments_count: post.comments_count || 0
    }));
    return json2({
      ok: true,
      count: posts.length,
      posts,
      fetched_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    return json2({
      ok: false,
      error: "network",
      message: "Falha de rede ao buscar o feed do Instagram."
    }, 200);
  }
}
__name(onRequest, "onRequest");

// ../.wrangler/tmp/pages-0A6dm9/functionsRoutes-0.11499974087662657.mjs
var routes = [
  {
    routePath: "/api/admin/auth",
    mountPath: "/api/admin",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/admin/settings",
    mountPath: "/api/admin",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/settings",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/instagram",
    mountPath: "/",
    method: "",
    middlewares: [],
    modules: [onRequest]
  }
];

// ../../../../../AppData/Local/npm-cache/_npx/d77349f55c2be1c0/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../../AppData/Local/npm-cache/_npx/d77349f55c2be1c0/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
