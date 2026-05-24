const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'i18n.js');
let code = fs.readFileSync(filePath, 'utf8');

const newEnKeys = `
        enh_creative_dir: "Creative Directions",
        enh_creative_desc: "Drop photos in input/ folder, then tell Antigravity which direction to use.",
        enh_photos: "Enhanced Photos",
        enh_refresh: "↻ Refresh",
        enh_load_photo: "Load enhanced photo",
        enh_drop_touchup: "or drop to touch-up manually",
        enh_workflow_title: "AI Enhancement Workflow",
        enh_workflow_desc: "1. Drop raw photos in input/\\n2. Tell Antigravity the direction\\n3. Enhanced photos appear here\\n4. Touch-up → Send to Composer",
        enh_reset: "↺ Reset Tweaks",
        enh_use_composer: "Use in Composer →",
        enh_download: "⬇ Download",
        enh_no_photos: "No enhanced photos yet — run the pipeline first",

        comp_upload: "+ Upload",
        comp_drop_photos: "Drop photos here",
        comp_browse: "or click to browse",
        comp_photo: "Photo",
        comp_scale: "Scale",
        comp_brightness: "Brightness",
        comp_contrast: "Contrast",
        comp_saturation: "Saturation",
        comp_text_title: "Text",
        comp_headline: "Headline",
        comp_headline_ph: "Product name...",
        comp_subtitle_lbl: "Subtitle",
        comp_subtitle_ph: "925 Sterling Silver",
        comp_logo: "Logo",
        comp_pos: "Position",
        comp_br: "Bottom Right",
        comp_bl: "Bottom Left",
        comp_tr: "Top Right",
        comp_tl: "Top Left",
        comp_center: "Center",
        comp_size: "Size",
        comp_opacity: "Opacity",
        comp_bg: "Background",
        comp_color: "Color",
        comp_caption_title: "Caption",
        comp_gen_cap: "✦ Generate",
        comp_voice_lux: "Luxury",
        comp_voice_cas: "Casual",
        comp_voice_story: "Story",
        comp_prod_type: "Product Type",
        comp_pt_gen: "General",
        comp_pt_ring: "Ring",
        comp_pt_neck: "Necklace",
        comp_pt_brace: "Bracelet",
        comp_pt_ear: "Earrings",
`;

const newFrKeys = `
        enh_creative_dir: "Directions Créatives",
        enh_creative_desc: "Déposez les photos dans le dossier input/ puis indiquez à Antigravity quelle direction utiliser.",
        enh_photos: "Photos Améliorées",
        enh_refresh: "↻ Rafraîchir",
        enh_load_photo: "Charger une photo améliorée",
        enh_drop_touchup: "ou déposez pour retoucher manuellement",
        enh_workflow_title: "Flux de Travail d'Amélioration IA",
        enh_workflow_desc: "1. Déposez des photos brutes...\\n2. Indiquez à Antigravity...\\n3. Les photos améliorées apparaissent ici\\n4. Retouchez → Envoyez à Composer",
        enh_reset: "↺ Réinitialiser les Ajustements",
        enh_use_composer: "Utiliser dans Composer →",
        enh_download: "⬇ Télécharger",
        enh_no_photos: "Aucune photo améliorée pour le moment — exécutez d'abord le pipeline",

        comp_upload: "+ Uploader",
        comp_drop_photos: "Déposez les photos ici",
        comp_browse: "ou cliquez pour parcourir",
        comp_photo: "Photo",
        comp_scale: "Échelle",
        comp_brightness: "Luminosité",
        comp_contrast: "Contraste",
        comp_saturation: "Saturation",
        comp_text_title: "Texte",
        comp_headline: "Titre",
        comp_headline_ph: "Nom du produit...",
        comp_subtitle_lbl: "Sous-titre",
        comp_subtitle_ph: "Argent Sterling 925",
        comp_logo: "Logo",
        comp_pos: "Position",
        comp_br: "Bas Droite",
        comp_bl: "Bas Gauche",
        comp_tr: "Haut Droite",
        comp_tl: "Haut Gauche",
        comp_center: "Centre",
        comp_size: "Taille",
        comp_opacity: "Opacité",
        comp_bg: "Arrière-plan",
        comp_color: "Couleur",
        comp_caption_title: "Légende",
        comp_gen_cap: "✦ Générer",
        comp_voice_lux: "Luxe",
        comp_voice_cas: "Décontracté",
        comp_voice_story: "Histoire",
        comp_prod_type: "Type de Produit",
        comp_pt_gen: "Général",
        comp_pt_ring: "Bague",
        comp_pt_neck: "Collier",
        comp_pt_brace: "Bracelet",
        comp_pt_ear: "Boucles d'oreilles",
`;

