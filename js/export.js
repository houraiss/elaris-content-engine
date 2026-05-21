/**
 * export.js — Export utilities for Elaris Content Engine.
 *
 * Handles PNG download, caption text export, and copy-to-clipboard.
 */

const ElarisExport = {

    /**
     * Download the canvas as a PNG file.
     */
    async downloadPNG(engine, filename) {
        const blob = await engine.toBlob('image/png');
        if (!blob) return false;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || this._generateFilename('post', 'png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return true;
    },

    /**
     * Download caption text as a .txt file.
     */
    downloadCaption(text, filename) {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || this._generateFilename('caption', 'txt');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Copy text to clipboard.
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;left:-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            return true;
        }
    },

    /**
     * Download image + caption as a pair.
     */
    async downloadPair(engine, caption, baseName) {
        const name = baseName || this._generateBaseName();
        await this.downloadPNG(engine, `${name}.png`);
        if (caption) {
            this.downloadCaption(caption, `${name}_caption.txt`);
        }
    },

    /**
     * Generate a filename.
     */
    _generateFilename(type, ext) {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const rand = Math.random().toString(36).slice(2, 6);
        return `elaris_${type}_${date}_${rand}.${ext}`;
    },

    _generateBaseName() {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const rand = Math.random().toString(36).slice(2, 6);
        return `elaris_${date}_${rand}`;
    },
};

window.ElarisExport = ElarisExport;
