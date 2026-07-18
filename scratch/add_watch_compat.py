"""
Add Product selector (Silver / Watch) to Prompt Studio and Motion Studio.
- Adds 'product' state field ('silver' default)
- Adds Product selector UI above Category
- Hides Category + Material when product === 'watch'
- Modifies prompt builder: when watch is selected, uses 'watch' as the piece
  instead of material + category, and skips silver-specific descriptors
- Removes 'watch' from categories array (it's now a product, not a category)
- Adds event binding for the new Product selector
"""
import re

# ═══════════════════════════════════════════════════════════════
# 1. PROMPT STUDIO
# ═══════════════════════════════════════════════════════════════
filepath = r'c:\Users\User\Default Project\elaris-content-engine\js\prompt-studio.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# ── 1a. Revert categories: remove 'watch' (it's now a product type, not a category)
content = content.replace(
    "categories: ['ring','necklace','earrings','bracelet','bangles','anklet','brooch','pendant','body-jewelry','watch'],",
    "categories: ['ring','necklace','earrings','bracelet','bangles','anklet','brooch','pendant','body-jewelry'],"
)
content = content.replace(
    "// ── Jewelry & Watch Categories ──────────────────────",
    "// ── Jewelry Categories ──────────────────────"
)

# ── 1b. Add 'product' to state (after pieceDesc line)
content = content.replace(
    "    state: {\n        pieceDesc: '',\n        category: 'ring',",
    "    state: {\n        product: 'silver',     // 'silver' | 'watch'\n        pieceDesc: '',\n        category: 'ring',",
    1
)
# Handle \r\n line endings too
content = content.replace(
    "    state: {\r\n        pieceDesc: '',\r\n        category: 'ring',",
    "    state: {\r\n        product: 'silver',     // 'silver' | 'watch'\r\n        pieceDesc: '',\r\n        category: 'ring',",
    1
)

# ── 1c. Add Product selector UI above Category in the template
# Find the Category form-group and add Product selector before it
old_category_block = '''                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_category">Category</label>
                            <select class="form-select" id="ps-category">
                                ${this.categories.map(c => `<option value="${c}" data-i18n="ps_cat_${c.replace(/-/g, '_')}" ${c === this.state.category ? 'selected' : ''}>${c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}</option>`).join('')}
                            </select>
                        </div>'''

new_product_and_category = '''                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_product">Product</label>
                            <select class="form-select" id="ps-product">
                                <option value="silver" data-i18n="ps_product_silver" ${this.state.product === 'silver' ? 'selected' : ''}>Silver</option>
                                <option value="watch" data-i18n="ps_product_watch" ${this.state.product === 'watch' ? 'selected' : ''}>Watch</option>
                            </select>
                        </div>
                        <div class="form-group" id="ps-category-group" style="${this.state.product === 'watch' ? 'display:none' : ''}">
                            <label class="form-label" data-i18n="ps_category">Category</label>
                            <select class="form-select" id="ps-category">
                                ${this.categories.map(c => `<option value="${c}" data-i18n="ps_cat_${c.replace(/-/g, '_')}" ${c === this.state.category ? 'selected' : ''}>${c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}</option>`).join('')}
                            </select>
                        </div>'''

content = content.replace(old_category_block, new_product_and_category)

# ── 1d. Wrap Material in a hideable div
old_material_block = '''                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_material">Material</label>
                            <select class="form-select" id="ps-material">
                                ${this.materials.map(m => `<option value="${m.id}" data-i18n="ps_mat_${m.id.replace(/-/g, '_')}" ${m.id === this.state.material ? 'selected' : ''}>${m.label}</option>`).join('')}
                            </select>
                        </div>'''

new_material_block = '''                        <div class="form-group" id="ps-material-group" style="${this.state.product === 'watch' ? 'display:none' : ''}">
                            <label class="form-label" data-i18n="ps_material">Material</label>
                            <select class="form-select" id="ps-material">
                                ${this.materials.map(m => `<option value="${m.id}" data-i18n="ps_mat_${m.id.replace(/-/g, '_')}" ${m.id === this.state.material ? 'selected' : ''}>${m.label}</option>`).join('')}
                            </select>
                        </div>'''

content = content.replace(old_material_block, new_material_block)

# ── 1e. Add event binding for Product selector
# Insert after the _bind() function start, right before the category event listener
old_bind = """        q('#ps-category').addEventListener('change', e => {"""

new_bind = """        // Product selector — toggle Category + Material visibility
        q('#ps-product').addEventListener('change', e => {
            this.state.product = e.target.value;
            const isWatch = e.target.value === 'watch';
            const catGroup = q('#ps-category-group');
            const matGroup = q('#ps-material-group');
            if (catGroup) catGroup.style.display = isWatch ? 'none' : '';
            if (matGroup) matGroup.style.display = isWatch ? 'none' : '';
            this._renderArchetypeGrid();
        });
        q('#ps-category').addEventListener('change', e => {"""

