// 화이트 테마의 색을 베이지·연하늘 테마 색으로 바꿉니다.
// 밝기(OKLab L)는 거의 그대로 두고, 색의 기운만 바꿉니다.
//   무채색(종이·먹·회색 선) → neutralHue 쪽으로 살짝 물들임. 밝은 색일수록 더 물들고,
//                              새하얀 종이는 paperL 밝기로 조금 눌러 종이 빛을 냅니다.
//   청회색(인쇄선·대사·도장) → accentHue 로 돌리고 채도를 accentScale 배로.
import { rgbToOklab, oklabToRgb } from './dark.mjs';

export const TINTS = {
    beige: { neutralHue: 82, paperChroma: 0.021, inkChroma: 0.012, paperL: 0.945, accentHue: 62, accentScale: 1.0 },
    sky:   { neutralHue: 236, paperChroma: 0.012, inkChroma: 0.01, paperL: 0.962, accentHue: 245, accentScale: 1.15 },
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
