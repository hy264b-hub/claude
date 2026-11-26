// 화이트 테마의 색을 베이지·연하늘 테마 색으로 바꿉니다.
// 밝기(OKLab L)는 거의 그대로 두고, 색의 기운만 바꿉니다.
//   무채색(종이·먹·회색 선) → neutralHue 쪽으로 살짝 물들임. 밝은 색일수록 더 물들고,
//                              새하얀 종이는 paperL 밝기로 조금 눌러 종이 빛을 냅니다.
//   청회색(인쇄선·대사·도장) → accentHue 로 돌리고 채도를 accentScale 배로.
import { rgbToOklab, oklabToRgb } from './dark.mjs';

export const TINTS = {
    beige: { neutralHue: 82, paperChroma: 0.015, inkChroma: 0.009, paperL: 0.958, accentHue: 62, accentScale: 0.85 },
    sky:   { neutralHue: 236, paperChroma: 0.008, inkChroma: 0.007, paperL: 0.972, accentHue: 245, accentScale: 1.0 },
};

const NEUTRAL = 0.02;   // 이보다 채도가 낮으면 무채색으로 봅니다

export function tintRgb(t) {
    return (r, g, b) => {
        let [L, A, B] = rgbToOklab(r, g, b);
        const C = Math.hypot(A, B);
        // 밝은 쪽만 종이 빛으로 눌러 줍니다 (L 0.8 → 그대로, 1 → paperL)
        if (L > 0.8) L = 0.8 + (L - 0.8) * (t.paperL - 0.8) / 0.2;
        let hue, chroma;
        if (C < NEUTRAL) {
            const k = Math.min(1, Math.max(0, (L - 0.2) / 0.75));
            hue = t.neutralHue;
            chroma = C * 0.3 + t.inkChroma + (t.paperChroma - t.inkChroma) * k;
        } else {
            hue = t.accentHue;
            chroma = C * t.accentScale;
        }
        const h = hue * Math.PI / 180;
        return oklabToRgb(L, chroma * Math.cos(h), chroma * Math.sin(h));
    };
}

// 캐릭터 원고지는 바탕보다 살짝 연하게 — 종이 밝기를 흰색 쪽으로 band 만큼 올리고 물을 덜 들입니다
export function bandCss(t, band = 0.55) {
    const light = { ...t, paperL: t.paperL + (1 - t.paperL) * band, paperChroma: t.paperChroma * (1 - band) };
    const hex = '#' + tintRgb(light)(255, 255, 255).map(n => n.toString(16).padStart(2, '0')).join('');
    return `
/* 캐릭터 원고지 — 바탕보다 살짝 연한 종이 */
#chat .mes:not([is_user="true"]) {
    --wg-band-bg: ${hex};
}

#chat .mes:not([is_user="true"]) .ch_name > .flex-container > .flex-container {
    box-shadow: 3px 3px 0 0 ${hex},
        4px 4px 0 0 var(--wg-hairline),
        7px 7px 0 0 ${hex},
        8px 8px 0 0 var(--wg-hairline);
}
`;
}
