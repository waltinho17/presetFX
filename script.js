document.addEventListener('DOMContentLoaded', () => {
    const presetsGrid = document.getElementById('presets-grid');
    const searchInput = document.getElementById('search-input');
    const categoryFilters = document.getElementById('category-filters');
    const loadingEl = document.getElementById('loading');
    const noResultsEl = document.getElementById('no-results');

    let allPresets = [];
    let activeCategory = 'Todos';

    // Busca os dados do JSON
    fetch('presets.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao carregar o presets.json');
            }
            return response.json();
        })
        .then(data => {
            allPresets = data;
            loadingEl.classList.add('hidden');
            buildCategoryFilters(allPresets);
            applyFilters();
        })
        .catch(error => {
            console.error('Erro:', error);
            loadingEl.textContent = 'Erro ao carregar os presets. Verifique se presets.json existe e é válido.';
        });

    // Função para renderizar os cards na tela
    function renderPresets(presets) {
        presetsGrid.innerHTML = '';
        
        if (presets.length === 0) {
            noResultsEl.classList.remove('hidden');
            return;
        } else {
            noResultsEl.classList.add('hidden');
        }

        presets.forEach(preset => {
            const card = document.createElement('div');
            card.className = 'preset-card';

            let imageHtml = '';
            if (preset.imagem) {
                imageHtml = `<div class="preset-image-container">
                                <img src="${preset.imagem}" class="preset-image" alt="${preset.modelo}">
                             </div>`;
            }

            // Categoria
            let categoryHtml = '';
            if (preset.categoria) {
                categoryHtml = `<span class="preset-category">${preset.categoria}</span>`;
            }

            // Montagem das tags (ex: FPS, Música, etc.)
            let tagsHtml = '';
            if (preset.tags && Array.isArray(preset.tags)) {
                tagsHtml = `<div class="preset-tags">
                    ${preset.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>`;
            }

            card.innerHTML = `
                ${imageHtml}
                <div class="preset-content">
                    ${categoryHtml}
                    <h3 class="preset-model">${preset.modelo}</h3>
                    ${tagsHtml}
                    <p class="preset-desc">${preset.descricao}</p>
                    <div class="preset-actions">
                        <a href="${preset.arquivo}" download class="btn btn-download">Download Preset</a>
                    </div>
                </div>
            `;

            presetsGrid.appendChild(card);
        });
    }

    // Construir botões de categoria dinamicamente
    function buildCategoryFilters(presets) {
        // Extrai as categorias de forma única, ignorando os campos vazios
        const categories = ['Todos', ...new Set(presets.map(p => p.categoria).filter(Boolean))];
        
        categoryFilters.innerHTML = '';
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `btn-filter ${cat === activeCategory ? 'active' : ''}`;
            btn.textContent = cat;
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = cat;
                applyFilters();
            });
            
            categoryFilters.appendChild(btn);
        });
    }

    // Função única unindo filtro de texto e filtro de categoria
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        
        const filteredPresets = allPresets.filter(preset => {
            // Filtro de texto
            const matchModelo = preset.modelo.toLowerCase().includes(searchTerm);
            const matchDesc = preset.descricao.toLowerCase().includes(searchTerm);
            const matchCategoryText = preset.categoria && preset.categoria.toLowerCase().includes(searchTerm);
            const matchTags = preset.tags ? preset.tags.some(tag => tag.toLowerCase().includes(searchTerm)) : false;
            const matchesSearch = matchModelo || matchDesc || matchCategoryText || matchTags;

            // Filtro do botão de Categoria
            const matchesCatButton = (activeCategory === 'Todos') || (preset.categoria === activeCategory);
            
            return matchesSearch && matchesCatButton;
        });

        renderPresets(filteredPresets);
    }

    // Eventos
    searchInput.addEventListener('input', applyFilters);
});
