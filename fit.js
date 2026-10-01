// 여름뮤트 적합도 + 한국어 색 계열 이름 — 브라우저·node 공용 (CIELAB 기준)
// ponytail: 규칙 기반 근사(명도·채도·색상각). 퍼스널컬러 진단 도구가 아니라 "책 색 중 여름뮤트에 가까운 것" 가려내기용.
(function (root) {
  function lch(lab) { var L = lab[0], a = lab[1], b = lab[2], C = Math.sqrt(a * a + b * b), h = (Math.atan2(b, a) * 180 / Math.PI + 360) % 360; return { L: L, C: C, h: h }; }
  // 색상각의 차가움 0(따뜻)~1(차가움): 파랑·보라·청분홍은 차갑고, 노랑·주황·코랄은 따뜻
  function coolness(h, C) {
    if (C < 6) return 0.8;                                   // 무채색은 거의 중립(회색은 여름에 잘 맞음)
    var pts = [[0, 0.8], [15, 0.6], [30, 0.25], [50, 0.05], [75, 0], [95, 0.05], [120, 0.25], [160, 0.55], [190, 0.85], [230, 1], [290, 1], [330, 0.95], [360, 0.8]];
    for (var i = 1; i < pts.length; i++) if (h <= pts[i][0]) { var p = pts[i - 1], q = pts[i], t = (h - p[0]) / (q[0] - p[0]); return p[1] + (q[1] - p[1]) * t; }
    return 0.8;
  }
  function band(v, lo0, lo1, hi1, hi0) { return v <= lo0 || v >= hi0 ? 0 : v < lo1 ? (v - lo0) / (lo1 - lo0) : v > hi1 ? (hi0 - v) / (hi0 - hi1) : 1; }
  function fit(lab) {
    var c = lch(lab), why = [];
    var light = band(c.L, 28, 52, 86, 99), soft = c.C < 6 ? 0.9 : band(c.C, -1, 6, 26, 50), cool = coolness(c.h, c.C);
    var s = Math.round(100 * (0.42 * cool + 0.3 * light + 0.28 * soft));
    if (c.L < 30) { s = Math.min(s, 35); why.push('너무 어두워요'); }
    if (c.L > 95 && c.C < 6) { s = Math.min(s, 62); why.push('새하얀 색은 쨍해요'); }
    if (c.C > 50) { s = Math.min(s, 40); why.push('너무 선명해요'); }
    if (cool < 0.25 && c.C >= 6) { s = Math.min(s, 44); why.push('노란 기가 돌아요'); }
    if (!why.length) { if (cool >= 0.75) why.push('푸른 기가 도는 차가운 색'); else if (cool >= 0.5) why.push('차갑지도 따뜻하지도 않은 색'); else why.push('살짝 따뜻한 편'); why.push(c.C < 6 ? '무채색' : c.C <= 26 ? '부드럽게 탁한 톤' : '조금 선명한 톤'); why.push(c.L >= 70 ? '밝은 편' : c.L >= 52 ? '중간 밝기' : '조금 어두운 편'); }
    var grade = s >= 74 ? 'best' : s >= 62 ? 'good' : s >= 46 ? 'ok' : 'avoid';
    return { score: s, grade: grade, why: why, L: c.L, C: c.C, h: c.h };
  }
  var HUES = [[12, '분홍'], [28, '빨강'], [55, '주황'], [95, '노랑'], [135, '연두'], [175, '초록'], [215, '청록'], [265, '파랑'], [300, '남보라'], [335, '보라'], [361, '자주']];
  function korName(lab) {
    var c = lch(lab), L = c.L, C = c.C, h = c.h;
    if (C < 6) return L > 90 ? '흰색' : L > 70 ? '밝은 회색' : L > 40 ? '회색' : L > 22 ? '진회색' : '검정';
    var base = HUES.filter(function (x) { return h < x[0]; })[0][1];
    if (h >= 335 || h < 12) base = L > 60 ? '분홍' : '자주';
    if ((base === '주황' || base === '빨강' || base === '노랑') && L < 50 && C < 45) base = '갈색';
    if ((base === '주황' || base === '노랑') && L >= 62 && C < 40) base = base === '주황' ? '살구' : '베이지';
    else if (base === '노랑' && (C < 45 || L < 62)) base = '황토';
    if (h >= 5 && h < 40 && C < 22 && L >= 45 && L < 82) return L >= 62 ? '로즈 베이지' : '로즈 브라운';
    if (h >= 18 && h < 45 && L > 60 && C >= 25 && C < 60) base = '코랄';
    var pre = C < 16 ? (L > 65 ? '연한 ' : L > 40 ? '탁한 ' : '어두운 ') : C > 50 ? (L > 55 ? '선명한 ' : '진한 ') : L > 72 ? '밝은 ' : L < 38 ? '어두운 ' : '';
    return pre + base;
  }
  var api = { fit: fit, korName: korName, lch: lch };
  if (typeof module !== 'undefined') module.exports = api; else root.FIT = api;
})(this);
