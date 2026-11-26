// src/wongoji.css 를 테마 JSON 의 custom_css 로 묶어 themes/ 에 내보냅니다.
// 사용법: node scripts/build.mjs
//
// 테마 이름(= 파일 이름) 끝에 버전(v1.01)을 붙입니다. 버전은 판(White · Black · Beige · Sky)마다 따로이고,
// 내용이 바뀐 판만 0.01 올라갑니다. 바뀌지 않은 판은 이름도 파일도 그대로 둡니다.
// SillyTavern 은 이미 있는 이름의 테마를 가져오지 않으므로, 버전이 오르면 새 이름으로 가져올 수 있습니다.
import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import { darkCss, darkColor, mapCss, mapColor } from './dark.mjs';
import { TINTS, tintRgb } from './tint.mjs';

const root = new URL('../', import.meta.url);
const css = await readFile(new URL('src/wongoji.css', root), 'utf8');

const versionUrl = new URL('version.json', root);
const versions = JSON.parse(await readFile(versionUrl, 'utf8'));
const NAME = '원고지 테마 Wongoji Theme';

const theme = {
    name: 'White',
    blur_strength: 0,
    main_text_color: 'rgba(42, 45, 49, 1)',
    italics_text_color: 'rgba(106, 109, 114, 1)',
    underline_text_color: 'rgba(28, 30, 33, 1)',
    quote_text_color: 'rgba(63, 90, 116, 1)',
    blur_tint_color: 'rgba(252, 252, 251, 1)',
    chat_tint_color: 'rgba(231, 232, 233, 0)',
    user_mes_blur_tint_color: 'rgba(0, 0, 0, 0)',
    bot_mes_blur_tint_color: 'rgba(0, 0, 0, 0)',
    shadow_color: 'rgba(0, 0, 0, 0)',
    shadow_width: 0,
    border_color: 'rgba(28, 30, 33, 0.16)',
    font_scale: 0.8,
    fast_ui_mode: false,
    waifuMode: false,
    avatar_style: 1,
    chat_display: 0,
    noShadows: true,
    chat_width: 50,
    timer_enabled: false,
    timestamps_enabled: true,
    timestamp_model_icon: false,
    mesIDDisplay_enabled: true,
    hideChatAvatars_enabled: false,
    message_token_count_enabled: true,
    expand_message_actions: false,
    enableZenSliders: false,
    enableLabMode: false,
    hotswap_enabled: true,
    custom_css: css,
    bogus_folders: false,
    reduced_motion: false,
    compact_input_area: false,
    show_swipe_num_all_messages: false,
};

// 다크 버전 — 같은 테마에서 색만 바꿉니다
const COLOR_KEYS = ['main_text_color', 'italics_text_color', 'underline_text_color', 'quote_text_color',
    'blur_tint_color', 'chat_tint_color', 'user_mes_blur_tint_color', 'bot_mes_blur_tint_color', 'border_color'];
// 다크 전용 보정 — 본문 글씨는 장식보다 한 단계 밝게
const DARK_EXTRA = `
/* Dark edition — 본문 글씨 밝기 */
:root {
    --wg-ink-body: #c6c8cd;
    --wg-em: #8c9095;
    --wg-quote: #86a3c0;
}
`;
const dark = { ...theme, name: 'Black', custom_css: darkCss(css) + DARK_EXTRA };
for (const k of COLOR_KEYS) dark[k] = darkColor(theme[k]);
dark.main_text_color = 'rgba(198, 200, 205, 1)';
dark.italics_text_color = 'rgba(140, 144, 149, 1)';
dark.quote_text_color = 'rgba(134, 163, 192, 1)';

// 베이지 · 연하늘(Sky) 버전 — 같은 테마에서 종이와 잉크 빛만 바꿉니다
const tinted = Object.entries({ Beige: TINTS.beige, Sky: TINTS.sky }).map(([label, opts]) => {
    const fn = tintRgb(opts);
    const t = { ...theme, name: label, custom_css: mapCss(css, fn) };
    for (const k of COLOR_KEYS) t[k] = mapColor(theme[k], fn);
    return t;
});
const editions = [theme, dark, ...tinted];

// 판마다 지금 파일과 비교해, 내용이 바뀐 판만 버전을 올려 새 이름으로 씁니다
const themesDir = new URL('themes/', root);
const files = (await readdir(themesDir)).filter(f => f.startsWith(NAME));
const body = t => JSON.stringify({ ...t, name: '' });
for (const t of editions) {
    const label = t.name;
    const prefix = `${NAME} ${label} v`;
    const old = files.find(f => f.startsWith(prefix));
    let version = versions[label] ?? '1.00';
    let same = false;
    if (old) {
        const prev = JSON.parse(await readFile(new URL(old, themesDir), 'utf8'));
        same = body(prev) === body(t);
        version = old.slice(prefix.length, -'.json'.length);
    }
    if (!same) version = (Number(version) + 0.01).toFixed(2);
    versions[label] = version;
    t.name = `${prefix}${version}`;
    if (same) {
        console.log(`unchanged ${old}`);
        continue;
    }
    if (old) await unlink(new URL(old, themesDir));
    const out = new URL(`${t.name}.json`, themesDir);
    await writeFile(out, JSON.stringify(t, null, 4) + '\n');
    console.log(`built ${decodeURIComponent(out.pathname)}`);
}
await writeFile(versionUrl, JSON.stringify(versions, null, 4) + '\n');
