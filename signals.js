'use strict';
// PULSE · signals.js — оценка «мемкоин-потенциала» новостей/мемов/трендов.
// Правила построены по разбору реальных кейсов (ASTEROID, PENGUIN, GOAT, GHIBLI, CHILLGUY, PNUT):
//  1) кто-то громкий сказал/показал (Маск, Трамп, Белый дом, официальные аккаунты)
//  2) вирусная/абсурдная история с простым образом (животное, маскот, мем)
//  3) новый ИИ/робо/космос-«вау» тренд, который все обсуждают
//  4) тему подхватывают много источников одновременно (скорость распространения)
//  5) важна свежесть: рост идёт часы, потом копии и обвал
// Меняй списки и веса ниже под себя. Это эвристика, а не гарантия.

const L = '[\\p{L}\\p{N}]';
const exact = s => `(?<!${L})(?:${s})(?!${L})`;
const R = (pat, pts, why, flag, tk) => ({ re: new RegExp(exact(pat), 'iu'), reG: new RegExp(exact(pat), 'giu'), pts, why, flag, tk });

const RULES = [
  R("elon|musk|musk's|илон\\p{L}*|маск|маска|маску|маске|маском", 28, 'Илон Маск', 0, 1),
  R("spacex|tesla|starship|grok|xai|neuralink|dogecoin|doge|спейс\\p{L}*|тесл\\p{L}*|старшип|нейролинк", 12, 'Империя Маска', 0, 1),
  R("trump|trump's|trumps|трамп\\p{L}*|white house|белый дом\\p{L}*|белого дома|melania|мелани\\p{L}*", 24, 'Трамп / Белый дом', 0, 1),
  R("durov|дуров\\p{L}*|zuckerberg|цукерберг\\p{L}*|altman|альтман\\p{L}*|mrbeast|kanye|канье|snoop|binance|бинанс\\p{L}*|vitalik|виталик\\p{L}*|saylor|jensen huang|nvidia|kardashian|кардашьян\\p{L}*|taylor swift|тейлор свифт\\p{L}*", 12, 'Мега-персона'),
  R("viral|went viral|вирусн\\p{L}*|завирусил\\p{L}*|meme|memes|мем|мемы|мемов|мема|мему|мемом|trending|тренд\\p{L}*|challenge|челлендж\\p{L}*|tiktok|тикток\\p{L}*", 13, 'Вирусность / мем'),
  R("weird|strange|bizarre|absurd|hilarious|funny|странн\\p{L}*|нелепост\\p{L}*|абсурд\\p{L}*|курьез\\p{L}*|необычн\\p{L}*|смешн\\p{L}*|прикол\\p{L}*|wtf|lol", 8, 'Абсурд / смешное'),
  R("ai-generated|ai generated|deepfake|chatgpt|openai|sora|midjourney|ai agent|ai agents|robot|robots|humanoid|нейросет\\p{L}*|дипфейк\\p{L}*|робот\\p{L}*|гуманоид\\p{L}*|искусственн\\p{L}* интеллект\\p{L}*", 14, 'ИИ / роботы', 0, 2),
  R("ai influencer|virtual influencer|ai model|виртуальн\\p{L}* (?:блогер\\p{L}*|человек\\p{L}*|модел\\p{L}*|персонаж\\p{L}*)|ии-блогер\\p{L}*|нейроблогер\\p{L}*|аватар\\p{L}*", 16, 'ИИ-персонаж (как в кейсах)', 0, 2),
  R("flying car|flying cars|evtol|jetpack|hoverboard|летающ\\p{L}* машин\\p{L}*|летающ\\p{L}* авто\\p{L}*|летающ\\p{L}* автомобил\\p{L}*|взлетел\\p{L}*|взлетает|rocket|ракет\\p{L}*|first ever|впервые в истории", 12, 'Невероятная технология', 0, 2),
  R("ufo|uap|нло|alien|aliens|инопланет\\p{L}*|asteroid|астероид\\p{L}*|comet|комет\\p{L}*|mars|марс|марсе|марсу|moon|disclosure", 12, 'Космос / НЛО', 0, 3),
  R("dog|dogs|doggo|puppy|cat|cats|kitten|frog|frogs|penguin|penguins|capybara|hamster|monkey|monkeys|ape|apes|duck|ducks|shiba|bear|goat|hippo|hippopotamus|pigeon|raccoon|squirrel|snail|crab|turtle|owl|собак\\p{L}*|пес|пёс|псы|щенок|щенк\\p{L}*|кот|коты|кота|коту|кошк\\p{L}*|котик\\p{L}*|лягушк\\p{L}*|пингвин\\p{L}*|капибар\\p{L}*|хомяк\\p{L}*|обезьян\\p{L}*|утк\\p{L}*|утка|сиба|медвед\\p{L}*|козел|козёл|коза|бегемот\\p{L}*|голуб\\p{L}*|енот\\p{L}*|белк\\p{L}*|улитк\\p{L}*|краб\\p{L}*|черепах\\p{L}*|сова|совы", 14, 'Животное / маскот', 0, 3),
  R("meme ?coin|memecoin|memecoins|meme coins|мемкоин\\p{L}*|мем-коин\\p{L}*|pump\\.fun|solana|солан\\p{L}*|airdrop|аирдроп\\p{L}*|токен\\p{L}*|token|tokens|crypto|крипт\\p{L}*|bitcoin|биткоин\\p{L}*", 10, 'Крипто-контекст'),
  R("feud|spat|roast|trolled|trolls|responds|replied|reply|ссор\\p{L}*|скандал\\p{L}*|scandal|ответил\\p{L}*|ответила|разнес\\p{L}*|высмеял\\p{L}*", 6, 'Драма / ответ'),
  // штрафы
  R("killed|kills|dead|dies|died|death|deaths|убит\\p{L}*|погиб\\p{L}*|умер\\p{L}*|смерт\\p{L}*|теракт\\p{L}*|взрыв\\p{L}*|explosion|shooting|стрельб\\p{L}*|attack|attacks|атак\\p{L}*|обстрел\\p{L}*|earthquake|землетряс\\p{L}*|catastroph\\p{L}*|катастроф\\p{L}*|crash|авари\\p{L}*|пожар\\p{L}*|flood|наводнен\\p{L}*|victims|жертв\\p{L}*|hostage\\p{L}*|заложник\\p{L}*|massacre|бойн\\p{L}*|suicide|самоубийств\\p{L}*|cancer", -30, 'Тяжёлая тема', 'heavy'),
  R("ставк\\p{L}*|инфляц\\p{L}*|inflation|gdp|ввп|санкц\\p{L}*|sanctions?|парламент\\p{L}*|выбор\\p{L}*|election\\p{L}*|минфин\\p{L}*|центробанк\\p{L}*|цб рф|interest rates?|бюджет\\p{L}*|налог\\p{L}*|tax|taxes|court|суд|суда|суду|арест\\p{L}*|приговор\\p{L}*|ипотек\\p{L}*|нефт\\p{L}*|oil prices?", -12, 'Скучная политика/экономика'),
];


