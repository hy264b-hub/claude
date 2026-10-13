// src/wongoji.css 를 테마 JSON 의 custom_css 로 묶어 themes/ 에 내보냅니다.
// 사용법: node scripts/build.mjs
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const css = await readFile(new URL('src/wongoji.css', root), 'utf8');

const theme = {
    name: '원고지 Wongoji',
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

const out = new URL(`themes/${theme.name}.json`, root);
await writeFile(out, JSON.stringify(theme, null, 4) + '\n');
console.log(`built ${decodeURIComponent(out.pathname)}`);
