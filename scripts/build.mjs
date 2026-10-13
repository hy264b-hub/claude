// src/wongoji.css 를 테마 JSON 의 custom_css 로 묶어 themes/ 에 내보냅니다.
// 사용법: node scripts/build.mjs          — 지금 버전으로 다시 만들기
//        node scripts/build.mjs --bump   — 버전을 올려서 만들기
//
// SillyTavern 은 이미 있는 이름의 테마를 가져오지 않으므로,
// 테마 이름(= 파일 이름)에 버전을 붙여 고칠 때마다 새 이름이 되게 합니다.
import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const css = await readFile(new URL('src/wongoji.css', root), 'utf8');

const versionUrl = new URL('version.json', root);
const meta = JSON.parse(await readFile(versionUrl, 'utf8'));
if (process.argv.includes('--bump')) {
    const [major, minor, patch] = meta.version.split('.').map(Number);
    meta.version = `${major}.${minor}.${patch + 1}`;
    await writeFile(versionUrl, JSON.stringify(meta, null, 4) + '\n');
}

const theme = {
    name: `원고지 Wongoji ${meta.version}`,
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

// 이전 버전 파일은 지웁니다
const themesDir = new URL('themes/', root);
for (const file of await readdir(themesDir)) {
    if (file.startsWith('원고지 Wongoji') && file !== `${theme.name}.json`) {
        await unlink(new URL(file, themesDir));
    }
}

const out = new URL(`${theme.name}.json`, themesDir);
await writeFile(out, JSON.stringify(theme, null, 4) + '\n');
console.log(`built ${decodeURIComponent(out.pathname)}`);