// ===== Анонсы монет: «запускает / выпустил / анонсировал» + «мемкоин / токен / коин» =====
const ACT = "launch(?:es|ed|ing)?|announc(?:e|es|ed|ing)|unveil(?:s|ed|ing)?|releas(?:e|es|ed|ing)|rolls? out|rolled out|drop(?:s|ped|ping)?|introduc(?:e|es|ed|ing)|teas(?:e|es|ed|ing)|debut(?:s|ed)?|mint(?:s|ed)?|issu(?:e|es|ed|ing)|creat(?:e|es|ed|ing)|plans? to (?:launch|release|issue)|set to launch|to launch|coming soon|выпуст(?:ил|ила|или|ит|ят|ить)\\p{L}*|выпускает|запуст(?:ил|ила|или|ит|ят|ить)\\p{L}*|запускает|запущен\\p{L}*|выпущен\\p{L}*|анонсир\\p{L}*|представил\\p{L}*|презентовал\\p{L}*|создал\\p{L}*|создаст|выйдет|собирается выпустить|планирует выпустить";
const OBJ_STRONG = "meme ?coins?|memecoins?|tokens?|\\$[A-Za-z]{2,10}|мемкоин\\p{L}*|мем-коин\\p{L}*|токен\\p{L}*|коин\\p{L}*|криптомонет\\p{L}*";
const OBJ_WEAK = "coins?|crypto(?:currency)?|cryptocurrenc(?:y|ies)|nfts?|криптовалют\\p{L}*|nft";
const reA = new RegExp(`(?<!${L})(?:${ACT})(?!${L})[^.!?\\n]{0,70}?(?<!${L})(?:${OBJ_STRONG}|${OBJ_WEAK})(?!${L})`, 'iu');
const reB = new RegExp(`(?<!${L})(?:${OBJ_STRONG}|${OBJ_WEAK})(?!${L})[^.!?\\n]{0,70}?(?<!${L})(?:${ACT})(?!${L})`, 'iu');
const reStrong = new RegExp(`(?<!${L})(?:${OBJ_STRONG})(?!${L})`, 'iu');
const NOISE = new RegExp(exact("etf|etfs|stablecoin|stable coin|cbdc|central bank|digital (?:euro|dollar|ruble|yuan)|цифров\\p{L}* (?:рубл\\p{L}*|евро|доллар\\p{L}*)|стейблкоин\\p{L}*|futures|фьючерс\\p{L}*"), 'iu');
const NOISE_SOFT = new RegExp(exact("trading|exchange|platform|wallet|custody|fund|funds|lending|staking|card|bank|service|feature|app|биржа|биржи|платформ\\p{L}*|кошел\\p{L}*"), 'iu');
const DONE = new RegExp(exact("launched|has launched|released|is live|now live|went live|minted|выпустил\\p{L}*|запустил\\p{L}*|уже выпущен\\p{L}*|вышел"), 'iu');
const RUMOR = new RegExp(exact("rumou?rs?|reportedly|allegedly|may|might|could|considering|teas(?:e|es|ed|ing)|слух\\p{L}*|возможно|якобы|рассматрива\\p{L}*|намекнул\\p{L}*"), 'iu');
const VIP = new RegExp(exact("celebrity|celebrities|rapper|singer|actor|actress|footballer|athlete|streamer|influencer|youtuber|president|prime minister|senator|congress\\p{L}*|king|prince|знаменитост\\p{L}*|рэпер\\p{L}*|певец|певица|актер|актёр|футболист\\p{L}*|блогер\\p{L}*|стример\\p{L}*|президент\\p{L}*|министр\\p{L}*|сенатор\\p{L}*"), 'iu');
const VIP_RULES = RULES.filter(r => ['Илон Маск', 'Империя Маска', 'Трамп / Белый дом', 'Мега-персона'].includes(r.why));
function launchInfo(title) {
  if (!(reA.test(title) || reB.test(title)) || NOISE.test(title)) return null;
  if (!reStrong.test(title) && NOISE_SOFT.test(title)) return null;
  const vip = VIP.test(title) || VIP_RULES.some(r => r.re.test(title));
  return { k: RUMOR.test(title) && !DONE.test(title) ? 'rumor' : DONE.test(title) ? 'done' : 'announce', vip };
}

