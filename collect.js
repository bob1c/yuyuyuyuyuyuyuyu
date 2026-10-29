// PULSE (GitHub-режим): один проход по источникам -> data/items.json. Запускается GitHub Actions.
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
try { fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n').forEach(l => { const m = l.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*?)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; }); } catch {}
const E = process.env, PORT = E.PORT || 3000, MAX_AGE = 12 * 3600e3;
const UA = 'Mozilla/5.0 (compatible; PulseBot/1.0)';
const gn = (q, lang = 'ru', gl = 'RU') => `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:12h')}&hl=${lang}&gl=${gl}&ceid=${gl}:${lang}`;

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
  ...[['Илон Маск', 'elonmusk'], ['Трамп', 'realDonaldTrump']].map(([p, u]) => ({ t: 'rss', cat: 'people', person: p, name: 'X @' + u, url: `https://nitter.net/${u}/rss`, every: 60 })),
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
      return post && (txt || img) ? { title: dec(txt || 'Фото/видео').slice(0, 280), link: 'https://t.me/' + post, ts: Date.parse((b.match(/<time[^>]*datetime="([^"]+)"/) || [])[1]), img } : null;
    }).filter(Boolean);
  }
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


// ===== Сборка =====
const OUT = path.join(__dirname, 'data', 'items.json');
let db = { items: [], posted: [], last: {} };
try { db = { ...db, ...JSON.parse(fs.readFileSync(OUT, 'utf8')) }; } catch {}
const map = new Map(db.items.map(i => [i.id, i])), fresh = [], first = map.size === 0;
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
  if (!x.title || !x.link || !x.ts || isNaN(x.ts) || Date.now() - x.ts > MAX_AGE || x.ts > Date.now() + 6e4) return;
  const id = crypto.createHash('sha1').update(x.link + (s.person || '')).digest('hex').slice(0, 12);
  if (map.has(id)) { if (x.hot) map.get(id).hot = x.hot; return; }
  if (['news', 'trends'].includes(s.cat)) { const k = tkey(x.title); if (tkeys.has(k)) return; tkeys.add(k); }
  const it = { id, title: x.title.slice(0, 300), link: x.link, ts: x.ts, img: x.img, hot: x.hot, cat: s.cat, src: s.name, person: s.person, reg: s.reg };
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
  const list = [...map.values()].filter(i => Date.now() - i.ts < MAX_AGE).sort((a, b) => b.ts - a.ts).slice(0, 1500);
  const ids = new Set(list.map(i => i.id));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ updated: Date.now(), items: list, posted: db.posted.filter(i => ids.has(i)), last: db.last }));
  console.log(`новых: ${fresh.length}, всего: ${list.length}`);
})();
