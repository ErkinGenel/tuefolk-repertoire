// Storage can be unavailable (private mode, sandboxed iframes). Never let that crash the app.
const wrap = (kind) => ({
    get(key, fallback = null) {
        try { const v = window[kind].getItem(key); return v === null ? fallback : v; } catch { return fallback; }
    },
    set(key, value) {
        try { window[kind].setItem(key, value); } catch { /* ignore */ }
    },
});
export const session = wrap('sessionStorage');
export const local = wrap('localStorage');