// ===== Предстоящие запуски: «запуск через 2ч / сегодня в 15:00 UTC / в пятницу запустят» + CA/ссылки =====
const UP_L = new RegExp(exact("launch(?:es|ing)?|go(?:es|ing)? live|drop(?:s|ping)?|fair launch|stealth launch|starts?|starting|lfg|старт\\p{L}*|запуск\\p{L}*|запуст(?:ят|ится|им)|запускаетс\\p{L}*|запускаем|выйдет|выход\\p{L}*|релиз\\p{L}*|стелс\\p{L}*|презентаци\\p{L}*|листинг\\p{L}*"), 'iu');
const UP_F = new RegExp(exact("soon|today|tonight|tomorrow|upcoming|this week|next week|countdown|preparing|prepares|скоро|сегодня|завтра|готовит\\p{L}*|готовитс\\p{L}*|предстоящ\\p{L}*|ожидаетс\\p{L}*|на этой неделе|на следующей неделе|в (?:понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье)|через \\d+|in \\d+ ?(?:h|hr|hrs|hours?|min|minutes?|m)|at \\d{1,2}[:.]\\d{2}|\\d{1,2}[:.]\\d{2} ?(?:utc|gmt|msk|мск)"), 'iu');
const UP_C = new RegExp(exact("meme ?coins?|memecoins?|tokens?|coins?|contract|контракт\\p{L}*|токен\\p{L}*|мемкоин\\p{L}*|коин\\p{L}*|launchpad|solana|sol|pump(?:\\.fun)?|dex|presale|pre-sale|airdrop|аирдроп\\p{L}*|tge|ido|\\$[A-Za-z]{2,12}"), 'iu');
const LAUNCHISH = new RegExp(exact("launch\\p{L}*|live|запуск\\p{L}*|запущен\\p{L}*|вышл\\p{L}*|старт\\p{L}*|started|fair|стелс\\p{L}*"), 'iu');
const CA58 = /(?<![1-9A-HJ-NP-Za-km-z])[1-9A-HJ-NP-Za-km-z]{32,44}(?![1-9A-HJ-NP-Za-km-z])/g;
const TICK_STOP = new Set('CA DYOR NFA UTC GMT TGE LFG SOL PUMP DEX ATH MSK NEW THE AND FOR NOT ALL USD USDT BTC ETH NFT CEO API DAO IDO ICO TOKEN COIN LIVE SOON TODAY LAUNCH LAUNCHPAD ANNOUNCEMENT BREAKING ALERT MEME MEMECOIN SOLANA TELEGRAM OFFICIAL STREAM CLAIM WHITELIST PRESALE AIRDROP FREE CHANNEL JOIN LINK'.split(' '));
function tickersOf(t) {
  const a = [...t.matchAll(/\$([A-Za-z][A-Za-z0-9]{1,11})\b/g)].map(m => m[1]);
  const b = [...t.matchAll(/(?<![A-Za-z$])([A-Z]{4,12})(?![A-Za-z])/g)].map(m => m[1]).filter(w => !TICK_STOP.has(w));
  return [...new Set([...a, ...b].map(w => w.toLowerCase()))].slice(0, 3);
}
function etaFrom(text, ts) { // время запуска, если его можно понять из текста (относительно времени поста)
  let m = text.match(/\bin (\d+(?:\.\d+)?) ?(h|hr|hrs|hours?|min|minutes?|m)\b/i) || text.match(/через (\d+(?:[.,]\d+)?) ?(ч|час\p{L}*|мин\p{L}*)/iu);
  if (m) { const n = parseFloat(m[1].replace(',', '.')), u = m[2].toLowerCase(); return ts + n * (/^(h|ч)/.test(u) ? 3600e3 : 60e3); }
  m = text.match(/(\d{1,2})[:.](\d{2}) ?(utc|gmt|msk|мск)/i);
  if (m) { const d = new Date(ts); let t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), +m[1], +m[2]); if (/msk|мск/i.test(m[3])) t -= 3 * 3600e3; if (/завтра|tomorrow/i.test(text)) t += 86400e3; else if (t < ts - 3 * 3600e3) t += 86400e3; return t; }
  return null;
}

