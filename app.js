/*
 * シフト希望応募WEBアプリ: LINE連携の開始ページ（静的・サーバー処理なし・外部スクリプトなし）
 * - WEBアプリ（GAS）から #u=<LINE認可URL> で受け取り、読み取ったらアドレス欄から消す（# 以降はサーバーへ送られない）。
 * - URLとして解析し、https://access.line.me/oauth2/v2.1/authorize（ユーザー名・パスワード・ポートなし）で、
 *   戻り先がシフト希望応募WEBアプリのときだけボタンを出す。自動では移らない（ユーザーが押して移る）。
 * - 秘密情報は持たない（認可URLに入っているのは公開のチャネルIDと、1回限り・10分で切れる値だけ）。
 */
(function () {
  'use strict';
  var CALLBACK = 'https://script.google.com/macros/s/AKfycbxX6Q74uGr5e60QD1qU5-xA-DdTZRLPAbtKtWd76Vas76lK8noRQ-mPCValm4Q4QEBKpw/exec';

  /** 純関数: 許可する認可URLなら URL オブジェクト、それ以外は null。 */
  function check(raw) {
    var u;
    try { u = new URL(String(raw || '')); } catch (e) { return null; }
    if (u.protocol !== 'https:' || u.hostname !== 'access.line.me' || u.port !== '' || u.pathname !== '/oauth2/v2.1/authorize') return null;
    if (u.username !== '' || u.password !== '') return null;
    var q = u.searchParams;
    if (q.get('response_type') !== 'code' || q.get('redirect_uri') !== CALLBACK) return null;
    if (!q.get('client_id') || !q.get('state') || !q.get('nonce') || !q.get('code_challenge') || q.get('code_challenge_method') !== 'S256') return null;
    return u;
  }

  /** #u=... を取り出す（他の形は無視）。 */
  function fromHash(hash) {
    var m = /^#u=([^&]*)$/.exec(String(hash || ''));
    if (!m) return '';
    try { return decodeURIComponent(m[1]); } catch (e) { return ''; }
  }

  if (typeof window === 'undefined') { module.exports = { check: check, fromHash: fromHash, CALLBACK: CALLBACK }; return; }   // テスト用

  var raw = fromHash(location.hash);
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* 消せなくても認可URLは1回限り・10分 */ }
  var framed = true;
  try { framed = window.top !== window.self; } catch (e) { framed = true; }
  var u = framed ? null : check(raw);
  if (u) {
    document.getElementById('go').setAttribute('href', u.href);
    document.getElementById('ok').hidden = false;
  } else {
    document.getElementById('ng').hidden = false;
  }
})();
