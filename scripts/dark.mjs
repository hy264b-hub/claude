// 화이트 테마의 색을 다크 테마 색으로 바꿉니다.
// CSS 안의 모든 색(#hex, rgb()/rgba(), white/black, SVG 그림 속 %23hex)을
// OKLab 밝기만 뒤집어 옮깁니다. 색상·채도·투명도는 그대로 둡니다.
//   종이(흰색)      → 짙은 먹색 바탕
//   먹(진한 글씨)   → 밝은 회백색 글씨
//   청회색 인쇄선   → 비슷한 밝기의 청회색
// knee 위의 밝은 색(먹 → 흰 선·글씨)은 soft 비율로 눌러, 새하얗게 쏘지 않게 합니다.
export const DARK = { floor: 0.19, span: 0.9, ceil: 0.93, knee: 0.66, soft: 0.6 };

const toLin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const toSrgb = c => { c = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; return Math.round(Math.min(1, Math.max(0, c)) * 255); };

export function rgbToOklab(r, g, b) {
    [r, g, b] = [r, g, b].map(toLin);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
}
export function oklabToRgb(L, a, b) {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
    return [ 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
            -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
            -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s].map(toSrgb);
}
export function darkRgb(r, g, b) {
    const [L, A, B] = rgbToOklab(r, g, b);
    let L2 = Math.min(DARK.ceil, Math.max(DARK.floor, DARK.floor + (1 - L) * DARK.span));
    if (L2 > DARK.knee) L2 = DARK.knee + (L2 - DARK.knee) * DARK.soft;
    return oklabToRgb(L2, A, B);
}
const hex2 = n => n.toString(16).padStart(2, '0');

// CSS 안의 모든 색 literal 에 fn(r, g, b) → [r, g, b] 를 적용합니다.
export function mapColor(str, fn) {
    const m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+%?)\s*)?\)/);
    if (!m) return str;
    const [r, g, b] = fn(+m[1], +m[2], +m[3]);
    return m[4] !== undefined ? `rgba(${r}, ${g}, ${b}, ${m[4]})` : `rgb(${r}, ${g}, ${b})`;
}
function mapHex(h, fn) {
    let s = h.replace('#', '');
    if (s.length <= 4) s = [...s].map(c => c + c).join('');
    const [r, g, b] = [0, 2, 4].map(i => parseInt(s.slice(i, i + 2), 16));
    const alpha = s.length === 8 ? s.slice(6) : '';
    return fn(r, g, b).map(hex2).join('') + alpha;
}
export function mapCss(css, fn) {
    return css
        .replace(/%23([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-fA-F])/g, (_, h) => '%23' + mapHex(h, fn))
        .replace(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z_-])/g, (_, h) => '#' + mapHex(h, fn))
        .replace(/rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(?:,\s*[\d.]+%?\s*)?\)/g, c => mapColor(c, fn))
        .replace(/(?<![\w-])white(?![\w-])/g, '#' + mapHex('ffffff', fn))
        .replace(/(?<![\w-])black(?![\w-])/g, '#' + mapHex('000000', fn));
}
export const darkColor = str => mapColor(str, darkRgb);
export const darkCss = css => mapCss(css, darkRgb);
