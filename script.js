document.addEventListener('DOMContentLoaded', () => {
    const presetsGrid = document.getElementById('presets-grid');
    const searchInput = document.getElementById('search-input');
    const categoryFilters = document.getElementById('category-filters');
    const loadingEl = document.getElementById('loading');
    const noResultsEl = document.getElementById('no-results');

    let allPresets = [];
    let activeCategory = 'Todos';
    const eqCache = {};

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

            // Arquivos e lógica de seleção
            let downloadActionsHtml = '';
            let defaultFile = '';

            if (preset.arquivos && Array.isArray(preset.arquivos) && preset.arquivos.length > 0) {
                defaultFile = preset.arquivos[0].url || preset.arquivos[0].arquivo;
                
                let optionsHtml = preset.arquivos.map((arq, index) => {
                    let nome = arq.nome || `Preset ${index + 1}`;
                    let url = arq.url || arq.arquivo;
                    return `<option value="${url}">${nome}</option>`;
                }).join('');

                downloadActionsHtml = `
                    <div class="preset-selector-container">
                        <select class="preset-selector">
                            ${optionsHtml}
                        </select>
                    </div>
                    <a href="${defaultFile}" download class="btn btn-download">Download</a>
                `;
            } else {
                defaultFile = preset.arquivo;
                downloadActionsHtml = `
                    <a href="${defaultFile}" download class="btn btn-download">Download Preset</a>
                `;
            }

            card.innerHTML = `
                ${imageHtml}
                <div class="preset-content">
                    ${categoryHtml}
                    <h3 class="preset-model">${preset.modelo}</h3>
                    ${tagsHtml}
                    <p class="preset-desc">${preset.descricao}</p>
                    <div class="preset-eq" data-arquivo="${defaultFile}"></div>
                    <div class="preset-actions">
                        ${downloadActionsHtml}
                    </div>
                </div>
            `;

            presetsGrid.appendChild(card);

            // Lógica do select (troca de preset on-the-fly)
            const selectEl = card.querySelector('.preset-selector');
            if (selectEl) {
                const downloadBtn = card.querySelector('.btn-download');
                const eqContainer = card.querySelector('.preset-eq');

                selectEl.addEventListener('change', (e) => {
                    const newFile = e.target.value;
                    downloadBtn.href = newFile;
                    eqContainer.setAttribute('data-arquivo', newFile);
                    loadEQData(newFile, eqContainer);
                });
            }
        });

        // Após renderizar os cards, buscar as barras de EQ
        presetsGrid.querySelectorAll('.preset-eq').forEach(container => {
            const arquivo = container.getAttribute('data-arquivo');
            if (arquivo) {
                loadEQData(arquivo, container);
            }
        });
    }

    // Função para carregar e parsear o arquivo .fac
    function loadEQData(arquivo, container) {
        if (eqCache[arquivo]) {
            drawEQ(eqCache[arquivo], container);
            return;
        }
        
        fetch(arquivo)
            .then(res => {
                if (!res.ok) throw new Error('Falha ao carregar');
                return res.text();
            })
            .then(text => {
                const lines = text.split('\n');
                const bands = [];
                
                lines.forEach(line => {
                    // Extrair bandas de EQ
                    if (line.includes(': Boost/Cut')) {
                        bands.push(parseFloat(line.split(':')[0].trim()));
                    }
                });

                eqCache[arquivo] = bands;
                drawEQ(bands, container);
            })
            .catch(err => {
                console.error('Erro ao ler EQ para ' + arquivo, err);
                if (container) container.innerHTML = '<span class="eq-error">EQ indisponível</span>';
            });
    }

    // Função para desenhar o gráfico vetorial (SVG) no container
    function drawEQ(bands, container) {
        if (!bands || bands.length === 0) {
            container.innerHTML = '';
            return;
        }

        // Descobre o máximo e mínimo reais do preset
        let maxB = Math.max(...bands);
        let minB = Math.min(...bands);
        
        // Se a variação for muito pequena, força um range mínimo para não ficar uma linha reta esticada
        if (maxB - minB < 4) {
            const mid = (maxB + minB) / 2;
            maxB = mid + 2;
            minB = mid - 2;
        }
        
        const range = maxB - minB;
        // Padding para a linha não encostar nas bordas do SVG
        const paddedMax = maxB + range * 0.3; 
        const paddedMin = minB - range * 0.1; // Menos padding embaixo para dar sensação de preenchimento
        const totalRange = paddedMax - paddedMin || 1;

        const width = 300;
        const height = 100;
        const stepX = width / (bands.length - 1);

        let points = [];
        let html = `<div class="eq-svg-container" title="Curva de Equalização">
                    <svg viewBox="-10 0 ${width + 20} ${height}" class="eq-svg" preserveAspectRatio="none">`;
        
        // Linhas de grade verticais
        bands.forEach((_, i) => {
            const x = i * stepX;
            html += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="rgba(255,255,255,0.05)" stroke-width="1" stroke-dasharray="4" />`;
        });

        // 1. Calcula as coordenadas exatas de cada ponto
        bands.forEach((val, i) => {
            const x = i * stepX;
            // No SVG, o Y=0 é o topo, logo invertemos o valor
            const y = height - ((val - paddedMin) / totalRange) * height;
            points.push({x, y, val});
        });

        const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');
        
        // 2. Define o gradiente vermelho
        const uniqueId = container.dataset.arquivo.replace(/[^a-zA-Z0-9]/g, '');
        html += `<defs>
                    <linearGradient id="grad-${uniqueId}" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="rgba(230, 32, 32, 0.4)" />
                        <stop offset="100%" stop-color="rgba(230, 32, 32, 0.0)" />
                    </linearGradient>
                 </defs>`;

        // 3. Área preenchida com gradiente (Polygon do chão até a curva)
        html += `<polygon points="0,${height} ${pointsStr} ${width},${height}" fill="url(#grad-${uniqueId})" />`;
        
        // 4. A linha da curva (Polyline)
        html += `<polyline points="${pointsStr}" fill="none" stroke="var(--accent-red)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="eq-line" />`;

        // 5. Os pontos (Bolinhas) e os valores em texto
        points.forEach((p, i) => {
            html += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--bg-secondary)" stroke="var(--accent-red)" stroke-width="2" class="eq-point" />`;
        });

        html += `</svg></div>`;
        container.innerHTML = html;
    }

    // Construir botões de categoria dinamicamente
    function buildCategoryFilters(presets) {
        // Ordem forçada requerida pelo usuário
        const orderMap = {
            "In-Ear Com Fio": 1,
            "In-Ear Wireless 2.4GHz": 2,
            "Headset Wireless": 3,
            "Home Theater 5.1 / Estéreo": 4
        };

        // Extrai as categorias de forma única, ignorando os campos vazios e ordenando com o orderMap
        const categories = ['Todos', ...Array.from(new Set(presets.map(p => p.categoria).filter(Boolean))).sort((a, b) => {
            return (orderMap[a] || 99) - (orderMap[b] || 99);
        })];
        
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