// --- расширение: любые анонсы будущих монет, даже без точного времени ---
const UP_STRONG = new RegExp(exact("will (?:be )?(?:launch|launched|released|release|drop|dropped|go live)|going to (?:launch|drop|release)|set to (?:launch|drop|release)|about to (?:launch|drop)|launching|launch date|pre-?launch|pre-?sale|white-?list(?:ed)?|stealth|countdown|coming soon|teaser|ilo|ido|tge|upcoming|скоро (?:выйдет|запуск\\p{L}*|релиз\\p{L}*|старт\\p{L}*)|запланирован\\p{L}*|назначен\\p{L}*|дата запуска|предстоящ\\p{L}*|пресейл\\p{L}*|вайтлист\\p{L}*|белый список|готовится запуск|ждите запуск|ждём запуск|анонс\\p{L}*|скоро"), 'iu');
const PAST = new RegExp(exact("launched|has launched|just launched|is live|now live|went live|вышла|вышел|вышли|запущен|запущена|запущены|уже запущен\\p{L}*|стартовал\\p{L}*"), 'iu');
const WHEN_EN = "today|tonight|tomorrow|this week|next week|this weekend|(?:next )?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|in \\d+ ?(?:days?|hours?|hrs?|h|minutes?|mins?)|\\d{1,2}[:.]\\d{2} ?(?:am|pm)?(?: ?(?:utc|gmt|msk|est|edt|pst|pdt|cet|et|pt))?|\\d{1,2} ?(?:am|pm)(?: ?(?:utc|gmt|est|pst|et|pt))?|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]* \\d{1,2}(?:st|nd|rd|th)?|\\d{1,2}(?:st|nd|rd|th)? (?:of )?(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*";
const WHEN_RU = "сегодня вечером|сегодня|завтра|послезавтра|на выходных|на этой неделе|на следующей неделе|(?:в|во|на|до|к) (?:понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье)|через \\d+ (?:дн\\p{L}*|час\\p{L}*|мин\\p{L}*|недел\\p{L}*)|(?:в )?\\d{1,2}[:.]\\d{2}(?: ?(?:мск|utc|gmt))?|\\d{1,2} (?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)|(?:в )?\\d{1,2} час\\p{L}* (?:ночи|утра|дня|вечера)";
const reWhen = new RegExp(exact(WHEN_EN + '|' + WHEN_RU), 'giu');
const whenOf = t => [...new Set([...t.matchAll(reWhen)].map(m => m[0].trim().toLowerCase()))].slice(0, 3).join(' · ');
// ctx.trusted = пост из крипто-канала (там слов про «токен» может не быть: «launch in 2h»)
function upcomingInfo(text, ts, ctx = {}) {
  if (NOISE.test(text)) return null;
  const ca = (text.match(CA58) || []).find(x => /\d/.test(x) && /[a-z]/.test(x) && /[A-Z]/.test(x));
  const pair = (text.match(/dexscreener\.com\/solana\/([A-Za-z0-9]{32,50})/i) || [])[1];
  const cryptoOK = UP_C.test(text) || /\bCA\b/.test(text) || ctx.trusted;
  const hasWhen = !!whenOf(text);
  const soon = (UP_L.test(text) && (UP_F.test(text) || hasWhen) && cryptoOK)                       // «запуск ... сегодня/через 2ч/в пятницу»
    || (UP_STRONG.test(text) && cryptoOK && !PAST.test(text))                        // «пресейл / вайтлист / stealth / coming soon / will launch» и т.п., даже без даты
    || (UP_L.test(text) && reStrong.test(text) && !PAST.test(text) && /(?:\$[A-Za-z]{2,12}|\bCA\b)/.test(text)); // «launching $TICKER»
  const live = !!(ca || pair) && LAUNCHISH.test(text);
  if (!soon && !live) return null;
  let eta = etaFrom(text, ts); if (eta && Math.abs(eta - ts) > 3 * 86400e3) eta = null;
  return { k: live ? 'live' : 'soon', eta: eta || undefined, when: whenOf(text) || undefined, tickers: tickersOf(text), ca, pair };
}

