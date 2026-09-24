/**
 * generate.js — Generate AI Assets page.
 *
 * Sends a prompt (optionally with a reference photo of the real piece) to an image
 * model and shows the result.
 *
 * - Each provider keeps its own API key (localStorage `elaris-api-key-<provider>`), so a
 *   key is never sent to another provider. The old shared `elaris-api-key` is migrated once.
 * - The aspect ratio is sent as a real API parameter (read from the pasted prompt when it
 *   says "Aspect ratio 4:5" or "--ar 4:5").
 * - Models: Gemini 3.1 Flash Image and GPT Image 2 replace the retired Imagen 3 and
 *   DALL·E 3 endpoints. Both accept the reference photo; Pollinations and FLUX.1 schnell don't.
 */
(function () {
    'use strict';

    const T = (k, en) => (window.I18n ? window.I18n.t(k, en) : en);
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    const PROVIDERS = {
        pollinations: { label: 'Free (Pollinations AI)',        needsKey: false, refImage: false },
        gemini:       { label: 'Google Gemini 3.1 Flash Image', needsKey: true,  refImage: true  },
        fal:          { label: 'Fal AI (FLUX.1 schnell)',       needsKey: true,  refImage: false },
        openai:       { label: 'OpenAI (GPT Image 2)',          needsKey: true,  refImage: true  },
    };
    const DEFAULT_PROVIDER = 'pollinations';
    const GEMINI_MODEL = 'gemini-3.1-flash-image';
    const OPENAI_MODEL = 'gpt-image-2';

    // Output size per ratio (multiples of 16), plus Fal's closest preset.
    const RATIOS = {
        '1:1':  { px: [1024, 1024], fal: 'square_hd' },
        '4:5':  { px: [1024, 1280], fal: 'portrait_4_3' },
        '3:4':  { px: [1152, 1536], fal: 'portrait_4_3' },
        '2:3':  { px: [1024, 1536], fal: 'portrait_4_3' },
        '9:16': { px: [1152, 2048], fal: 'portrait_16_9' },
        '16:9': { px: [2048, 1152], fal: 'landscape_16_9' },
        '21:9': { px: [2688, 1152], fal: 'landscape_16_9' },
    };
    const DEFAULT_RATIO = '4:5';   // Instagram feed

    // FLUX.1 [schnell] reads at most 256 text tokens (roughly 190 words) and drops the rest.
    const FAL_WORD_BUDGET = 190;

    // ── Storage ──────────────────────────────────────────────────
    const store = {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) {} },
    };
    const keyFor = p => store.get('elaris-api-key-' + p) || '';

    // The old single key was shared by every provider; keep it only for the provider it was
    // last used with (the old default was Gemini) and drop the shared slot.
    function migrateLegacyKey() {
        const legacy = store.get('elaris-api-key');
        if (legacy == null) return;
        const last = store.get('elaris-ai-model') || 'gemini';
        if (legacy && PROVIDERS[last] && PROVIDERS[last].needsKey && !keyFor(last)) store.set('elaris-api-key-' + last, legacy);
        store.set('elaris-api-key', null);
    }

    // ── Prompt helpers ───────────────────────────────────────────
    function detectRatio(text) {
        const m = String(text || '').match(/--ar\s+(\d+:\d+)/i) || String(text || '').match(/Aspect ratio (\d+:\d+)/i);
        return m && RATIOS[m[1]] ? m[1] : null;
    }

    // Midjourney flags (--ar 4:5 --v 6.1 --style raw) mean nothing to these APIs.
    function cleanPrompt(text) {
        return String(text || '').replace(/\s--[a-z]+(?:\s+(?!--)\S+)?/gi, '').replace(/[,\s]+$/, '').trim();
    }

    function withReferenceNote(prompt) {
        if (/\[IMAGE REFERENCES\]/.test(prompt)) return prompt;   // the studio already wrote reference instructions
        return 'The attached photo shows the exact jewelry piece to feature — reproduce its design, metal color, stones and proportions exactly. ' + prompt;
    }

    function fitLongSide([w, h], max) {
        const s = Math.min(1, max / Math.max(w, h));
        return [Math.round(w * s / 16) * 16, Math.round(h * s / 16) * 16];
    }

    // ── Image helpers ────────────────────────────────────────────
    function loadImage(src, timeoutMs = 90000) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const timer = setTimeout(() => reject(new Error(T('gen_err_timeout', 'The image took too long to load'))), timeoutMs);
            img.onload = () => { clearTimeout(timer); resolve(img); };
            img.onerror = () => { clearTimeout(timer); reject(new Error(T('gen_err_load', 'The image could not be loaded'))); };
            img.src = src;
        });
    }

    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(String(r.result).split(',')[1]);
            r.onerror = () => reject(r.error);
            r.readAsDataURL(blob);
        });
    }

    // Phone photos are often 10+ MB: send a JPEG with the long side at most 2048 px.
    async function prepareReference(file) {
        const url = URL.createObjectURL(file);
        try {
            const img = await loadImage(url, 30000);
            const s = Math.min(1, 2048 / Math.max(img.naturalWidth, img.naturalHeight));
            const c = document.createElement('canvas');
            c.width = Math.round(img.naturalWidth * s);
            c.height = Math.round(img.naturalHeight * s);
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#ffffff';                 // transparent PNG cut-outs stay white, not black
            ctx.fillRect(0, 0, c.width, c.height);
            ctx.drawImage(img, 0, 0, c.width, c.height);
            const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.92));
            return { blob, mimeType: 'image/jpeg', base64: await blobToBase64(blob) };
        } finally {
            URL.revokeObjectURL(url);
        }
    }

    // ── Providers ────────────────────────────────────────────────
    async function generateGemini(prompt, apiKey, ratio, ref) {
        const parts = [{ text: ref ? withReferenceNote(prompt) : prompt }];
        if (ref) parts.push({ inlineData: { mimeType: ref.mimeType, data: ref.base64 } });
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },   // header, not ?key= in the URL
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: { responseModalities: ['TEXT', 'IMAGE'], imageConfig: { aspectRatio: ratio } },
            }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data.error && data.error.message) || `Gemini API error (${res.status})`);
        const cand = (data.candidates || [])[0];
        const out = (cand && cand.content && cand.content.parts) || [];
        const imgPart = out.find(p => p.inlineData || p.inline_data);
        if (imgPart) {
            const d = imgPart.inlineData || imgPart.inline_data;
            return `data:${d.mimeType || d.mime_type || 'image/png'};base64,${d.data}`;
        }
        const why = (data.promptFeedback && data.promptFeedback.blockReason) || (cand && cand.finishReason) || (out.find(p => p.text) || {}).text;
        throw new Error(T('gen_err_no_image', 'No image returned') + (why ? ': ' + why : ''));
    }

    async function generateOpenAI(prompt, apiKey, ratio, ref) {
        const [w, h] = RATIOS[ratio].px;
        let res;
        if (ref) {
            // The edits endpoint takes the reference photo as a multipart upload.
            const form = new FormData();
            form.append('model', OPENAI_MODEL);
            form.append('prompt', withReferenceNote(prompt));
            form.append('size', `${w}x${h}`);
            form.append('quality', 'high');
            form.append('image[]', ref.blob, 'reference.jpg');
            res = await fetch('https://api.openai.com/v1/images/edits', {
                method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}` }, body: form,
            });
        } else {
            res = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: OPENAI_MODEL, prompt, n: 1, size: `${w}x${h}`, quality: 'high' }),
            });
        }
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data.error && data.error.message) || `OpenAI API error (${res.status})`);
        const item = (data.data || [])[0];
        if (item && item.b64_json) return `data:image/png;base64,${item.b64_json}`;
        if (item && item.url) return item.url;
        throw new Error(T('gen_err_no_image', 'No image returned'));
    }

    async function generateFal(prompt, apiKey, ratio) {
        const auth = { 'Authorization': `Key ${apiKey}` };
        const submit = await fetch('https://queue.fal.run/fal-ai/flux/schnell', {
            method: 'POST',
            headers: { ...auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, image_size: RATIOS[ratio].fal, num_images: 1, enable_safety_checker: true }),
        });
        const first = await submit.json().catch(() => ({}));
        if (!submit.ok) throw new Error(first.detail || first.message || `Fal API error (${submit.status})`);
        if (first.images && first.images[0] && first.images[0].url) return first.images[0].url;
        if (!first.request_id) throw new Error('Unexpected Fal API response');

        // Poll the URLs Fal hands back; build them only if it didn't.
        const base = `https://queue.fal.run/fal-ai/flux/schnell/requests/${first.request_id}`;
        const statusUrl = first.status_url || `${base}/status`;
        const resultUrl = first.response_url || base;
        for (let i = 0; i < 30; i++) {
            await sleep(2000);
            const st = await fetch(statusUrl, { headers: auth }).then(r => r.json()).catch(() => ({}));
            if (st.status === 'COMPLETED') {
                const out = await fetch(resultUrl, { headers: auth }).then(r => r.json()).catch(() => ({}));
                if (out.images && out.images[0] && out.images[0].url) return out.images[0].url;
                throw new Error('No image in completed Fal result');
            }
            if (st.status === 'FAILED' || st.status === 'ERROR') throw new Error('Fal generation failed: ' + (st.error || 'unknown error'));
        }
        throw new Error('Fal generation timed out after 60 seconds');
    }

    function pollinationsUrl(prompt, ratio) {
        const [w, h] = fitLongSide(RATIOS[ratio].px, 1280);
        return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
    }

    async function downloadImage(src) {
        const name = `elaris_generated_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.png`;
        try {
            const blob = await (await fetch(src)).blob();
            const url = URL.createObjectURL(blob);
            const a = Object.assign(document.createElement('a'), { href: url, download: name });
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (e) {
            window.open(src, '_blank', 'noopener');   // host without CORS: let the browser save it
        }
    }

    // ── Page ─────────────────────────────────────────────────────
    const GEN_ICON = '<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/></svg>';

    window.render_generate = function (container) {
        migrateLegacyKey();
        const savedModel = PROVIDERS[store.get('elaris-ai-model')] ? store.get('elaris-ai-model') : DEFAULT_PROVIDER;
        const lastPrompt = store.get('elaris-last-prompt') || '';
        const savedRatio = RATIOS[store.get('elaris-ai-ratio')] ? store.get('elaris-ai-ratio') : DEFAULT_RATIO;

        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title" data-i18n="gen_title">Generate AI Assets</h1>
                <p class="page-subtitle" data-i18n="gen_subtitle">Turn your prompts into high-quality images via API</p>
            </div>

            <div class="generate-layout" style="display:flex; flex-wrap:wrap; gap:20px;">
                <!-- Left Controls -->
                <div class="card" style="flex:1; min-width:300px;">
                    <div class="form-group">
                        <label class="form-label" data-i18n="gen_model">AI Model Provider</label>
                        <select id="ai-model" class="form-select">
                            ${Object.keys(PROVIDERS).map(id => `<option value="${id}">${PROVIDERS[id].label}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group" id="api-key-block">
                        <label class="form-label" data-i18n="gen_api_key">API Key (Saved locally)</label>
                        <input type="password" id="api-key" class="form-input" autocomplete="off" placeholder="Paste your API key here">
                        <p class="text-sm text-muted" style="margin-top:6px" data-i18n="gen_key_hint">Each provider keeps its own key on this device.</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label" data-i18n="gen_prompt">Image Prompt</label>
                        <textarea id="ai-prompt" class="form-textarea" style="min-height:120px;" placeholder="Describe your image..."></textarea>
                        <p class="text-sm text-muted" id="ai-prompt-meta" style="margin-top:6px"></p>
                    </div>

                    <div class="form-group">
                        <label class="form-label" data-i18n="gen_ratio">Aspect Ratio</label>
                        <select id="ai-ratio" class="form-select">
                            ${Object.keys(RATIOS).map(r => `<option value="${r}">${r}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" data-i18n="gen_ref">Reference Image (Optional)</label>
                        <input type="file" id="ai-ref-image" class="form-input" accept="image/*">
                        <p class="text-sm text-muted" id="ai-ref-hint" style="margin-top:6px"></p>
                    </div>

                    <button id="btn-generate-ai" class="btn btn-primary btn-lg" style="width:100%; margin-top:10px;">
                        ${GEN_ICON}
                        <span data-i18n="gen_btn">Generate Image</span>
                    </button>
                </div>

                <!-- Right Preview -->
                <div class="card" style="flex:1; min-width:300px; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:400px; background:var(--bg-tertiary);">
                    <div id="ai-result-container" style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; overflow:hidden; border-radius:var(--radius-md);">
                        <p style="color:var(--text-muted); font-size:13px; text-align:center;" data-i18n="gen_result">
                            Generated image will appear here.
                        </p>
                    </div>
                </div>
            </div>
        `;

        if (window.I18n) window.I18n.applyLanguage();

        const $ = id => container.querySelector('#' + id);
        const modelSelect = $('ai-model');
        const apiKeyInput = $('api-key');
        const promptInput = $('ai-prompt');
        const ratioSelect = $('ai-ratio');
        const refInput = $('ai-ref-image');
        const btnGenerate = $('btn-generate-ai');
        const resultContainer = $('ai-result-container');

        // Values go in through DOM properties, never through the HTML template.
        modelSelect.value = savedModel;
        promptInput.value = lastPrompt;
        ratioSelect.value = detectRatio(lastPrompt) || savedRatio;

        const refresh = () => {
            const p = PROVIDERS[modelSelect.value];
            $('api-key-block').style.display = p.needsKey ? '' : 'none';
            apiKeyInput.value = keyFor(modelSelect.value);
            const hasRef = refInput.files && refInput.files.length > 0;
            const hint = $('ai-ref-hint');
            hint.textContent = p.refImage
                ? T('gen_ref_hint_ok', 'Sent with the prompt so the model reproduces your real piece.')
                : T('gen_ref_hint_no', "This model can't use a reference photo — choose Google Gemini or OpenAI to include it.");
            hint.style.color = (!p.refImage && hasRef) ? 'var(--warning)' : '';
            const words = cleanPrompt(promptInput.value).split(/\s+/).filter(Boolean).length;
            const meta = $('ai-prompt-meta');
            const over = modelSelect.value === 'fal' && words > FAL_WORD_BUDGET;
            meta.textContent = T('gen_words', '{n} words').replace('{n}', words) +
                (over ? ' — ' + T('gen_fal_budget', 'FLUX.1 schnell only reads about the first 190 words; the rest is ignored.') : '');
            meta.style.color = over ? 'var(--warning)' : '';
        };
        refresh();

        modelSelect.addEventListener('change', () => { store.set('elaris-ai-model', modelSelect.value); refresh(); });
        apiKeyInput.addEventListener('change', () => store.set('elaris-api-key-' + modelSelect.value, apiKeyInput.value.trim()));
        ratioSelect.addEventListener('change', () => store.set('elaris-ai-ratio', ratioSelect.value));
        refInput.addEventListener('change', refresh);
        promptInput.addEventListener('input', refresh);
        // A pasted studio prompt carries its ratio ("Aspect ratio 4:5." / "--ar 4:5"): pick it up.
        promptInput.addEventListener('paste', () => setTimeout(() => {
            const r = detectRatio(promptInput.value);
            if (r) ratioSelect.value = r;
            refresh();
        }, 0));

        const resetButton = () => {
            btnGenerate.disabled = false;
            btnGenerate.innerHTML = `${GEN_ICON}<span data-i18n="gen_btn">Generate Image</span>`;
            if (window.I18n) window.I18n.applyLanguage();
        };

        btnGenerate.addEventListener('click', async () => {
            const model = modelSelect.value;
            const provider = PROVIDERS[model];
            const apiKey = apiKeyInput.value.trim();
            const rawPrompt = promptInput.value.trim();
            const ratio = ratioSelect.value;
            const refFile = refInput.files[0];

            if (provider.needsKey && !apiKey) {
                window.Elaris.toast(T('gen_toast_need_key', 'Please enter your API key first.'), 'error');
                return;
            }
            if (!rawPrompt) {
                window.Elaris.toast(T('gen_toast_need_prompt', 'Please enter an image prompt.'), 'error');
                return;
            }
            if (refFile && !provider.refImage) {
                window.Elaris.toast(T('gen_ref_hint_no', "This model can't use a reference photo — choose Google Gemini or OpenAI to include it."), 'info');
            }

            store.set('elaris-api-key-' + model, apiKey);
            store.set('elaris-last-prompt', rawPrompt);
            const prompt = cleanPrompt(rawPrompt);

            btnGenerate.disabled = true;
            btnGenerate.innerHTML = `<div class="spinner" style="width:16px;height:16px;border-width:2px;margin-right:8px;"></div> ${T('gen_generating', 'Generating…')}`;
            resultContainer.innerHTML = '<div class="spinner"></div><p style="margin-top:16px;font-size:13px;"></p>';
            resultContainer.querySelector('p').textContent = T('gen_calling', 'Calling {name}…').replace('{name}', provider.label);

            try {
                const ref = (refFile && provider.refImage) ? await prepareReference(refFile) : null;
                let imageUrl;
                if (model === 'pollinations') imageUrl = pollinationsUrl(prompt, ratio);
                else if (model === 'gemini') imageUrl = await generateGemini(prompt, apiKey, ratio, ref);
                else if (model === 'fal') imageUrl = await generateFal(prompt, apiKey, ratio);
                else if (model === 'openai') imageUrl = await generateOpenAI(prompt, apiKey, ratio, ref);

                const img = await loadImage(imageUrl);   // only report success once it actually loads
                img.alt = T('gen_result_alt', 'Generated image');
                img.style.cssText = 'max-width:100%; max-height:70vh; object-fit:contain; border-radius:var(--radius-md); box-shadow:0 4px 20px rgba(0,0,0,0.5);';
                const dl = document.createElement('button');
                dl.className = 'btn btn-secondary btn-sm';
                dl.textContent = '⬇ ' + T('gen_download', 'Download');
                dl.addEventListener('click', () => downloadImage(imageUrl));
                resultContainer.replaceChildren(img, dl);
                window.Elaris.toast(T('gen_toast_done', 'Image generated ✓'), 'success');
            } catch (error) {
                console.error('Generation failed:', error);
                window.Elaris.toast(T('gen_toast_failed', 'Generation failed:') + ' ' + error.message, 'error');
                const p = document.createElement('p');
                p.style.cssText = 'color:#ff6b6b; font-size:13px; text-align:center;';
                p.textContent = T('gen_failed', 'Failed to generate.') + ' ' + error.message;   // provider text, never HTML
                resultContainer.replaceChildren(p);
            } finally {
                resetButton();
            }
        });
    };
})();
