
// ═══════════════════════════════════════════════════════════
// PROMPT STUDIO ROUTER (TABS)
// ═══════════════════════════════════════════════════════════

window.render_promptstudio = function(container) {
    container.innerHTML = `
        <div class="ps-tabs">
            <button class="btn active" id="ps-tab-classic">Classic Mode</button>
            <button class="btn" id="ps-tab-expanded">Expanded Mode</button>
        </div>
        <div id="ps-container-classic" style="display: block;"></div>
        <div id="ps-container-expanded" style="display: none;"></div>
    `;

    const classicContainer = document.getElementById('ps-container-classic');
    const expandedContainer = document.getElementById('ps-container-expanded');
    const tabClassic = document.getElementById('ps-tab-classic');
    const tabExpanded = document.getElementById('ps-tab-expanded');

    // Initialize both
    PromptStudio.init(classicContainer);
    ExpandedPromptStudio.init(expandedContainer);

    // Tab switching logic
    tabClassic.addEventListener('click', () => {
        tabClassic.classList.add('active');
        tabExpanded.classList.remove('active');
        classicContainer.style.display = 'block';
        expandedContainer.style.display = 'none';
    });

    tabExpanded.addEventListener('click', () => {
        tabExpanded.classList.add('active');
        tabClassic.classList.remove('active');
        expandedContainer.style.display = 'block';
        classicContainer.style.display = 'none';
    });
};
