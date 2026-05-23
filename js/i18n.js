const translations = {
    en: {
        nav_create: "Create",
        nav_promptstudio: "Prompt Studio",
        nav_generate: "Generate",
        nav_enhance: "Enhance",
        nav_composer: "Composer",
        nav_templates: "Templates",
        nav_captions: "Captions",
        nav_manage: "Manage",
        nav_trends: "Trends",
        nav_batch: "Batch Mode",
        nav_watermark: "Watermark",
        theme_dark: "Dark",
        theme_light: "Light",
        pwa_install_title: "Install Elaris",
        pwa_install_desc: "Use offline on your phone",
        pwa_install_btn: "Install",
        gen_title: "Generate AI Assets",
        gen_subtitle: "Turn your prompts into high-quality images via API",
        gen_model: "Select AI Model",
        gen_api_key: "API Key (Saved locally)",
        gen_prompt: "Image Prompt",
        gen_ref: "Reference Image (Optional)",
        gen_btn: "Generate Image",
        ps_title: "Prompt Studio",
        ps_subtitle: "Generate editorial prompts - paste into Gemini, Midjourney, or any AI tool",
        enh_title: "Enhance",
        enh_subtitle: "AI-powered photo transformation - drop raw shots, get professional imagery",
        comp_title: "Composer",
        comp_subtitle: "Upload photos, pick a template, create content",
        tpl_title: "Templates",
        tpl_subtitle: "Browse all available content templates"
    },
    fr: {
        nav_create: "Créer",
        nav_promptstudio: "Studio Prompt",
        nav_generate: "Générer",
        nav_enhance: "Améliorer",
        nav_composer: "Compositeur",
        nav_templates: "Modèles",
        nav_captions: "Légendes",
        nav_manage: "Gérer",
        nav_trends: "Tendances",
        nav_batch: "Mode Lot",
        nav_watermark: "Filigrane",
        theme_dark: "Sombre",
        theme_light: "Clair",
        pwa_install_title: "Installer Elaris",
        pwa_install_desc: "Utiliser hors ligne sur votre téléphone",
        pwa_install_btn: "Installer",
        gen_title: "Générer des Images",
        gen_subtitle: "Transformez vos prompts en images via API",
        gen_model: "Modèle d'IA",
        gen_api_key: "Clé API (Sauvegardée localement)",
        gen_prompt: "Prompt",
        gen_ref: "Image de Référence (Optionnelle)",
        gen_btn: "Générer l'Image",
        ps_title: "Studio Prompt",
        ps_subtitle: "Générez des prompts éditoriaux - copiez vers Gemini, Midjourney, etc.",
        enh_title: "Améliorer",
        enh_subtitle: "Transformation IA - déposez vos photos brutes, obtenez des images pro",
        comp_title: "Compositeur",
        comp_subtitle: "Uploadez des photos, choisissez un modèle, créez",
        tpl_title: "Modèles",
        tpl_subtitle: "Parcourir tous les modèles de contenu"
    },
    ar: {
        nav_create: "إنشاء",
        nav_promptstudio: "ستوديو الموجهات",
        nav_generate: "توليد",
        nav_enhance: "تحسين",
        nav_composer: "المؤلف",
        nav_templates: "قوالب",
        nav_captions: "تسميات توضيحية",
        nav_manage: "إدارة",
        nav_trends: "تريندات",
        nav_batch: "الوضع المجمع",
        nav_watermark: "علامة مائية",
        theme_dark: "داكن",
        theme_light: "فاتح",
        pwa_install_title: "تثبيت Elaris",
        pwa_install_desc: "استخدمه بدون إنترنت على هاتفك",
        pwa_install_btn: "تثبيت",
        gen_title: "توليد الصور",
        gen_subtitle: "حول موجهاتك إلى صور عالية الجودة عبر API",
        gen_model: "اختر نموذج الذكاء الاصطناعي",
        gen_api_key: "مفتاح API (محفوظ محلياً)",
        gen_prompt: "موجه الصورة",
        gen_ref: "صورة مرجعية (اختياري)",
        gen_btn: "توليد الصورة",
        ps_title: "ستوديو الموجهات",
        ps_subtitle: "توليد موجهات احترافية - انسخها إلى Gemini أو Midjourney أو غيره",
        enh_title: "تحسين",
        enh_subtitle: "تحويل الصور بالذكاء الاصطناعي - ارفع صور خام، احصل على احترافية",
        comp_title: "المؤلف",
        comp_subtitle: "ارفع صورك، اختر قالباً، وابدأ بإنشاء المحتوى",
        tpl_title: "قوالب",
        tpl_subtitle: "تصفح جميع قوالب المحتوى المتاحة"
    }
};

class I18nManager {
    constructor() {
        this.lang = localStorage.getItem('elaris-lang') || 'en';
        this.applyLanguage();
    }

    setLanguage(lang) {
        if (!translations[lang]) return;
        this.lang = lang;
        localStorage.setItem('elaris-lang', lang);
        this.applyLanguage();
    }

    t(key) {
        return translations[this.lang][key] || translations['en'][key] || key;
    }

    applyLanguage() {
        document.documentElement.lang = this.lang;
        document.documentElement.dir = this.lang === 'ar' ? 'rtl' : 'ltr';
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.placeholder) el.placeholder = this.t(key);
            } else {
                el.textContent = this.t(key);
            }
        });
        
        // Update document title if needed, or trigger events
        window.dispatchEvent(new Event('languagechange'));
    }
}

window.I18n = new I18nManager();