const STOP = new Set(('the and for are but not you all can has had her was one our out his how its let may new now old see two way who did get him she too use that this with have from they will would there their what about which when your said says after over into than them been more also just like some only back could other were then very here make made most much many such even well down year years first last news live video watch today').split(' ').concat(
  'это что как так все его она они был была были будет быть тоже ещё если или для при над под про без между после перед через который которая которые только очень можно нужно этот этого этой этих тот так же уже чем где когда почему новости новость видео сегодня заявил заявила сообщил сообщила сообщает рассказал'.split(' ')));
const ALIAS = { маск: 'musk', илон: 'elon', трамп: 'trump', байде: 'biden', путин: 'putin', зелен: 'zelen', дуров: 'durov', альтм: 'altma' };
const isCyr = w => /\p{Script=Cyrillic}/u.test(w);
const norm = w => { w = w.toLowerCase().replace(/ё/g, 'е'); if (isCyr(w)) { w = w.slice(0, 5); return ALIAS[w] || w; } return w.replace(/'s$/, '').replace(/s$/, ''); };
const tokens = t => [...new Set((t.replace(/https?:\/\/\S+/g, ' ').match(/[\p{L}\p{N}]{3,}/gu) || []).filter(w => !STOP.has(w.toLowerCase())).map(norm))];
const GENERIC = new Set('news says said will would could after over into amid report reports update live latest breaking major world city state president minister government people company market price week year time first last man woman viral goes video million billion post posts picture photo shows show takes stuns shocks internet unveils reveals video watch amid meme memes coin coins view views'.split(' '));
const TBAD = new Set(['white', 'house', 'trump', 'musk', 'elon'].slice(0, 2));
const RU_EN = { пингвин: 'penguin', капибар: 'capybara', кот: 'cat', кошк: 'cat', котик: 'cat', собак: 'dog', пес: 'dog', пёс: 'dog', щено: 'puppy', лягуш: 'frog', хомяк: 'hamster', обезь: 'monkey', утк: 'duck', утка: 'duck', медве: 'bear', коза: 'goat', козел: 'goat', енот: 'raccoon', белк: 'squirrel', улитк: 'snail', краб: 'crab', черепа: 'turtle', сова: 'owl', астер: 'asteroid', нло: 'ufo', марс: 'mars', иноп: 'alien', ракет: 'rocket', робот: 'robot', маск: 'musk', илон: 'elon', трамп: 'trump', нейро: 'neural', гуман: 'humanoid', дрон: 'drone' };
const toEn = w => { w = w.toLowerCase(); if (!isCyr(w)) return w; for (const k of Object.keys(RU_EN)) if (w.startsWith(k)) return RU_EN[k]; return ''; };

function score(items, now, opts = {}) {
  const MIN = opts.min ?? 30;
  const toks = items.map(i => tokens(i.title));
  const df = new Map(); toks.forEach(ts => ts.forEach(t => df.set(t, (df.get(t) || 0) + 1)));
  const maxDf = Math.max(8, items.length * 0.06);
  // соседи по теме: делят >=2 редких слова (без цепочек, чтобы разные сюжеты не слипались)
  const inv = new Map(); toks.forEach((ts, i) => ts.forEach(t => { if (df.get(t) <= maxDf && !GENERIC.has(t)) (inv.get(t) || inv.set(t, []).get(t)).push(i); }));
  const pairs = new Map(), nb = items.map(() => new Set());
  for (const ids of inv.values()) for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) { const k = ids[a] * 100003 + ids[b]; const c = (pairs.get(k) || 0) + 1; pairs.set(k, c); if (c === 2) { nb[ids[a]].add(ids[b]); nb[ids[b]].add(ids[a]); } }

  const out = [];
  items.forEach((it, i) => {
    const age = (now - it.ts) / 60000; if (age < 0 || age > (it.up && it.up.k === 'soon' ? 7 * 1440 : 720)) return;
    const reasons = []; let s = 0, trig = 0, heavy = false; const tw = [];
    for (const r of RULES) if (r.re.test(it.title)) { reasons.push({ why: r.why, pts: r.pts }); s += r.pts; if (r.pts > 0) trig += r.pts; if (r.flag === 'heavy') heavy = true; if (r.tk) for (const m of it.title.matchAll(r.reG)) for (const w of m[0].split(/\s+/)) tw.push([r.tk, toEn(w)]); }
    if (/^X @/.test(it.src || '')) { reasons.push({ why: 'Пост в X', pts: 10 }); s += 10; trig += 10; }
    if (it.launch) { const lp = it.launch.vip ? 40 : 30; reasons.push({ why: (it.launch.vip ? 'Анонс монеты от известной персоны' : 'Анонс/запуск монеты') + (it.launch.k === 'rumor' ? ' (слухи)' : ''), pts: lp }); s += lp; trig += lp; }
    const fr = age < 15 ? 22 : age < 60 ? 16 : age < 180 ? 8 : age < 360 ? 3 : 0; if (fr) { reasons.push({ why: age < 15 ? 'Только что (<15 мин)' : age < 60 ? 'Свежее (<1 ч)' : 'Ещё свежее (<' + (age < 180 ? 3 : 6) + ' ч)', pts: fr }); s += fr; }
    if (it.hot) { const h = Math.round(Math.min(14, Math.log10(it.hot + 1) * 3.5)); if (h > 0) { reasons.push({ why: 'Лайки/просмотры ▲' + it.hot, pts: h }); s += h; } }
    const g = [i, ...nb[i]], srcs = [...new Set(g.map(x => items[x].src))];
    if (srcs.length >= 3) { const c = srcs.length >= 8 ? 26 : srcs.length >= 5 ? 18 : 10; reasons.push({ why: 'Тему подхватили ' + srcs.length + ' источников', pts: c }); s += c; trig += c / 2; }
    if (!trig) s = Math.min(s, 25);                       // без триггера — не сигнал
    s = Math.max(0, Math.min(100, Math.round(s)));
    if (s < MIN) return;
    const mine = toks[i].filter(t => df.get(t) <= 25 && !GENERIC.has(t)).sort((a, b) => df.get(a) - df.get(b) || b.length - a.length);
    const cand = [...tw.sort((a, b) => b[0] - a[0]).map(x => x[1]), ...mine.filter(t => /^[a-z]+$/.test(t))].filter(w => /^[a-z]{4,12}$/.test(w) && !GENERIC.has(w) && !TBAD.has(w));
    const ascii = [...new Set(cand)].slice(0, 2);
    out.push({ id: it.id, score: s, reasons, heavy, topic: ascii.join(' ') || mine.slice(0, 2).join(' '), tokens: ascii, cluster: { n: g.length, srcs: srcs.slice(0, 5) },
      launch: it.launch, up: it.up, title: it.title, link: it.link, ts: it.ts, img: it.img, hot: it.hot, cat: it.cat, src: it.src, person: it.person, reg: it.reg });
  });
  // одна карточка на сюжет: берём сильнейшую, её «соседей» пропускаем
  out.sort((a, b) => b.score - a.score || b.ts - a.ts);
  const idx = new Map(items.map((it, i) => [it.id, i])), taken = new Set(), res = [];
  for (const o of out) { const i = idx.get(o.id); if (taken.has(i)) continue; res.push(o); taken.add(i); nb[i].forEach(j => taken.add(j)); }
  return res;
}
module.exports = { score, RULES, tokens, launchInfo, upcomingInfo };