content = content.replace(old_bind, new_bind)

# ── 1f. Modify _buildPrompt: when product is 'watch', use different piece label and skip silver descriptors
# Replace the piece label building section
old_piece_build = """        const material = this.materials.find(m => m.id === this.state.material)?.label || '925 sterling silver';
        const catLabels = {
            'ring': 'ring', 'necklace': 'necklace', 'earring': 'earrings',
            'bracelet': 'bracelet', 'bangle': 'bangle', 'anklet': 'anklet',
            'pendant': 'pendant', 'brooch': 'brooch',
        };
        const catWord = catLabels[this.state.category] || this.state.category;
        // Strip jewelry type words so wrong category can't bleed in
        const _typeWords = 'ring|rings|necklace|necklaces|earring|earrings|bracelet|bracelets|bangle|bangles|anklet|anklets|pendant|pendants|brooch|brooches|brooche';
        // Strip material text the user may have typed manually
        const _matWords = '925\\\\s*sterling\\\\s*silver|sterling\\\\s*silver|18k\\\\s*gold|14k\\\\s*gold|rose\\\\s*gold|yellow\\\\s*gold|white\\\\s*gold|platinum|\\\\b925\\\\b';
        let _rawDesc = this.state.pieceDesc || '';
        _rawDesc = _rawDesc.replace(new RegExp('\\\\b(' + _typeWords + ')\\\\b', 'gi'), '');
        _rawDesc = _rawDesc.replace(new RegExp('(' + _matWords + ')', 'gi'), '');
        _rawDesc = _rawDesc.replace(/\\s+/g, ' ').trim();
        // piece = "925 Sterling Silver ring with diamonds accents" (always correct type)
        const piece = _rawDesc ? `${material} ${catWord} ${_rawDesc}` : `${material} ${catWord}`;"""

new_piece_build = """        // ── Product-aware piece label ──────────────────────
        const isWatchProduct = this.state.product === 'watch';
        const material = isWatchProduct ? '' : (this.materials.find(m => m.id === this.state.material)?.label || '925 sterling silver');
        const catLabels = {
            'ring': 'ring', 'necklace': 'necklace', 'earring': 'earrings',
            'bracelet': 'bracelet', 'bangle': 'bangle', 'anklet': 'anklet',
            'pendant': 'pendant', 'brooch': 'brooch',
        };
        const catWord = isWatchProduct ? 'watch' : (catLabels[this.state.category] || this.state.category);
        // Strip jewelry type words so wrong category can't bleed in
        const _typeWords = 'ring|rings|necklace|necklaces|earring|earrings|bracelet|bracelets|bangle|bangles|anklet|anklets|pendant|pendants|brooch|brooches|brooche|watch|watches';
        // Strip material text the user may have typed manually
        const _matWords = '925\\\\s*sterling\\\\s*silver|sterling\\\\s*silver|18k\\\\s*gold|14k\\\\s*gold|rose\\\\s*gold|yellow\\\\s*gold|white\\\\s*gold|platinum|\\\\b925\\\\b';
        let _rawDesc = this.state.pieceDesc || '';
        _rawDesc = _rawDesc.replace(new RegExp('\\\\b(' + _typeWords + ')\\\\b', 'gi'), '');
        _rawDesc = _rawDesc.replace(new RegExp('(' + _matWords + ')', 'gi'), '');
        _rawDesc = _rawDesc.replace(/\\s+/g, ' ').trim();
        // piece = "925 Sterling Silver ring with diamonds accents" OR "luxury watch" for watch product
        const piece = isWatchProduct
            ? (_rawDesc ? `luxury watch ${_rawDesc}` : 'luxury watch')
            : (_rawDesc ? `${material} ${catWord} ${_rawDesc}` : `${material} ${catWord}`);"""

content = content.replace(old_piece_build, new_piece_build)

# ── 1g. Make silver descriptor conditional (skip for watches)
old_silver_desc = """        // ── Silver-specific material descriptors ──────────────────────
        const silverDesc = this.state.material === '800-silver'
            ? 'warm oxidized patina, traditional Moroccan silverwork texture, hand-hammered artisanal finish'
            : 'rhodium-plated sheen, mirror-polished surface, brilliant metallic luster';"""