const newArKeys = \`
        enh_creative_dir: "الاتجاهات الإبداعية",
        enh_creative_desc: "أسقط الصور في مجلد input/ ثم أخبر Antigravity بالاتجاه الذي يجب استخدامه.",
        enh_photos: "الصور المحسنة",
        enh_refresh: "↻ تحديث",
        enh_load_photo: "تحميل صورة محسنة",
        enh_drop_touchup: "أو أسقطها للتعديل يدوياً",
        enh_workflow_title: "سير عمل تحسين الذكاء الاصطناعي",
        enh_workflow_desc: "1. أسقط الصور الخام...\\n2. أخبر Antigravity...\\n3. تظهر الصور المحسنة هنا\\n4. التعديل → الإرسال إلى Composer",
        enh_reset: "↺ إعادة ضبط التعديلات",
        enh_use_composer: "استخدم في Composer →",
        enh_download: "⬇ تحميل",
        enh_no_photos: "لا توجد صور محسنة بعد — قم بتشغيل المعالجة أولاً",

        comp_upload: "+ رفع",
        comp_drop_photos: "أسقط الصور هنا",
        comp_browse: "أو انقر للتصفح",
        comp_photo: "صورة",
        comp_scale: "مقياس",
        comp_brightness: "سطوع",
        comp_contrast: "تباين",
        comp_saturation: "تشبع",
        comp_text_title: "نص",
        comp_headline: "عنوان",
        comp_headline_ph: "اسم المنتج...",
        comp_subtitle_lbl: "عنوان فرعي",
        comp_subtitle_ph: "فضة إسترليني 925",
        comp_logo: "شعار",
        comp_pos: "موضع",
        comp_br: "أسفل اليمين",
        comp_bl: "أسفل اليسار",
        comp_tr: "أعلى اليمين",
        comp_tl: "أعلى اليسار",
        comp_center: "مركز",
        comp_size: "حجم",
        comp_opacity: "شفافية",
        comp_bg: "خلفية",
        comp_color: "لون",
        comp_caption_title: "وصف",
        comp_gen_cap: "✦ توليد",
        comp_voice_lux: "فاخر",
        comp_voice_cas: "غير رسمي",
        comp_voice_story: "قصة",
        comp_prod_type: "نوع المنتج",
        comp_pt_gen: "عام",
        comp_pt_ring: "خاتم",
        comp_pt_neck: "قلادة",
        comp_pt_brace: "سوار",
        comp_pt_ear: "أقراط",
\`;

// Insert EN
let matchEn = code.match(/en: \\{[\\s\\S]*?comp_export_all: "📦 Export All",/);
if (matchEn) {
    code = code.replace(matchEn[0], matchEn[0] + '\\n' + newEnKeys);
}

// Insert FR
let matchFr = code.match(/fr: \\{[\\s\\S]*?comp_export_all: "📦 Tout Exporter",/);
if (matchFr) {
    code = code.replace(matchFr[0], matchFr[0] + '\\n' + newFrKeys);
}

// Insert AR
let matchAr = code.match(/ar: \\{[\\s\\S]*?comp_export_all: "📦 ????? ??????",/);
if (matchAr) {
    code = code.replace(matchAr[0], matchAr[0] + '\\n' + newArKeys);
} else {
    // If exact regex fails due to corrupted arabic match, we can just insert before the end of the AR block.
    // The ar block ends with "wm_guide_l4: ...." and then "\\n    }\\n};\\n\\nwindow.I18n"
    code = code.replace(/wm_guide_l4:[^\\n]+/, match => match + ',\\n' + newArKeys);
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated i18n.js');
