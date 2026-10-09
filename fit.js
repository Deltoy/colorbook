// 퍼스널컬러 10톤 적합도 + 한국어 색 계열 이름 — 브라우저·node 공용 (CIELAB 기준)
// ponytail: 규칙 기반 근사(온도·명도·채도 띠). 진단 도구가 아니라 "책 색 중 내 톤에 가까운 것" 가려내기용. 착용 피드백으로 띠 숫자만 조정.
(function (root) {
  function lch(lab) { var L = lab[0], a = lab[1], b = lab[2], C = Math.sqrt(a * a + b * b), h = (Math.atan2(b, a) * 180 / Math.PI + 360) % 360; return { L: L, C: C, h: h }; }
  // 색상각의 차가움 0(따뜻)~1(차가움): 파랑·보라·청분홍은 차갑고, 노랑·주황·코랄은 따뜻
  function coolness(h) {
    var pts = [[0, 0.8], [15, 0.6], [30, 0.25], [50, 0.05], [75, 0], [95, 0.05], [120, 0.25], [160, 0.55], [190, 0.85], [230, 1], [290, 1], [330, 0.95], [360, 0.8]];
    for (var i = 1; i < pts.length; i++) if (h <= pts[i][0]) { var p = pts[i - 1], q = pts[i], t = (h - p[0]) / (q[0] - p[0]); return p[1] + (q[1] - p[1]) * t; }
    return 0.8;
  }
  function band(v, r) { return v <= r[0] || v >= r[3] ? 0 : v < r[1] ? (v - r[0]) / (r[1] - r[0]) : v > r[2] ? (r[3] - v) / (r[3] - r[2]) : 1; }
  // 톤 = 온도(warm) · 명도 띠 L[0~3] · 채도 띠 C[0~3] · 무채색 점수 n[온도, 맑기] · 무채색이 맞는 명도 띠 nL
  // 여름 쿨 뮤트는 v2(10/02) 수치 그대로 → 베스트 35색 유지
  var TONES = [
    { id: 'spl', season: '봄', name: '봄 웜 라이트', warm: 1, L: [52, 66, 92, 99], C: [6, 14, 38, 56], n: [0.35, 0.4], nL: [70, 85, 97, 101] },
    { id: 'spb', season: '봄', name: '봄 웜 브라이트', warm: 1, L: [46, 58, 84, 95], C: [30, 45, 90, 120], n: [0.3, 0.3], nL: [80, 92, 100, 101] },
    { id: 'sul', season: '여름', name: '여름 쿨 라이트', warm: 0, L: [46, 60, 94, 99], C: [-1, 6, 34, 50], n: [0.8, 0.9], nL: [60, 75, 96, 101] },
    { id: 'sub', season: '여름', name: '여름 쿨 브라이트', warm: 0, L: [42, 56, 88, 98], C: [14, 28, 62, 82], n: [0.8, 0.6], nL: [60, 80, 97, 101] },
    { id: 'sum', season: '여름', name: '여름 쿨 뮤트', warm: 0, L: [28, 52, 86, 99], C: [-1, 6, 26, 50], n: [0.8, 0.9], nL: [28, 52, 86, 99] },
    { id: 'aum', season: '가을', name: '가을 웜 뮤트', warm: 1, L: [30, 42, 74, 88], C: [4, 10, 30, 46], n: [0.35, 0.7], nL: [35, 45, 80, 92] },
    { id: 'aus', season: '가을', name: '가을 웜 스트롱', warm: 1, L: [22, 34, 60, 74], C: [28, 40, 70, 90], n: [0.3, 0.3], nL: [15, 25, 45, 60] },
    { id: 'aud', season: '가을', name: '가을 웜 딥', warm: 1, L: [12, 20, 50, 64], C: [8, 16, 50, 68], n: [0.35, 0.5], nL: [10, 18, 40, 55] },
    { id: 'wib', season: '겨울', name: '겨울 쿨 브라이트', warm: 0, L: [18, 30, 80, 94], C: [26, 42, 120, 140], n: [0.9, 1], nL: [0, 0, 30, 45], nL2: [85, 94, 101, 102] },
    { id: 'wid', season: '겨울', name: '겨울 쿨 딥', warm: 0, L: [6, 14, 40, 54], C: [8, 18, 70, 90], n: [0.9, 1], nL: [0, 0, 35, 50] }
  ];
  var BY = {}; TONES.forEach(function (t) { BY[t.id] = t; });
  function fit(lab, id) {
    var t = BY[id] || BY.sum, c = lch(lab), why = [], gray = c.C < 6;
    var cool = coolness(c.h), temp = gray ? t.n[0] : t.warm ? 1 - cool : cool;
    var light = gray ? Math.max(band(c.L, t.nL), t.nL2 ? band(c.L, t.nL2) : 0) : band(c.L, t.L);
    var clear = gray ? t.n[1] : band(c.C, t.C);
    var s = Math.round(100 * (0.42 * temp + 0.3 * light + 0.28 * clear));
    if (!gray && temp < 0.25) { s = Math.min(s, 44); why.push(t.warm ? '푸른 기가 돌아요' : '노란 기가 돌아요'); }
    if (light === 0) { s = Math.min(s, 40); why.push(c.L < t.L[0] + 10 ? '너무 어두워요' : '너무 밝아요'); }
    if (!gray && clear === 0) { s = Math.min(s, 40); why.push(c.C >= t.C[3] ? '너무 선명해요' : '너무 탁해요'); }
    if (!why.length) {
      why.push(gray ? '무채색' : temp >= 0.75 ? (t.warm ? '노란 기가 도는 따뜻한 색' : '푸른 기가 도는 차가운 색') : temp >= 0.5 ? '차갑지도 따뜻하지도 않은 색' : (t.warm ? '살짝 차가운 편' : '살짝 따뜻한 편'));
      if (!gray) why.push(c.C <= 26 ? '부드럽게 탁한 톤' : c.C <= 50 ? '조금 선명한 톤' : '선명한 톤');
      why.push(c.L >= 70 ? '밝은 편' : c.L >= 45 ? '중간 밝기' : '어두운 편');
    }
    return { score: s, grade: s >= 74 ? 'best' : s >= 62 ? 'good' : s >= 46 ? 'ok' : 'avoid', why: why };
  }
  var HUES = [[12, '분홍'], [28, '빨강'], [55, '주황'], [95, '노랑'], [135, '연두'], [175, '초록'], [215, '청록'], [265, '파랑'], [300, '남보라'], [335, '보라'], [361, '자주']];
  function korName(lab) {
    var c = lch(lab), L = c.L, C = c.C, h = c.h;
    if (C < 6) return L > 90 ? '흰색' : L > 70 ? '밝은 회색' : L > 40 ? '회색' : L > 22 ? '진회색' : '검정';
    var base = HUES.filter(function (x) { return h < x[0]; })[0][1];
    if (h >= 335 || h < 12) base = L > 60 ? '분홍' : '자주';
    if (base === '빨강' && L > 70 && C < 45) base = '분홍';   // 연한 빨강은 분홍으로 부르는 게 자연스러움
    if ((base === '주황' || base === '빨강' || base === '노랑') && L < 50 && C < 45) base = '갈색';
    if ((base === '주황' || base === '노랑') && L >= 62 && C < 40) base = base === '주황' ? '살구' : '베이지';
    else if (base === '노랑' && (C < 45 || L < 62)) base = '황토';
    if (h >= 5 && h < 40 && C < 22 && L >= 45 && L < 82) return L >= 62 ? '로즈 베이지' : '로즈 브라운';
    if (h >= 18 && h < 45 && L > 60 && C >= 25 && C < 60) base = '코랄';
    var pre = C < 16 ? (L > 65 ? '연한 ' : L > 40 ? '탁한 ' : '어두운 ') : C > 50 ? (L > 55 ? '선명한 ' : '진한 ') : L > 72 ? '밝은 ' : L < 38 ? '어두운 ' : '';
    return pre + base;
  }
  var api = { fit: fit, korName: korName, lch: lch, TONES: TONES };
  if (typeof module !== 'undefined') module.exports = api; else root.FIT = api;
})(this);