new_silver_desc = """        // ── Silver-specific material descriptors (skipped for watches) ──────────────────────
        const silverDesc = isWatchProduct
            ? 'precision timepiece, polished case and crystal, refined dial detail, luxury watch craftsmanship'
            : (this.state.material === '800-silver'
                ? 'warm oxidized patina, traditional Moroccan silverwork texture, hand-hammered artisanal finish'
                : 'rhodium-plated sheen, mirror-polished surface, brilliant metallic luster');"""

content = content.replace(old_silver_desc, new_silver_desc)

# ── 1h. Make the material line in bodyParts conditional for watches
old_material_line = """            // MATERIAL — stated once, cleanly, with metal descriptor
            `${material}, ${silverDesc}.`,"""

new_material_line = """            // MATERIAL — stated once, cleanly, with metal descriptor (watch: skip material, use watch descriptor)
            isWatchProduct ? `${silverDesc}.` : `${material}, ${silverDesc}.`,"""

content = content.replace(old_material_line, new_material_line)

# ── 1i. Update archetype scoring to use 'watch' compat when product is watch
old_score = """        const cat     = state.category || 'ring';
        const isHuman = HUMAN.has(archetype.id);

        // Base score from category compatibility table
        let score = (archetype.compat && archetype.compat[cat]) || 50;"""

new_score = """        const cat     = state.product === 'watch' ? 'watch' : (state.category || 'ring');
        const isHuman = HUMAN.has(archetype.id);

        // Base score from category compatibility table
        let score = (archetype.compat && archetype.compat[cat]) || 50;"""

content = content.replace(old_score, new_score)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ prompt-studio.js updated successfully")


# ═══════════════════════════════════════════════════════════════
# 2. MOTION STUDIO
# ═══════════════════════════════════════════════════════════════
filepath2 = r'c:\Users\User\Default Project\elaris-content-engine\js\motion-studio.js'

with open(filepath2, 'r', encoding='utf-8') as f:
    content2 = f.read()

# ── 2a. Revert categories: remove 'watch'
content2 = content2.replace(
    "categories: ['ring','necklace','earrings','bracelet','bangles','anklet','brooch','pendant','body-jewelry','watch'],",
    "categories: ['ring','necklace','earrings','bracelet','bangles','anklet','brooch','pendant','body-jewelry'],"
)
content2 = content2.replace(
    "// ── Jewelry & Watch Categories (same as PromptStudio) ──────────────────────",
    "// ── Jewelry Categories (same as PromptStudio) ──────────────────────"
)

with open(filepath2, 'w', encoding='utf-8') as f:
    f.write(content2)

print("✅ motion-studio.js updated successfully")


# ═══════════════════════════════════════════════════════════════
# 3. i18n
# ═══════════════════════════════════════════════════════════════
filepath3 = r'c:\Users\User\Default Project\elaris-content-engine\js\i18n.js'

with open(filepath3, 'r', encoding='utf-8') as f:
    content3 = f.read()

# ── 3a. English: add product labels before ps_category
content3 = content3.replace(
    '        ps_category: "Category",',
    '        ps_product: "Product",\n        ps_product_silver: "Silver",\n        ps_product_watch: "Watch",\n        ps_category: "Category",'
)

# ── 3b. Remove the ps_cat_watch entry we added earlier (English)
content3 = content3.replace(
    '        ps_cat_watch: "Watch",\n', ''
)

# ── 3c. French: add product labels
# Find the French ps_category
content3 = content3.replace(
    '        ps_category: "Catégorie",',
    '        ps_product: "Produit",\n        ps_product_silver: "Argent",\n        ps_product_watch: "Montre",\n        ps_category: "Catégorie",'
)
# Also try without accent (in case encoding differs)
content3 = content3.replace(
    '        ps_category: "Cat\u00e9gorie",',
    '        ps_product: "Produit",\n        ps_product_silver: "Argent",\n        ps_product_watch: "Montre",\n        ps_category: "Cat\u00e9gorie",'
)

# Remove French ps_cat_watch
content3 = content3.replace(
    '        ps_cat_watch: "Montre",\n', ''
)

# ── 3d. Arabic: add product labels
content3 = content3.replace(
    '        ps_category: "\u0627\u0644\u0641\u0626\u0629",',
    '        ps_product: "\u0627\u0644\u0645\u0646\u062a\u062c",\n        ps_product_silver: "\u0641\u0636\u0629",\n        ps_product_watch: "\u0633\u0627\u0639\u0629",\n        ps_category: "\u0627\u0644\u0641\u0626\u0629",'
)

# Remove Arabic ps_cat_watch
content3 = content3.replace(
    '        ps_cat_watch: "\u0633\u0627\u0639\u0629",\n', ''
)

with open(filepath3, 'w', encoding='utf-8') as f:
    f.write(content3)

print("✅ i18n.js updated successfully")
print("\nAll files updated. Ready to commit and push.")
