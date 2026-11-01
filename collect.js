// PULSE (GitHub-режим): один проход по источникам -> data/items.json. Запускается GitHub Actions.
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
try { fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n').forEach(l => { const m = l.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*?)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; }); } catch {}
const E = process.env, PORT = E.PORT || 3000, MAX_AGE = 12 * 3600e3, UP_AGE = 7 * 86400e3;
const UA = 'Mozilla/5.0 (compatible; PulseBot/1.0)';
const gn = (q, lang = 'ru', gl = 'RU') => `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:12h')}&hl=${lang}&gl=${gl}&ceid=${gl}:${lang}`;

const NITTER = ['https://nitter.net', 'https://xcancel.com', 'https://nitter.poast.org', 'https://nitter.privacyredirect.com', 'https://nitter.tiekoetter.com'];
const NEWS = [
  ['Мир', 'BBC World', 'https://feeds.bbci.co.uk/news/world/rss.xml'], ['США', 'BBC US&Canada', 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml'],
  ['Европа', 'BBC Europe', 'https://feeds.bbci.co.uk/news/world/europe/rss.xml'], ['Азия', 'BBC Asia', 'https://feeds.bbci.co.uk/news/world/asia/rss.xml'],
  ['Ближний Восток', 'BBC Middle East', 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml'], ['Африка', 'BBC Africa', 'https://feeds.bbci.co.uk/news/world/africa/rss.xml'],
  ['Латинская Америка', 'BBC LatAm', 'https://feeds.bbci.co.uk/news/world/latin_america/rss.xml'],
  ['Россия', 'Lenta.ru', 'https://lenta.ru/rss/news'], ['Россия', 'РИА Новости', 'https://ria.ru/export/rss2/archive/index.xml'], ['Россия', 'ТАСС', 'https://tass.ru/rss/v2.xml'],
  ['Россия', 'Интерфакс', 'https://www.interfax.ru/rss.asp'], ['Россия', 'Meduza', 'https://meduza.io/rss/all'], ['Россия', 'РБК', 'https://rssexport.rbc.ru/rbcnews/news/30/full.rss'],
  ['Россия', 'Коммерсантъ', 'https://www.kommersant.ru/RSS/news.xml'], ['Россия', 'Известия', 'https://iz.ru/xml/rss/all.xml'], ['Россия', 'Ведомости', 'https://www.vedomosti.ru/rss/news'],
  ['Россия', 'Moscow Times', 'https://www.themoscowtimes.com/rss/news'],
  ['США', 'CNN', 'http://rss.cnn.com/rss/edition.rss'], ['США', 'NYT World', 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml'], ['США', 'NYT US', 'https://rss.nytimes.com/services/xml/rss/nyt/US.xml'],
  ['США', 'NPR', 'https://feeds.npr.org/1001/rss.xml'], ['США', 'Fox News', 'https://moxie.foxnews.com/google-publisher/latest.xml'], ['США', 'CBS News', 'https://www.cbsnews.com/latest/rss/world'],
  ['США', 'ABC News', 'https://abcnews.go.com/abcnews/internationalheadlines'], ['США', 'Politico', 'https://rss.politico.com/politics-news.xml'], ['США', 'The Hill', 'https://thehill.com/feed/'],
  ['США', 'Washington Post', 'https://feeds.washingtonpost.com/rss/world'], ['США', 'Google News US', 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en'],
  ['США', 'Reuters', gn('site:reuters.com', 'en', 'US')], ['США', 'AP', gn('site:apnews.com', 'en', 'US')], ['США', 'Bloomberg', gn('site:bloomberg.com', 'en', 'US')],
  ['Франция', 'France 24 EN', 'https://www.france24.com/en/rss'], ['Франция', 'France 24 FR', 'https://www.france24.com/fr/rss'], ['Франция', 'RFI', 'https://www.rfi.fr/fr/rss'],
  ['Франция', 'Le Monde', 'https://www.lemonde.fr/rss/une.xml'], ['Франция', 'Le Figaro', 'https://www.lefigaro.fr/rss/figaro_actualites.xml'], ['Франция', 'Google News FR', 'https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr'],
  ['Германия', 'DW RU', 'https://rss.dw.com/rdf/rss-ru-all'], ['Германия', 'DW EN', 'https://rss.dw.com/rdf/rss-en-all'], ['Германия', 'Spiegel Intl', 'https://www.spiegel.de/international/index.rss'], ['Германия', 'Tagesschau', 'https://www.tagesschau.de/index~rss2.xml'],
  ['Великобритания', 'Guardian', 'https://www.theguardian.com/world/rss'], ['Великобритания', 'Sky News', 'https://feeds.skynews.com/feeds/rss/world.xml'], ['Великобритания', 'Google News UK', 'https://news.google.com/rss?hl=en-GB&gl=GB&ceid=GB:en'],
  ['Европа', 'Euronews', 'https://www.euronews.com/rss'], ['Испания', 'El País', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada'], ['Латинская Америка', 'BBC Mundo', 'https://feeds.bbci.co.uk/mundo/rss.xml'],
  ['Украина', 'Украинская правда', 'https://www.pravda.com.ua/rss/'], ['Украина', 'Kyiv Independent', 'https://kyivindependent.com/news-archive/rss/'], ['Украина', 'Укринформ', 'https://www.ukrinform.net/rss/block-lastnews'],
  ['Китай', 'Xinhua', 'http://www.xinhuanet.com/english/rss/worldrss.xml'], ['Китай', 'SCMP', 'https://www.scmp.com/rss/91/feed'],
  ['Япония', 'NHK', 'https://www3.nhk.or.jp/rss/news/cat0.xml'], ['Япония', 'Japan Times', 'https://www.japantimes.co.jp/feed/'],
  ['Индия', 'Times of India', 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms'], ['Индия', 'The Hindu', 'https://www.thehindu.com/news/international/feeder/default.rss'],
  ['Ближний Восток', 'Al Jazeera', 'https://www.aljazeera.com/xml/rss/all.xml'], ['Израиль', 'Times of Israel', 'https://www.timesofisrael.com/feed/'], ['Израиль', 'Jerusalem Post', 'https://www.jpost.com/rss/rssfeedsfrontpage.aspx'],
  ['Канада', 'CBC', 'https://www.cbc.ca/webfeed/rss/rss-world'], ['Австралия', 'ABC Australia', 'https://www.abc.net.au/news/feed/51120/rss.xml'],
  ['Россия', 'Google News RU', 'https://news.google.com/rss?hl=ru&gl=RU&ceid=RU:ru'],
];
const COUNTRIES = ['Франция', 'США', 'Россия', 'Украина', 'Германия', 'Великобритания', 'Китай', 'Япония', 'Индия', 'Турция', 'Израиль', 'Иран', 'Италия', 'Испания', 'Польша', 'Бразилия', 'Канада', 'Австралия', 'Южная Корея', 'Саудовская Аравия', 'Египет', 'Мексика', 'Аргентина', 'Казахстан', 'Беларусь', 'ЮАР', 'Нигерия'];

// ===== ИСТОЧНИКИ: добавляй свои строки. every = пауза опроса в секундах =====
const S = [
  // Новости мира (RSS): [страна/регион, название, ссылка]
  ...NEWS.map(([reg, name, url]) => ({ t: 'rss', cat: 'news', reg, name, url, every: 45 })),
  // Новости по странам на русском (Google News: поиск по стране за 12 часов)
  ...COUNTRIES.map(c => ({ t: 'rss', cat: 'news', reg: c, name: 'Google News · ' + c, url: gn(c, 'ru', 'RU'), every: 60 })),
  // Крипто-СМИ и поиски по анонсам монет (cat=crypto: показываются только как «Анонсы монет», если заголовок про запуск монеты/токена)
  ...[['Cointelegraph', 'https://cointelegraph.com/rss'], ['CoinDesk', 'https://www.coindesk.com/arc/outboundfeeds/rss/'], ['Decrypt', 'https://decrypt.co/feed'], ['The Block', 'https://www.theblock.co/rss.xml'],
    ['CryptoSlate', 'https://cryptoslate.com/feed/'], ['BeInCrypto', 'https://beincrypto.com/feed/'], ['Bitcoinist', 'https://bitcoinist.com/feed/'], ['U.Today', 'https://u.today/rss'], ['CoinGape', 'https://coingape.com/feed/'],
    ['Blockworks', 'https://blockworks.co/feed'], ['NewsBTC', 'https://www.newsbtc.com/feed/'], ['CryptoPotato', 'https://cryptopotato.com/feed/'], ['Cointelegraph RU', 'https://ru.cointelegraph.com/rss'],
    ['ForkLog', 'https://forklog.com/feed'], ['Bits.media', 'https://bits.media/rss/'], ['Incrypted', 'https://incrypted.com/feed/']]
    .map(([name, url]) => ({ t: 'rss', cat: 'crypto', name, url, every: 30 })),
  ...[['celebrity memecoin launch', 'en', 'US'], ['launches memecoin', 'en', 'US'], ['announces own token launch', 'en', 'US'], ['launches own cryptocurrency', 'en', 'US'], ['Trump memecoin token', 'en', 'US'],
    ['Elon Musk coin token', 'en', 'US'], ['rapper launches crypto token', 'en', 'US'], ['athlete footballer launches token memecoin', 'en', 'US'], ['streamer influencer memecoin', 'en', 'US'], ['politician launches memecoin', 'en', 'US'],
    ['выпустил мемкоин', 'ru', 'RU'], ['запускает мемкоин', 'ru', 'RU'], ['выпустил свою криптовалюту', 'ru', 'RU'], ['анонсировал токен', 'ru', 'RU'], ['знаменитость запустила мемкоин', 'ru', 'RU']]
    .map(([q, l, g]) => ({ t: 'rss', cat: 'crypto', name: 'Google News · ' + q, url: gn(q, l, g), every: 60 })),
  // Ещё источники анонсов: Mastodon-теги, Reddit-крипто, поиски про предстоящие запуски (cat=crypto)
  ...['memecoin', 'memecoins', 'solana', 'pumpfun', 'crypto'].map(t => ({ t: 'masto', cat: 'crypto', name: 'Mastodon #' + t, url: `https://mastodon.social/api/v1/timelines/tag/${t}?limit=40`, every: 45 })),
  ...['CryptoMoonShots', 'SolanaMemeCoins', 'solana', 'memecoins'].map(r => ({ t: 'reddit', cat: 'crypto', name: 'r/' + r, url: `https://www.reddit.com/r/${r}/new.json?limit=25`, every: 60 })),
  ...[['upcoming memecoin launch', 'en', 'US'], ['memecoin launching today', 'en', 'US'], ['stealth launch solana token', 'en', 'US'], ['token launch tomorrow memecoin', 'en', 'US'], ['memecoin presale', 'en', 'US'],
    ['скоро запуск мемкоин', 'ru', 'RU'], ['предстоящий запуск токена', 'ru', 'RU'], ['запуск мемкоина сегодня', 'ru', 'RU']]
    .map(([q, l, g]) => ({ t: 'rss', cat: 'crypto', name: 'Google News · ' + q, url: gn(q, l, g), every: 60 })),
  // Другие соцсети и поисковики (публичные интерфейсы без ключей; недоступные пропускаются)
  ...['memecoin', 'meme coin launch', 'token launch solana', 'pump.fun'].map(q => ({ t: 'hn', cat: 'crypto', name: 'Hacker News · ' + q, url: `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=30`, every: 120 })),
  ...['lemmy.world', 'lemmy.ml'].flatMap(h => ['memecoin', 'solana token launch', 'airdrop'].map(q => ({ t: 'lemmy', cat: 'crypto', name: `Lemmy ${h} · ${q}`, url: `https://${h}/api/v3/search?q=${encodeURIComponent(q)}&type_=Posts&sort=New&limit=30`, every: 90 }))),
  ...['memecoin', 'solana memecoin', 'token launch'].map(q => ({ t: 'bsky', cat: 'crypto', name: 'Bluesky · ' + q, url: `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(q)}&sort=latest&limit=40`, every: 60 })),
  ...['memecoin launch', 'memecoin announced', 'celebrity memecoin', 'upcoming memecoin launch', 'meme coin presale'].flatMap(q => [
    { t: 'rss', cat: 'crypto', name: 'Bing News · ' + q, url: `https://www.bing.com/news/search?q=${encodeURIComponent(q)}&format=rss`, every: 90 },
    { t: 'rss', cat: 'crypto', name: 'Yahoo News · ' + q, url: `https://news.search.yahoo.com/rss?p=${encodeURIComponent(q)}`, every: 90 }]),
  ...['memecoin', 'meme-coin', 'solana', 'crypto-airdrop'].map(t => ({ t: 'rss', cat: 'crypto', name: 'Medium #' + t, url: `https://medium.com/feed/tag/${t}`, every: 120 })),
  ...['mastodon.online', 'mstdn.social'].flatMap(h => ['memecoin', 'solana', 'airdrop'].map(t => ({ t: 'masto', cat: 'crypto', name: `Mastodon ${h} #${t}`, url: `https://${h}/api/v1/timelines/tag/${t}?limit=40`, every: 60 }))),
  // Telegram-каналы (публичные, через t.me/s/). Добавляй любые username.
  ...[['rian_ru', 'news'], ['tass_agency', 'news'], ['bbcrussian', 'news'], ['meduzalive', 'news'], ['rbc_news', 'news'], ['breakingmash', 'news'], ['readovkanews', 'news'], ['Cbpub', 'news'], ['nexta_live', 'news'], ['svtvnews', 'news'], ['lentadnya', 'news']]
    .map(([u, cat]) => ({ t: 'tg', cat, reg: cat == 'news' ? 'Telegram' : undefined, name: 'TG @' + u, url: 'https://t.me/s/' + u, every: 20 })),
  // Мемы
  ...['memes', 'dankmemes', 'funny', 'me_irl', 'ProgrammerHumor', 'Pikabu', 'KGBTR'].map(r => ({ t: 'reddit', cat: 'memes', name: 'r/' + r, url: `https://www.reddit.com/r/${r}/hot.json?limit=25`, every: 45 })),
  ...['mudak', 'dvachannel', 'lentachold'].map(u => ({ t: 'tg', cat: 'memes', name: 'TG @' + u, url: 'https://t.me/s/' + u, every: 30 })),
  { t: 'rss', cat: 'memes', name: 'Know Your Meme', url: 'https://knowyourmeme.com/newsfeed.rss', every: 120 },
  { t: 'masto', cat: 'trends', name: 'Mastodon', url: 'https://mastodon.social/api/v1/trends/statuses?limit=40', every: 120 },
  // Тренды
  { t: 'rss', cat: 'trends', name: 'Google Trends RU', url: 'https://trends.google.com/trending/rss?geo=RU', every: 120 },
  { t: 'rss', cat: 'trends', name: 'Google Trends US', url: 'https://trends.google.com/trending/rss?geo=US', every: 120 },
  { t: 'rss', cat: 'trends', name: 'Hacker News', url: 'https://hnrss.org/frontpage', every: 60 },
  ...['popular', 'all'].map(r => ({ t: 'reddit', cat: 'trends', name: 'Reddit ' + r, url: `https://www.reddit.com/r/${r}/rising.json?limit=25`, every: 45 })),
  { t: 'tiktok', cat: 'trends', name: 'TikTok', every: Math.ceil(86400 / 45) }, // ~45 запросов/сутки из лимита 50
  // Персоны: что говорят и показывают
  ...[['Илон Маск', 'Elon Musk'], ['Трамп', 'Donald Trump'], ['Путин', 'Putin'], ['Зеленский', 'Zelensky'], ['Байден', 'Biden'], ['Марк Цукерберг', 'Zuckerberg'], ['Сэм Альтман', 'Sam Altman'], ['Дуров', 'Pavel Durov'], ['Си Цзиньпин', 'Xi Jinping'], ['Макрон', 'Macron'], ['Месси', 'Messi'], ['Роналду', 'Ronaldo'], ['Тейлор Свифт', 'Taylor Swift'], ['MrBeast', 'MrBeast'], ['Джефф Безос', 'Jeff Bezos'], ['Тим Кук', 'Tim Cook']]
    .flatMap(([p, q]) => [{ t: 'rss', cat: 'people', person: p, name: 'GNews RU', url: gn(q), every: 40 }, { t: 'rss', cat: 'people', person: p, name: 'GNews EN', url: gn(q, 'en', 'US'), every: 40 }]),
  ...[['Илон Маск', 'elonmusk'], ['Трамп', 'realDonaldTrump']].map(([p, u]) => ({ t: 'rssx', cat: 'people', person: p, name: 'X @' + u, bases: NITTER, path: `/${u}/rss`, every: 60 })),
];
// ===== Парсеры =====
const tag = (s, t) => { const m = s.match(new RegExp('<' + t + '[^>]*>([\\s\\S]*?)</' + t + '>', 'i')); return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : ''; };
const dec = s => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const rss = x => (x.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) || []).map(b => ({
  title: dec(tag(b, 'title')),
  link: (tag(b, 'link') || (b.match(/<link[^>]*href="([^"]+)"/i) || [])[1] || '').trim(),
  ts: Date.parse(tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated') || tag(b, 'dc:date')),
  img: (b.match(/<(?:media:content|media:thumbnail|enclosure)[^>]*url="([^"]+)"/i) || [])[1],
}));
const get = async (url, opt = {}) => { const r = await fetch(url, { headers: { 'user-agent': UA, ...opt.headers }, signal: AbortSignal.timeout(15000) }); if (!r.ok) throw new Error(r.status); return r; };

async function fetchSrc(s) {
  if (s.t === 'rss') return rss(await (await get(s.url)).text());
  if (s.t === 'tg') {
    const h = await (await get(s.url)).text();
    return h.split('tgme_widget_message_wrap').slice(1).map(b => {
      const post = (b.match(/data-post="([^"]+)"/) || [])[1], txt = (b.match(/tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/) || [])[1];
      const img = (b.match(/background-image:url\('([^']+)'\)/) || [])[1];
      if (!post || !(txt || img)) return null;
      const title = dec(txt || 'Фото/видео').slice(0, s.cat === 'crypto' ? 700 : 280), ts = Date.parse((b.match(/<time[^>]*datetime="([^"]+)"/) || [])[1]);
      // авто-поиск новых каналов: пост про предстоящий запуск/анонс монеты со ссылкой на другой канал -> начинаем следить за ним
      const intent = sig.upcomingInfo(title, ts, { trusted: s.cat === 'crypto' }) || sig.launchInfo(title);
      if (intent) for (const m of b.matchAll(/href="https?:\/\/t\.me\/([A-Za-z][A-Za-z0-9_]{4,31})(?=["\/?])/g)) { const u = m[1]; if (!/^(joinchat|addstickers|proxy|share|iv|boost)$/i.test(u) && u.toLowerCase() !== s.url.split('/').pop().toLowerCase()) db.disc[u] = Date.now(); }
      return { title, link: 'https://t.me/' + post, ts, img };
    }).filter(Boolean);
  }
  if (s.t === 'hn') { const j = await (await get(s.url)).json(); return (j.hits || []).map(h => ({ title: h.title || h.story_title, link: h.url || 'https://news.ycombinator.com/item?id=' + h.objectID, ts: h.created_at_i * 1000, hot: h.points })).filter(x => x.title); }
  if (s.t === 'lemmy') { const j = await (await get(s.url)).json(); return (j.posts || []).map(p => ({ title: p.post.name, link: p.post.ap_id, ts: Date.parse(/Z|[+-]\d\d:?\d\d$/.test(p.post.published) ? p.post.published : p.post.published + 'Z'), hot: p.counts && p.counts.score })); }
  if (s.t === 'bsky') { const j = await (await get(s.url)).json(); return (j.posts || []).map(p => ({ title: ((p.record && p.record.text) || '').slice(0, 700), link: 'https://bsky.app/profile/' + p.author.handle + '/post/' + p.uri.split('/').pop(), ts: Date.parse((p.record && p.record.createdAt) || p.indexedAt), hot: p.likeCount })).filter(x => x.title); }
  if (s.t === 'rssx') { for (const b of s.bases) { try { const r = rss(await (await get(b + s.path)).text()); if (r.length) return r; } catch {} } throw new Error('все зеркала недоступны'); }
  if (s.t === 'reddit') {
    try {
      const j = await (await get(s.url)).json();
      return j.data.children.map(c => c.data).map(d => ({ title: d.title, link: 'https://www.reddit.com' + d.permalink, ts: d.created_utc * 1000, hot: d.score,
        img: /\.(jpe?g|png|gif|webp)$/i.test(d.url) ? d.url : (d.preview?.images?.[0]?.source?.url || '').replace(/&amp;/g, '&') || undefined }));
    } catch (e) { return rss(await (await get(s.url.replace('.json?limit=25', '/.rss'))).text()); } // GitHub иногда блокируют для .json
  }
  if (s.t === 'masto') {
    const j = await (await get(s.url)).json();
    return j.map(v => ({ title: dec(v.content).slice(0, 280) || 'Пост', link: v.url, ts: Date.parse(v.created_at), hot: v.favourites_count + v.reblogs_count, img: v.media_attachments?.[0]?.preview_url }));
  }
  if (s.t === 'tiktok') { // подстрой под свой API: TIKTOK_URL + TIKTOK_KEY. Ответ ожидается как массив видео.
    if (!E.TIKTOK_URL) return [];
    const day = new Date().toISOString().slice(0, 10); tt.d !== day && (tt.d = day, tt.n = 0);
    if (tt.n >= 48) return []; tt.n++;
    const j = await (await get(E.TIKTOK_URL, { headers: { authorization: 'Bearer ' + (E.TIKTOK_KEY || ''), 'x-api-key': E.TIKTOK_KEY || '' } })).json();
    return (j.data?.videos || j.data || j.videos || j.items || []).map(v => ({ title: v.title || v.desc || v.description || 'TikTok', link: v.share_url || v.url || v.link, ts: (v.create_time || v.created_at) * 1000 || Date.now(), hot: v.play_count || v.views, img: v.cover || v.thumbnail }));
  }
  return [];
}
const tt = { d: '', n: 0 };


// ===== Мемкоин-сигналы: оценка (signals.js) + проверка DexScreener + алерты =====
const sig = require('./signals.js');
const cfg = (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8')); } catch { return {}; } })();
const SIG_MIN = +(E.SIGNAL_MIN || cfg.signalMin || 60), SIG_CHAT = E.SIGNAL_CHAT_ID || cfg.signalChat || '';
const money = n => n >= 1e6 ? '$' + (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? '$' + Math.round(n / 1e3) + 'k' : '$' + Math.round(n);
const coinOf = (p, now) => ({ name: p.baseToken?.name, symbol: p.baseToken?.symbol, mcap: p.marketCap || p.fdv || 0, liq: p.liquidity?.usd || 0, ageMin: Math.round((now - p.pairCreatedAt) / 60000), created: p.pairCreatedAt, url: p.url });
async function dexJson(url) { const r = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(8000) }); if (!r.ok) throw new Error(r.status); return r.json(); }
async function dexByCA(ca) { let j; try { j = await dexJson('https://api.dexscreener.com/tokens/v1/solana/' + ca); } catch { j = await dexJson('https://api.dexscreener.com/latest/dex/tokens/' + ca); } const now = Date.now(); return (Array.isArray(j) ? j : j.pairs || []).filter(p => p.chainId === 'solana' && p.pairCreatedAt).map(p => coinOf(p, now)).sort((a, b) => b.liq - a.liq).slice(0, 1); }
async function dexByPair(pair) { const j = await dexJson('https://api.dexscreener.com/latest/dex/pairs/solana/' + pair), now = Date.now(); return (j.pairs || []).filter(p => p.pairCreatedAt).map(p => coinOf(p, now)).slice(0, 1); }
async function dexSearch(term) { // монеты на Solana за последние 48ч, в названии/тикере которых есть слово
  const r = await fetch('https://api.dexscreener.com/latest/dex/search?q=' + encodeURIComponent(term), { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(r.status);
  const j = await r.json(), now = Date.now();
  return (j.pairs || []).filter(p => p.chainId === 'solana' && p.pairCreatedAt && now - p.pairCreatedAt < 48 * 3600e3 && ((p.baseToken?.name || '') + ' ' + (p.baseToken?.symbol || '')).toLowerCase().includes(term))
    .map(p => coinOf(p, now));
}
async function enrichDex(signals) {
  const now = Date.now(), top = signals.slice(0, 15), want = [...new Set(top.flatMap(s => s.tokens))];
  const stale = want.filter(t => !db.dex[t] || now - db.dex[t].t > 10 * 60e3).slice(0, 8);
  await Promise.all(stale.map(async t => { try { db.dex[t] = { t: now, r: await dexSearch(t) }; } catch (e) { console.log('dex', t, e.message); } }));
  for (const s of top) {
    const ok = s.tokens.filter(t => db.dex[t]); if (!ok.length) continue;
    const coins = [...new Map(ok.flatMap(t => db.dex[t].r).map(c => [c.url, c])).values()].sort((a, b) => b.mcap - a.mcap);
    s.dex = { n: coins.length, best: coins[0] || null };
    if (!coins.length) { s.reasons.push({ why: 'Монет по теме на Solana ещё нет — можно быть первым', pts: 6 }); s.score = Math.min(100, s.score + 6); }
    else if (coins[0].mcap >= 1e6) { s.reasons.push({ why: 'Уже запампили (' + money(coins[0].mcap) + ')', pts: -10 }); s.score = Math.max(0, s.score - 10); }
  }
  signals.sort((a, b) => b.score - a.score || b.ts - a.ts);
}
async function refreshMetas() { // горячие нарративы DexScreener (какие секторы мемкоинов растут)
  if (Date.now() - (db.metasT || 0) < 110e3) return; db.metasT = Date.now();
  try { const j = await (await get('https://api.dexscreener.com/metas/trending/v1')).json();
    db.metas = (Array.isArray(j) ? j : []).slice(0, 10).map(m => ({ name: m.name, slug: m.slug, mcap: m.marketCap, tokens: m.tokenCount, h1: m.marketCapChange?.h1, h6: m.marketCapChange?.h6, h24: m.marketCapChange?.h24 })); }
  catch (e) { console.log('metas', e.message); }
}
async function tgSend(chat, text) {
  const r = await fetch(`https://api.telegram.org/bot${E.BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: chat, text }) }).then(r => r.json());
  if (!r.ok) throw new Error(r.description);
}
async function alertSignals(signals) {
  if (first || !SIG_CHAT || !E.BOT_TOKEN) return;
  let sent = 0;
  for (const s of signals) {
    if (s.score < SIG_MIN || s.heavy || sent >= 3 || (s.launch && s.launch.vip)) continue;
    const key = s.topic || s.id; if (db.alertedT[key]) continue;
    const d = s.dex, dl = !d ? '' : !d.n ? '\n🟢 Монет по теме на Solana за 48ч нет — можно быть первым' : `\n${d.best.mcap >= 1e6 ? '🔴' : '🟡'} Уже есть ${d.n}: ${d.best.symbol} ${money(d.best.mcap)}, ${d.best.ageMin} мин назад`;
    const txt = `🚨 Сигнал ${s.score}/100${s.topic ? ' · ' + s.topic : ''}\n${s.title}\n\nПочему: ${s.reasons.filter(r => r.pts > 0).map(r => r.why).join(' · ')}${dl}\n${s.link}${s.tokens[0] ? '\nПоиск: https://dexscreener.com/search?q=' + s.tokens[0] : ''}`;
    try { await tgSend(SIG_CHAT, txt); db.alertedT[key] = Date.now(); sent++; } catch (e) { console.log('signal alert:', e.message); }
  }
}

async function enrichLaunch(launches) { // тикеры вида $XYZ из заголовка -> есть ли уже такая монета на Solana
  const now = Date.now(), top = launches.slice(0, 20);
  top.forEach(l => { l.lt = [...new Set([...l.title.matchAll(/\$([A-Za-z]{2,10})\b/g)].map(m => m[1].toLowerCase()))].slice(0, 2); });
  const stale = [...new Set(top.flatMap(l => l.lt))].filter(t => !db.dex[t] || now - db.dex[t].t > 10 * 60e3).slice(0, 6);
  await Promise.all(stale.map(async t => { try { db.dex[t] = { t: now, r: await dexSearch(t) }; } catch (e) { console.log('dex', t, e.message); } }));
  for (const l of top) {
    const ok = l.lt.filter(t => db.dex[t]); if (!ok.length) continue;
    const coins = [...new Map(ok.flatMap(t => db.dex[t].r).map(c => [c.url, c])).values()].sort((a, b) => b.mcap - a.mcap);
    l.dex = { n: coins.length, best: coins[0] || null };
  }
}
async function alertLaunches(launches) { // отдельный алерт: анонсы известных персон
  if (first || !SIG_CHAT || !E.BOT_TOKEN) return;
  let sent = 0;
  for (const l of launches) {
    if (!l.launch.vip || sent >= 3) continue;
    const key = 'L:' + (l.lt && l.lt[0] || l.topic || l.id); if (db.alertedT[key]) continue;
    const kind = { announce: 'заявил о запуске', done: 'уже выпустил', rumor: 'слухи о запуске' }[l.launch.k];
    const d = l.dex, dl = !d ? '' : !d.n ? '\n🟢 Такой монеты на Solana за 48ч ещё нет' : `\n${d.best.mcap >= 1e6 ? '🔴' : '🟡'} Уже есть ${d.n}: ${d.best.symbol} ${money(d.best.mcap)}, ${d.best.ageMin} мин назад`;
    try { await tgSend(SIG_CHAT, `📢 Анонс монеты ⭐ (${kind})\n${l.title}${dl}\n${l.link}`); db.alertedT[key] = Date.now(); sent++; } catch (e) { console.log('launch alert:', e.message); }
  }
}

async function enrichUp(ups) { // вышла ли уже монета: по CA / паре / тикеру (DexScreener)
  const now = Date.now(), top = ups.slice(0, 15), jobs = [];
  for (const u of top) { const up = u.up;
    if (up.ca) jobs.push(['ca:' + up.ca, 180e3, () => dexByCA(up.ca)]); else if (up.pair) jobs.push(['pair:' + up.pair, 180e3, () => dexByPair(up.pair)]);
    else up.tickers.slice(0, 2).forEach(t => jobs.push([t, 600e3, () => dexSearch(t)])); }
  const stale = [...new Map(jobs.filter(([k, ttl]) => !db.dex[k] || now - db.dex[k].t > ttl).map(j => [j[0], j])).values()].slice(0, 8);
  await Promise.all(stale.map(async ([k, , f]) => { try { db.dex[k] = { t: now, r: await f() }; } catch (e) { console.log('dex', k.slice(0, 14), e.message); } }));
  for (const u of top) { const up = u.up, keys = up.ca ? ['ca:' + up.ca] : up.pair ? ['pair:' + up.pair] : up.tickers.slice(0, 2);
    if (!keys.some(k => db.dex[k])) continue;
    const coins = [...new Map(keys.filter(k => db.dex[k]).flatMap(k => db.dex[k].r).map(c => [c.url, c])).values()].sort((a, b) => b.mcap - a.mcap);
    u.dex = { n: coins.length, best: coins[0] || null }; }
}
async function alertUp(ups) {
  if (first || !SIG_CHAT || !E.BOT_TOKEN) return; let sent = 0;
  for (const u of ups) { const up = u.up;
    if (sent >= 5 || !(up.tickers.length || up.ca || up.pair || up.eta || /^TG @/.test(u.src))) continue;
    const key = 'U:' + up.k + ':' + (up.ca || up.pair || up.tickers[0] || u.id); if (db.alertedT[key]) continue;
    const eta = up.eta ? (up.eta > Date.now() ? 'через ~' + Math.max(1, Math.round((up.eta - Date.now()) / 60000)) + ' мин' : 'время запуска уже наступило') : '';
    const dl = u.dex && u.dex.best ? `\n🟢 Уже вышла: ${u.dex.best.symbol} ${money(u.dex.best.mcap)}, ${u.dex.best.ageMin} мин назад` : '';
    const txt = `${up.k === 'live' ? '🟢 Монета вышла' : '⏳ Предстоящий запуск'}${eta ? ' · ' + eta : ''}\n${u.title.slice(0, 400)}${up.tickers.length ? '\nТикер: ' + up.tickers.map(t => '$' + t.toUpperCase()).join(' ') : ''}${up.ca ? '\nCA: ' + up.ca : ''}${dl}\nИсточник: ${u.src}\n${u.link}`;
    try { await tgSend(SIG_CHAT, txt); db.alertedT[key] = Date.now(); sent++; } catch (e) { console.log('up alert:', e.message); } }
}

// ===== Сборка =====
const OUT = path.join(__dirname, 'data', 'items.json');
let db = { items: [], posted: [], last: {}, dex: {}, alertedT: {}, metas: [], metasT: 0, disc: {} };
try { db = { ...db, ...JSON.parse(fs.readFileSync(OUT, 'utf8')) }; } catch {}
const map = new Map(db.items.map(i => [i.id, i])), fresh = [], first = map.size === 0;
// Крипто-каналы Telegram: из config.json (tgChannels) + найденные автоматически по ссылкам в постах
const watch = new Set([...(cfg.tgChannels || []), ...Object.entries(db.disc || {}).filter(([, t]) => Date.now() - t < 3 * 86400e3).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([u]) => u)].map(u => String(u).replace(/^@|^https?:\/\/t\.me\/(s\/)?/i, '')));
S.forEach(x => { if (x.t === 'tg') watch.delete(x.url.split('/').pop()); });
watch.forEach(u => S.push({ t: 'tg', cat: 'crypto', name: 'TG @' + u, url: 'https://t.me/s/' + u, every: 30 }));
(cfg.rss || []).forEach(([name, url]) => name && url && S.push({ t: 'rss', cat: 'crypto', name, url, every: 45 }));              // любые твои RSS/Atom ленты
(cfg.xAccounts || []).forEach(u => S.push({ t: 'rssx', cat: 'crypto', name: 'X @' + String(u).replace(/^@/, ''), bases: NITTER, path: `/${String(u).replace(/^@/, '')}/rss`, every: 60 })); // X-аккаунты через зеркала Nitter (если живы)
const tkey = t => t.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').slice(0, 50), tkeys = new Set(db.items.map(i => tkey(i.title)));
async function tgPost(it) {
  if (!E.BOT_TOKEN || !E.CHANNEL_ID) throw new Error('BOT_TOKEN / CHANNEL_ID не заданы в Secrets');
  const text = `${it.person ? '👤 ' + it.person + '\n' : ''}${it.title}\n\n${it.link}`;
  const call = (m, b) => fetch(`https://api.telegram.org/bot${E.BOT_TOKEN}/${m}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json());
  let r = it.img && it.cat === 'memes' ? await call('sendPhoto', { chat_id: E.CHANNEL_ID, photo: it.img, caption: text.slice(0, 1000) }) : { ok: false };
  if (!r.ok) r = await call('sendMessage', { chat_id: E.CHANNEL_ID, text });
  if (!r.ok) throw new Error(r.description);
}
function add(s, x) {
  if (!x.title || !x.link || !x.ts || isNaN(x.ts) || x.ts > Date.now() + 6e4) return;
  if (Date.now() - x.ts > MAX_AGE) { const u = sig.upcomingInfo(x.title, x.ts, { trusted: s.cat === 'crypto' && s.t === 'tg' }); if (!(u && u.k === 'soon' && Date.now() - x.ts < UP_AGE)) return; } // анонсы на «понедельник/субботу» храним дольше 12 ч
  if (s.t !== 'tg' && /t\.me\//i.test(x.title) && (sig.upcomingInfo(x.title, x.ts) || sig.launchInfo(x.title))) for (const m of x.title.matchAll(/t\.me\/([A-Za-z][A-Za-z0-9_]{4,31})\b/g)) if (!/^(joinchat|addstickers|proxy|share|iv|boost|s)$/i.test(m[1])) db.disc[m[1]] = Date.now();
  const id = crypto.createHash('sha1').update(x.link + (s.person || '')).digest('hex').slice(0, 12);
  if (map.has(id)) { if (x.hot) map.get(id).hot = x.hot; return; }
  if (['news', 'trends'].includes(s.cat)) { const k = tkey(x.title); if (tkeys.has(k)) return; tkeys.add(k); }
  const it = { id, title: x.title.slice(0, s.cat === 'crypto' ? 700 : 300), link: x.link, ts: x.ts, img: x.img, hot: x.hot, cat: s.cat, src: s.name, person: s.person, reg: s.reg };
  map.set(id, it); fresh.push(it);
}
(async () => {
  if (process.argv[2] === 'post') {
    const it = map.get(process.argv[3]); if (!it) { console.log('запись уже устарела'); process.exit(1); }
    await tgPost(it); console.log('отправлено:', it.title); return;
  }
  const now = Date.now();
  await Promise.all(S.filter(s => now - (db.last[s.t + s.name + (s.url || s.region)] || 0) >= s.every * 1000 - 5000).map(async s => {
    db.last[s.t + s.name + (s.url || s.region)] = now;
    try { (await fetchSrc(s)).forEach(x => add(s, x)); } catch (e) { console.log('x', s.name, e.message); }
  }));
  if (E.AUTO_POST === '1' && !first) {
    const cats = (E.AUTO_CATS || 'news').split(',');
    for (const it of fresh.filter(i => cats.includes(i.cat)).slice(0, 5)) { try { await tgPost(it); db.posted.push(it.id); } catch (e) { console.log('post:', e.message); } }
  }
  for (const i of map.values()) { i.launch = sig.launchInfo(i.title) || undefined; i.up = sig.upcomingInfo(i.title, i.ts, { trusted: i.cat === 'crypto' && /^TG @/.test(i.src) }) || undefined; }
  const keep = i => Date.now() - i.ts < MAX_AGE || (i.up && i.up.k === 'soon' && Date.now() - i.ts < UP_AGE && !(i.up.eta && Date.now() - i.up.eta > 6 * 3600e3));
  const list = [...map.values()].filter(i => keep(i) && (i.cat !== 'crypto' || i.launch || i.up)).sort((a, b) => b.ts - a.ts).slice(0, 1500);
  const ids = new Set(list.map(i => i.id));
  let signals = [], launches = [], upcoming = [];
  try {
    signals = sig.score(list, Date.now(), { min: 30 });
    await Promise.all([enrichDex(signals), refreshMetas()]);
    await alertSignals(signals);
    launches = sig.score(list.filter(i => i.launch), Date.now(), { min: 0 }).sort((a, b) => b.ts - a.ts);
    await enrichLaunch(launches);
    await alertLaunches(launches);
    upcoming = sig.score(list.filter(i => i.up), Date.now(), { min: 0 }).sort((a, b) => b.ts - a.ts);
    const soonT = new Set(upcoming.filter(u => u.up.k === 'soon').flatMap(u => u.up.tickers)), liveOK = new Set((cfg.tgLive || ['nietzscheandev']).map(x => 'TG @' + x));
    upcoming = upcoming.filter(u => u.up.k === 'soon' || u.up.tickers.some(t => soonT.has(t)) || liveOK.has(u.src)); // «вышла» только если ранее был анонс этой монеты
    await enrichUp(upcoming);
    await alertUp(upcoming);
  } catch (e) { console.log('signals:', e.message); }
  const nowT = Date.now();
  Object.keys(db.dex).forEach(k => nowT - db.dex[k].t > 3600e3 && delete db.dex[k]);
  Object.keys(db.disc).forEach(k => nowT - db.disc[k] > 3 * 86400e3 && delete db.disc[k]);
  Object.keys(db.alertedT).forEach(k => nowT - db.alertedT[k] > MAX_AGE && delete db.alertedT[k]);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ updated: Date.now(), items: list, signals: signals.slice(0, 60), launches: launches.slice(0, 80), upcoming: upcoming.slice(0, 150), disc: db.disc, metas: db.metas, posted: db.posted.filter(i => ids.has(i)), last: db.last, dex: db.dex, alertedT: db.alertedT, metasT: db.metasT }));
  console.log(`новых: ${fresh.length}, всего: ${list.length}, сигналов: ${signals.length}, анонсов: ${launches.length}, предстоящих: ${upcoming.length}, каналов: ${watch.size}`);
})();
