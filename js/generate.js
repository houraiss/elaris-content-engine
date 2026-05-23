window.render_generate = function(container) {
    const savedKey = localStorage.getItem('elaris-api-key') || '';
    const lastPrompt = localStorage.getItem('elaris-last-prompt') || '';
    const savedModel = localStorage.getItem('elaris-ai-model') || 'gemini';

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
                        <option value="pollinations" ${savedModel === 'pollinations' ? 'selected' : ''}>Free (Pollinations AI)</option>
                        <option value="gemini" ${savedModel === 'gemini' ? 'selected' : ''}>Google Gemini (Imagen 3)</option>
                        <option value="fal" ${savedModel === 'fal' ? 'selected' : ''}>Fal AI (Flux Schnell)</option>
                        <option value="together" ${savedModel === 'together' ? 'selected' : ''}>Together AI (SDXL)</option>
                        <option value="replicate" ${savedModel === 'replicate' ? 'selected' : ''}>Replicate (Midjourney / Custom)</option>
                        <option value="openai" ${savedModel === 'openai' ? 'selected' : ''}>OpenAI (DALL-E 3)</option>
                    </select>
                </div>

                <div class="form-group" id="api-key-block" style="${savedModel === 'pollinations' ? 'display:none;' : ''}">
                    <label class="form-label" data-i18n="gen_api_key">API Key (Saved locally)</label>
                    <input type="password" id="api-key" class="form-input" value="${savedKey}" placeholder="Paste your API key here">
                </div>

                <div class="form-group">
                    <label class="form-label" data-i18n="gen_prompt">Image Prompt</label>
                    <textarea id="ai-prompt" class="form-textarea" style="min-height:120px;" placeholder="Describe your image...">${lastPrompt}</textarea>
                </div>

                <div class="form-group">
                    <label class="form-label" data-i18n="gen_ref">Reference Image (Optional)</label>
                    <input type="file" id="ai-ref-image" class="form-input" accept="image/*">
                </div>

                <button id="btn-generate-ai" class="btn btn-primary btn-lg" style="width:100%; margin-top:10px;">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/></svg>
                    <span data-i18n="gen_btn">Generate Image</span>
                </button>
            </div>

            <!-- Right Preview -->
            <div class="card" style="flex:1; min-width:300px; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:400px; background:var(--bg-tertiary);">
                <div id="ai-result-container" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:var(--radius-md);">
                    <p style="color:var(--text-muted); font-size:13px; text-align:center;">
                        Generated image will appear here.
                    </p>
                </div>
            </div>
        </div>
    `;

    // Apply translations immediately since the container just got new elements
    if (window.I18n) window.I18n.applyLanguage();

    // Event Listeners
    const btnGenerate = document.getElementById('btn-generate-ai');
    const resultContainer = document.getElementById('ai-result-container');
    const modelSelect = document.getElementById('ai-model');
    const apiKeyInput = document.getElementById('api-key');

    const apiKeyBlock = document.getElementById('api-key-block');

    // Save model and key changes
    modelSelect.addEventListener('change', (e) => {
        localStorage.setItem('elaris-ai-model', e.target.value);
        apiKeyBlock.style.display = e.target.value === 'pollinations' ? 'none' : 'block';
    });
    apiKeyInput.addEventListener('change', (e) => localStorage.setItem('elaris-api-key', e.target.value.trim()));

    btnGenerate.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        const prompt = document.getElementById('ai-prompt').value.trim();
        const model = modelSelect.value;
        const refImage = document.getElementById('ai-ref-image').files[0];

        if (!apiKey && model !== 'pollinations') {
            window.Elaris.toast('Please enter your API Key first.', 'error');
            return;
        }
        if (!prompt) {
            window.Elaris.toast('Please enter an image prompt.', 'error');
            return;
        }

        // Save preferences
        localStorage.setItem('elaris-api-key', apiKey);
        localStorage.setItem('elaris-last-prompt', prompt);

        // Show loading state
        btnGenerate.disabled = true;
        btnGenerate.innerHTML = `<div class="spinner" style="width:16px;height:16px;border-width:2px;margin-right:8px;"></div> Generating...`;
        resultContainer.innerHTML = `<div class="spinner"></div><p style="margin-top:16px;font-size:13px;">Calling ${modelSelect.options[modelSelect.selectedIndex].text}...</p>`;

        try {
            let imageUrl = '';

            if (model === 'pollinations') {
                imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
            } else if (model === 'gemini') {
                imageUrl = await generateWithGemini(prompt, apiKey);
            } else {
                // Mock integration for the others to show the UI works
                await new Promise(r => setTimeout(r, 2000));
                window.Elaris.toast(`${model.toUpperCase()} integration coming soon!`, 'info');
                throw new Error('API not fully implemented for this provider yet.');
            }

            resultContainer.innerHTML = `
                <img src="${imageUrl}" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:var(--radius-md); box-shadow:0 4px 20px rgba(0,0,0,0.5);">
            `;
            window.Elaris.toast('Image Generated Successfully! ⚡', 'success');

        } catch (error) {
            console.error('Generation failed:', error);
            window.Elaris.toast('Generation failed: ' + error.message, 'error');
            resultContainer.innerHTML = `<p style="color:#ff6b6b; font-size:13px; text-align:center;">Failed to generate.<br><span style="opacity:0.7">${error.message}</span></p>`;
        } finally {
            btnGenerate.disabled = false;
            btnGenerate.innerHTML = `
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/></svg>
                <span data-i18n="gen_btn">Generate Image</span>
            `;
            if (window.I18n) window.I18n.applyLanguage();
        }
    });
};

// Simple fetch wrapper for Gemini Imagen API
async function generateWithGemini(prompt, apiKey) {
    // Note: Google's official Generative Language API for images is relatively new.
    // For standard Gemini API (not Vertex), we hit models/imagen-3.0-generate-001
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;
    
    const payload = {
        instances: [
            { prompt: prompt }
        ],
        parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            outputOptions: { mimeType: "image/jpeg" }
        }
    };

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error?.message || 'API request failed');
    }

    if (data.predictions && data.predictions.length > 0 && data.predictions[0].bytesBase64Encoded) {
        return `data:image/jpeg;base64,${data.predictions[0].bytesBase64Encoded}`;
    } else {
        throw new Error('No image returned from API');
    }
}
