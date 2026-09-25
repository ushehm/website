/**
 * fetch-steam.mjs — 從 Steam Web API 抓取個人檔案／遊戲庫資料
 * ---------------------------------------------------------------------------
 * 用途：產生 tools/steam-data.json，供我（或你）挑選內容後填進 data.js。
 *       這支腳本「不會」覆寫 data.js，所以你自己改過的內容不會被蓋掉。
 *
 * 使用方式：
 *   1. 確認 D:\My website\steam-api-key.txt 裡有你的 Steam Web API key
 *      （申請：https://steamcommunity.com/dev/apikey）
 *   2. node tools/fetch-steam.mjs
 *
 * 注意：steam-api-key.txt 是你的私密金鑰，不要把整個資料夾直接上傳到公開網站。
 */

import fs from 'node:fs';
import path from 'node:path';

// --- 設定 -------------------------------------------------------------------
const ROOT = path.resolve(import.meta.dirname, '..');   // D:\My website
const KEY_FILE = path.join(ROOT, 'steam-api-key.txt');
const OUT_FILE = path.join(ROOT, 'tools', 'steam-data.json');

// 你的 SteamID64。要換帳號就改這裡（個人檔案網址 /profiles/<這串數字>）。
const STEAMID = '76561199549763479';

// 只抓有遊玩紀錄的遊戲的成就，避免對 0 小時的遊戲發上百個無意義請求。
const MIN_PLAYTIME_FOR_ACHIEVEMENTS = 1; // 分鐘

// 每次請求之間的間隔，避免觸發 Steam 的速率限制。
const DELAY_MS = 350;

const API = 'https://api.steampowered.com';
const STORE = 'https://store.steampowered.com';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 呼叫一個會回傳 JSON 的端點，附上簡單重試。 */
async function api(url, { retries = 2 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'dsh-steam-page/1.0' } });
      if (res.status === 429) throw new Error('HTTP 429 被限流');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(1500 * (attempt + 1));
    }
  }
}

const keyUrl = (iface, method, version, params) => {
  const q = new URLSearchParams({ key: KEY, ...params });
  return `${API}/${iface}/${method}/${version}/?${q}`;
};

// --- 主流程 -----------------------------------------------------------------
const KEY = fs.readFileSync(KEY_FILE, 'utf8').trim();
if (!KEY) throw new Error(`找不到 API key：${KEY_FILE}`);

console.log('1/6 個人檔案 …');
const summaries = await api(keyUrl('ISteamUser', 'GetPlayerSummaries', 'v2', { steamids: STEAMID }));
const player = summaries.response.players[0];

console.log('2/6 Steam 等級 …');
const levelRes = await api(keyUrl('IPlayerService', 'GetSteamLevel', 'v1', { steamid: STEAMID }));

console.log('3/6 擁有的遊戲 …');
const owned = await api(
  keyUrl('IPlayerService', 'GetOwnedGames', 'v1', {
    steamid: STEAMID,
    include_appinfo: 1,
    include_played_free_games: 1,
  }),
);
const games = owned.response.games ?? [];

console.log('4/6 最近遊玩 …');
const recent = await api(
  keyUrl('IPlayerService', 'GetRecentlyPlayedGames', 'v1', { steamid: STEAMID, count: 20 }),
);

console.log('5/6 願望清單 …');
let wishlist = [];
try {
  const wl = await api(keyUrl('IWishlistService', 'GetWishlist', 'v1', { steamid: STEAMID }));
  const items = wl.response.items ?? [];
  for (const item of items) {
    await sleep(DELAY_MS);
    let name = `appid ${item.appid}`;
    let capsule = null;
    try {
      const d = await api(`${STORE}/api/appdetails?appids=${item.appid}&l=schinese&cc=hk`);
      const info = d[String(item.appid)];
      if (info?.success) {
        name = info.data.name;
        capsule = info.data.header_image ?? null;
      }
    } catch { /* 取不到名字就退回 appid，不讓整支腳本失敗 */ }
    wishlist.push({ appid: item.appid, name, capsule, priority: item.priority, dateAdded: item.date_added });
  }
} catch (err) {
  console.warn(`  願望清單讀取失敗（可能未公開）：${err.message}`);
}

console.log('6/6 各遊戲成就進度 …');
const withAchievements = [];
const targets = games
  .filter((g) => (g.playtime_forever ?? 0) >= MIN_PLAYTIME_FOR_ACHIEVEMENTS)
  .sort((a, b) => b.playtime_forever - a.playtime_forever);

let done = 0;
for (const g of targets) {
  done++;
  process.stdout.write(`\r   ${done}/${targets.length}  ${g.name.slice(0, 40).padEnd(42)}`);
  try {
    const r = await api(
      keyUrl('ISteamUserStats', 'GetPlayerAchievements', 'v1', {
        steamid: STEAMID,
        appid: g.appid,
        l: 'schinese',
      }),
    );
    const stats = r.playerstats;
    if (stats?.success && Array.isArray(stats.achievements) && stats.achievements.length > 0) {
      const unlocked = stats.achievements.filter((a) => a.achieved === 1).length;
      withAchievements.push({
        appid: g.appid,
        name: stats.gameName ?? g.name,
        unlocked,
        total: stats.achievements.length,
        percent: Math.round((unlocked / stats.achievements.length) * 1000) / 10,
        perfect: unlocked === stats.achievements.length,
      });
    }
  } catch { /* 該遊戲沒有成就或未公開，略過 */ }
  await sleep(DELAY_MS);
}
process.stdout.write('\r' + ' '.repeat(70) + '\r');

const out = {
  fetchedAt: new Date().toISOString(),
  steamId: STEAMID,
  profile: {
    personaName: player.personaname,
    realName: player.realname ?? null,
    profileUrl: player.profileurl,
    avatar: player.avatarfull,
    countryCode: player.loccountrycode ?? null,
    memberSince: player.timecreated
      ? new Date(player.timecreated * 1000).toISOString().slice(0, 10)
      : null,
    steamLevel: levelRes.response.player_level ?? null,
    personaState: player.personastate,
  },
  ownedCount: owned.response.game_count ?? games.length,
  games: games
    .map((g) => ({
      appid: g.appid,
      name: g.name,
      minutes: g.playtime_forever ?? 0,
      hours: Math.round(((g.playtime_forever ?? 0) / 60) * 10) / 10,
      minutes2Weeks: g.playtime_2weeks ?? 0,
      lastPlayed: g.rtime_last_played
        ? new Date(g.rtime_last_played * 1000).toISOString().slice(0, 10)
        : null,
      icon: g.img_icon_url
        ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
        : null,
    }))
    .sort((a, b) => b.minutes - a.minutes),
  recentlyPlayed: (recent.response.games ?? []).map((g) => ({
    appid: g.appid,
    name: g.name,
    minutes2Weeks: g.playtime_2weeks ?? 0,
    hoursTotal: Math.round(((g.playtime_forever ?? 0) / 60) * 10) / 10,
  })),
  wishlist,
  achievements: withAchievements.sort((a, b) => b.percent - a.percent),
  perfectGames: withAchievements.filter((a) => a.perfect).map((a) => a.appid),
};

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf8');

console.log(`\n完成 → ${OUT_FILE}`);
console.log(`  遊戲總數 ${out.ownedCount}，最近遊玩 ${out.recentlyPlayed.length}，願望清單 ${wishlist.length}`);
console.log(`  有成就資料 ${withAchievements.length} 款，其中全成就 ${out.perfectGames.length} 款`);
