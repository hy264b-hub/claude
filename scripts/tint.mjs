// 화이트 테마의 색을 베이지·연하늘 테마 색으로 바꿉니다.
// 밝기(OKLab L)는 거의 그대로 두고, 색의 기운만 바꿉니다.
//   무채색(종이·먹·회색 선) → 종이(밝은 색)는 neutralHue 로, 먹과 검은 선은 inkHue 로 살짝 물들입니다.
//                              새하얀 종이는 paperL 밝기로 조금 눌러 종이 빛을 냅니다.
//   청회색(인쇄선·대사·도장) → 색상은 그대로, 채도만 accentScale 배로.
import { rgbToOklab, oklabToRgb } from './dark.mjs';

export const TINTS = {
    // 아이보리 종이에 청회색 잉크 — 먹과 검은 선은 종이에 맞춰 살짝 따뜻한 먹색
    beige: { neutralHue: 78, paperChroma: 0.014, inkChroma: 0.011, inkHue: 65, paperL: 0.962, accentScale: 0.85 },
    // 안개 낀 하늘빛 종이 — 먹과 검은 선은 살짝 푸른 먹색
    sky:   { neutralHue: 242, paperChroma: 0.009, inkChroma: 0.017, inkHue: 250, paperL: 0.97, accentScale: 1.0 },
};

const NEUTRAL = 0.02;   // 이보다 채도가 낮으면 무채색으로 봅니다

const smooth = (lo, hi, x) => { const k = Math.min(1, Math.max(0, (x - lo) / (hi - lo))); return k * k * (3 - 2 * k); };

export function tintRgb(t) {
    return (r, g, b) => {
        let [L, A, B] = rgbToOklab(r, g, b);
        const C = Math.hypot(A, B);
        // 밝은 쪽만 종이 빛으로 눌러 줍니다 (L 0.8 → 그대로, 1 → paperL)
        if (L > 0.8) L = 0.8 + (L - 0.8) * (t.paperL - 0.8) / 0.2;
        if (C < NEUTRAL) {
            // 물은 종이(밝은 색)에만 들이고, 먹과 선은 거의 무채색으로 둡니다
            // 어두운 쪽(먹·검은 선)은 inkHue 로, 밝은 쪽(종이)은 neutralHue 로 — 사이는 부드럽게 잇습니다
            const k = smooth(0.6, 0.95, L);
            const ink = t.inkHue * Math.PI / 180, paper = t.neutralHue * Math.PI / 180;
            const a = t.inkChroma * Math.cos(ink) * (1 - k) + t.paperChroma * Math.cos(paper) * k;
            const b = t.inkChroma * Math.sin(ink) * (1 - k) + t.paperChroma * Math.sin(paper) * k;
            return oklabToRgb(L, a, b);
        }
        // 청회색은 색상은 그대로, 채도만 accentScale 배로
        return oklabToRgb(L, A * t.accentScale, B * t.accentScale);
    };
}
