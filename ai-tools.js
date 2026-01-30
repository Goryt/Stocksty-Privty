// AI Tools Functions
let aiRecommendations = [];

function initializeAITools() {
    loadAIRecommendations();
}

function loadAIRecommendations() {
    aiRecommendations = loadFromLocalStorage('ai_recommendations', []);
    
    // If no recommendations, create sample ones
    if (aiRecommendations.length === 0) {
        aiRecommendations = createSampleAIRecommendations();
        saveAIRecommendations();
    }
}

function createSampleAIRecommendations() {
    return [
        {
            id: generateId(),
            type: 'business_idea',
            title: 'Bisnis Kopi Keliling',
            content: 'Bisnis kopi keliling memiliki potensi besar dengan modal kecil. Target pasar: karyawan, sopir angkot, warga yang sibuk. Keuntungan bisa mencapai 60-70% per cangkir.',
            category: 'minuman',
            priority: 'high',
            created_at: new Date().toISOString()
        },
        {
            id: generateId(),
            type: 'recipe',
            title: 'Resep Nasi Goreng Seafood',
            content: 'Video tutorial lengkap: https://youtube.com/watch?v=sample1. Bahan: nasi putih, udang, cumi, telur, bawang putih, kecap manis. HPP per porsi: Rp 8.000, harga jual: Rp 18.000',
            category: 'makanan',
            priority: 'medium',
            created_at: new Date().toISOString()
        },
        {
            id: generateId(),
            title: 'Analisis Pasar Snack',
            content: 'Tren snack healthy sedang naik. Produk seperti kripik talas, kripik pisang, dan makaroni pedas sangat dicari. Margin bisa mencapai 80%. Target: anak muda dan ibu-ibu.',
            type: 'market_analysis',
            category: 'snack',
            priority: 'high',
            created_at: new Date().toISOString()
        }
    ];
}

function saveAIRecommendations() {
    saveToLocalStorage('ai_recommendations', aiRecommendations);
}

// AI Calculator Functions
function showHPPCalculator() {
    Swal.fire({
        title: 'Kalkulator HPP & Margin',
        html: `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-2">
                        <input type="number" class="form-control text-white" id="rawMaterialCost" placeholder="Biaya Bahan Baku" oninput="calculateHPP()">
                    </div>
                    <div class="mb-2">
                        <input type="number" class="form-control text-white" id="packagingCost" placeholder="Biaya Kemasan" oninput="calculateHPP()">
                    </div>
                    <div class="mb-2">
                        <input type="number" class="form-control text-white" id="laborCost" placeholder="Biaya Tenaga Kerja" oninput="calculateHPP()">
                    </div>
                    <div class="mb-2">
                        <input type="number" class="form-control text-white" id="overheadCost" placeholder="Biaya Overhead" oninput="calculateHPP()">
                    </div>
                </div>
                <div class="col-md-6">
                    <h6>Hasil Perhitungan</h6>
                    <div class="result-box p-3 bg-light rounded">
                        <div class="mb-2">
                            <strong>Total HPP:</strong>
                            <span id="totalHPP" class="float-end">Rp 0</span>
                        </div>
                        <div class="mb-2">
                            <strong>Harga Jual Rekomendasi:</strong>
                            <span id="recommendedPrice" class="float-end">Rp 0</span>
                        </div>
                        <div class="mb-2">
                            <strong>Margin Profit:</strong>
                            <span id="calculatedMargin" class="float-end">0%</span>
                        </div>
                        <div class="mb-2">
                            <strong>Keuntungan per Unit:</strong>
                            <span id="profitPerUnit" class="float-end">Rp 0</span>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <label class="form-label text-white">Atur Harga Jual:</label>
                        <input type="number" class="form-control text-white" id="sellingPrice" placeholder="Rp 0" oninput="calculateFromSellingPrice()">
                    </div>
                </div>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true,
        width: '800px'
    });
}

function calculateHPP() {
    const rawMaterial = parseFloat(document.getElementById('rawMaterialCost')?.value) || 0;
    const packaging = parseFloat(document.getElementById('packagingCost')?.value) || 0;
    const labor = parseFloat(document.getElementById('laborCost')?.value) || 0;
    const overhead = parseFloat(document.getElementById('overheadCost')?.value) || 0;
    
    const totalHPP = rawMaterial + packaging + labor + overhead;
    const recommendedPrice = totalHPP * 2.5; // 150% markup
    const margin = ((recommendedPrice - totalHPP) / recommendedPrice * 100);
    const profitPerUnit = recommendedPrice - totalHPP;
    
    document.getElementById('totalHPP').textContent = formatCurrency(totalHPP);
    document.getElementById('recommendedPrice').textContent = formatCurrency(recommendedPrice);
    document.getElementById('calculatedMargin').textContent = margin.toFixed(1) + '%';
    document.getElementById('profitPerUnit').textContent = formatCurrency(profitPerUnit);
    
    // Update selling price input
    document.getElementById('sellingPrice').value = recommendedPrice;
}

function calculateFromSellingPrice() {
    const sellingPrice = parseFloat(document.getElementById('sellingPrice')?.value) || 0;
    const totalHPP = parseFloat(document.getElementById('totalHPP')?.textContent.replace(/[^0-9-]+/g, "")) || 0;
    
    if (sellingPrice > 0 && totalHPP > 0) {
        const margin = ((sellingPrice - totalHPP) / sellingPrice * 100);
        const profitPerUnit = sellingPrice - totalHPP;
        
        document.getElementById('calculatedMargin').textContent = margin.toFixed(1) + '%';
        document.getElementById('profitPerUnit').textContent = formatCurrency(profitPerUnit);
    }
}

// AI Business Ideas Generator
function showBusinessIdeasAI() {
    Swal.fire({
        title: 'AI Rekomendasi Ide Jualan',
        html: `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Kategori Bisnis</label>
                        <select class="form-select" id="businessCategory">
                            <option value="">Semua Kategori</option>
                            <option value="makanan">Makanan</option>
                            <option value="minuman">Minuman</option>
                            <option value="snack">Snack</option>
                            <option value="jasa">Jasa</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Modal Awal</label>
                        <select class="form-select" id="initialCapital">
                            <option value="low">< Rp 1 juta</option>
                            <option value="medium">Rp 1-5 juta</option>
                            <option value="high">> Rp 5 juta</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Target Pasar</label>
                        <select class="form-select" id="targetMarket">
                            <option value="anak_muda">Anak Muda</option>
                            <option value="ibu_rumah_tangga">Ibu Rumah Tangga</option>
                            <option value="pelajar">Pelajar</option>
                            <option value="karyawan">Karyawan</option>
                            <option value="umum">Umum</option>
                        </select>
                    </div>
                    <button class="btn btn-primary w-100" onclick="generateBusinessIdeas()">
                        <i class="bi bi-robot"></i> Generate Ide Bisnis
                    </button>
                </div>
                <div class="col-md-6">
                    <div id="businessIdeasResult">
                        <div class="text-center text-muted">
                            <i class="bi bi-lightbulb" style="font-size: 3rem;"></i>
                            <p>Isi form di samping dan klik Generate untuk mendapatkan ide bisnis</p>
                        </div>
                    </div>
                </div>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true,
        width: '900px'
    });
}

function generateBusinessIdeas() {
    const category = document.getElementById('businessCategory')?.value;
    const capital = document.getElementById('initialCapital')?.value;
    const target = document.getElementById('targetMarket')?.value;
    
    const resultDiv = document.getElementById('businessIdeasResult');
    resultDiv.innerHTML = '<div class="text-center"><div class="loading"></div><p>Generating ide bisnis...</p></div>';
    
    // Simulate AI processing
    setTimeout(() => {
        const ideas = generateAIdeas(category, capital, target);
        displayBusinessIdeas(ideas);
    }, 2000);
}

function generateAIdeas(category, capital, target) {
    const ideas = [];
    
    // Generate ideas based on parameters
    if (category === 'makanan' || category === '') {
        ideas.push({
            title: 'Warung Makan Padang Mini',
            description: 'Modal kecil, untung besar. HPP per porsi Rp 8.000, harga jual Rp 18.000. Target: karyawan dan keluarga.',
            capital: 'low',
            profit: 55,
            difficulty: 'medium',
            trend: 'stable'
        });
        
        ideas.push({
            title: 'Bakso Goreng Viral',
            description: 'Tren TikTok! Bakso goreng crispy. Modal Rp 2 juta, ROI 3 bulan. Target: anak muda dan pelajar.',
            capital: 'low',
            profit: 70,
            difficulty: 'easy',
            trend: 'rising'
        });
    }
    
    if (category === 'minuman' || category === '') {
        ideas.push({
            title: 'Es Kopi Susu Gula Aren',
            description: 'Favorit semua kalangan! HPP Rp 4.000/cangkir, harga jual Rp 12.000. Bisa delivery.',
            capital: 'low',
            profit: 66,
            difficulty: 'easy',
            trend: 'stable'
        });
        
        ideas.push({
            title: 'Bubble Tea Homemade',
            description: 'Bisa custom topping! Modal Rp 5 juta untuk peralatan. Margin 60-80%.',
            capital: 'medium',
            profit: 70,
            difficulty: 'medium',
            trend: 'stable'
        });
    }
    
    if (category === 'snack' || category === '') {
        ideas.push({
            title: 'Chiki Balls Homemade',
            description: 'Snack sehat untuk anak-anak. Bisa dijual online. HPP Rp 3.000/pack.',
            capital: 'low',
            profit: 75,
            difficulty: 'easy',
            trend: 'rising'
        });
        
        ideas.push({
            title: 'Keripik Pisang Level 5',
            description: 'Produk khas daerah! Bisa ekspor ke kota besar. Margin sangat tinggi.',
            capital: 'medium',
            profit: 80,
            difficulty: 'medium',
            trend: 'rising'
        });
    }
    
    if (category === 'jasa' || category === '') {
        ideas.push({
            title: 'Jasa Cuci & Setrika',
            description: 'Permintaan tinggi, kompetitor sedang. Modal Rp 3 juta untuk mesin cuci.',
            capital: 'medium',
            profit: 60,
            difficulty: 'easy',
            trend: 'stable'
        });
    }
    
    return ideas;
}

function displayBusinessIdeas(ideas) {
    const resultDiv = document.getElementById('businessIdeasResult');
    
    if (ideas.length === 0) {
        resultDiv.innerHTML = `
            <div class="text-center text-muted">
                <i class="bi bi-search" style="font-size: 3rem;"></i>
                <p>Tidak ada ide yang sesuai kriteria Anda. Coba ubah filter.</p>
            </div>
        `;
        return;
    }
    
    resultDiv.innerHTML = ideas.map(idea => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="row">
                    <div class="col-8">
                        <h6 class="mb-2">${idea.title}</h6>
                        <p class="mb-2">${idea.description}</p>
                        <div class="d-flex gap-2 mb-2">
                            <span class="badge bg-success">Profit ${idea.profit}%</span>
                            <span class="badge bg-primary">${getDifficultyLabel(idea.difficulty)}</span>
                            <span class="badge ${idea.trend === 'rising' ? 'bg-success' : 'bg-warning'}">
                                ${idea.trend === 'rising' ? 'Tren Naik' : 'Stabil'}
                            </span>
                        </div>
                    </div>
                    <div class="col-4 text-end">
                        <button class="btn btn-primary btn-sm" onclick="saveBusinessIdea('${idea.title}', '${idea.description.replace(/'/g, "\\'")}')">
                            <i class="bi bi-save"></i> Simpan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getDifficultyLabel(difficulty) {
    const labels = {
        easy: 'Mudah',
        medium: 'Sedang',
        hard: 'Sulit'
    };
    return labels[difficulty] || difficulty;
}

function saveBusinessIdea(title, description) {
    const newRecommendation = {
        id: generateId(),
        type: 'business_idea',
        title: title,
        content: description,
        category: 'business',
        priority: 'high',
        created_at: new Date().toISOString()
    };
    
    aiRecommendations.push(newRecommendation);
    saveAIRecommendations();
    
    showNotification('Ide bisnis berhasil disimpan!', 'success');
}

// YouTube Recipe Recommendations
function showRecipeRecommendations() {
    Swal.fire({
        title: 'Rekomendasi Resep dari YouTube',
        html: `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Kategori Makanan</label>
                        <select class="form-select" id="recipeCategory">
                            <option value="">Semua Kategori</option>
                            <option value="makanan_berat">Makanan Berat</option>
                            <option value="makanan_ringan">Makanan Ringan</option>
                            <option value="kue">Kue & Jajanan</option>
                            <option value="minuman">Minuman</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Tingkat Kesulitan</label>
                        <select class="form-select" id="recipeDifficulty">
                            <option value="">Semua Level</option>
                            <option value="easy">Mudah</option>
                            <option value="medium">Menengah</option>
                            <option value="hard">Sulit</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Estimasi Modal</label>
                        <select class="form-select" id="recipeBudget">
                            <option value="">Semua Range</option>
                            <option value="low">< Rp 1 juta</option>
                            <option value="medium">Rp 1-5 juta</option>
                            <option value="high">> Rp 5 juta</option>
                        </select>
                    </div>
                    <button class="btn btn-danger w-100" onclick="searchYouTubeRecipes()">
                        <i class="bi bi-youtube"></i> Cari Resep di YouTube
                    </button>
                </div>
                <div class="col-md-6">
                    <div id="recipeResults">
                        <div class="text-center text-muted">
                            <i class="bi bi-play-circle" style="font-size: 3rem;"></i>
                            <p>Temukan resep bisnis kuliner populer dari YouTube</p>
                        </div>
                    </div>
                </div>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true,
        width: '900px'
    });
}

function searchYouTubeRecipes() {
    const category = document.getElementById('recipeCategory')?.value;
    const difficulty = document.getElementById('recipeDifficulty')?.value;
    const budget = document.getElementById('recipeBudget')?.value;
    
    const resultDiv = document.getElementById('recipeResults');
    resultDiv.innerHTML = '<div class="text-center"><div class="loading"></div><p>Mencari resep di YouTube...</p></div>';
    
    // Simulate YouTube API search
    setTimeout(() => {
        const recipes = getYouTubeRecipes(category, difficulty, budget);
        displayYouTubeRecipes(recipes);
    }, 2000);
}

function getYouTubeRecipes(category, difficulty, budget) {
    // This is a simulation - in real implementation, you would use YouTube Data API
    const recipes = [
        {
            title: 'Cara Membuat Nasi Goreng Seafood Ala Restoran',
            channel: 'Dapur Umami',
            duration: '8:45',
            views: '2.1M',
            publishedAt: '2024-01-15',
            url: 'https://youtube.com/watch?v=sample1',
            category: 'makanan_berat',
            difficulty: 'medium',
            budget: 'low',
            hpp: 12000,
            sellingPrice: 25000,
            margin: 52
        },
        {
            title: 'Es Kopi Susu Gula Aren Viral - Tutorial Lengkap',
            channel: 'Kopi Viral',
            duration: '12:30',
            views: '856K',
            publishedAt: '2024-01-10',
            url: 'https://youtube.com/watch?v=sample2',
            category: 'minuman',
            difficulty: 'easy',
            budget: 'low',
            hpp: 4500,
            sellingPrice: 12000,
            margin: 62
        },
        {
            title: 'Keripik Pisang Level 5 - Bisnis Modal Kecil',
            channel: 'Usaha Kecil',
            duration: '15:20',
            views: '445K',
            publishedAt: '2024-01-08',
            url: 'https://youtube.com/watch?v=sample3',
            category: 'makanan_ringan',
            difficulty: 'easy',
            budget: 'low',
            hpp: 3500,
            sellingPrice: 10000,
            margin: 65
        }
    ];
    
    // Filter based on criteria
    return recipes.filter(recipe => {
        if (category && recipe.category !== category) return false;
        if (difficulty && recipe.difficulty !== difficulty) return false;
        if (budget && recipe.budget !== budget) return false;
        return true;
    });
}

function displayYouTubeRecipes(recipes) {
    const resultDiv = document.getElementById('recipeResults');
    
    if (recipes.length === 0) {
        resultDiv.innerHTML = `
            <div class="text-center text-muted">
                <i class="bi bi-search" style="font-size: 3rem;"></i>
                <p>Tidak ada resep yang sesuai kriteria Anda.</p>
            </div>
        `;
        return;
    }
    
    resultDiv.innerHTML = recipes.map(recipe => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="row">
                    <div class="col-8">
                        <h6 class="mb-2">${recipe.title}</h6>
                        <p class="mb-1">
                            <i class="bi bi-person-video"></i> ${recipe.channel} • 
                            <i class="bi bi-eye"></i> ${recipe.views} • 
                            <i class="bi bi-clock"></i> ${recipe.duration}
                        </p>
                        <div class="d-flex gap-2 mb-2">
                            <span class="badge bg-success">HPP ${formatCurrency(recipe.hpp)}</span>
                            <span class="badge bg-primary">Jual ${formatCurrency(recipe.sellingPrice)}</span>
                            <span class="badge bg-warning">Margin ${recipe.margin}%</span>
                        </div>
                    </div>
                    <div class="col-4 text-end">
                        <a href="${recipe.url}" target="_blank" class="btn btn-danger btn-sm mb-2 w-100">
                            <i class="bi bi-youtube"></i> Tonton
                        </a>
                        <button class="btn btn-outline-primary btn-sm w-100" onclick="saveRecipe('${recipe.title}', '${recipe.url}')">
                            <i class="bi bi-save"></i> Simpan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function saveRecipe(title, url) {
    const newRecommendation = {
        id: generateId(),
        type: 'recipe',
        title: title,
        content: `Video tutorial: ${url}`,
        category: 'food',
        priority: 'medium',
        created_at: new Date().toISOString()
    };
    
    aiRecommendations.push(newRecommendation);
    saveAIRecommendations();
    
    showNotification('Resep berhasil disimpan!', 'success');
}

// Market Analysis Function
function showMarketAnalysis() {
    Swal.fire({
        title: 'Analisis Pasar & Tren',
        html: `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Lokasi Usaha</label>
                        <select class="form-select" id="businessLocation">
                            <option value="urban">Perkotaan</option>
                            <option value="suburban">Pinggiran Kota</option>
                            <option value="rural">Perdesaan</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Target Pelanggan</label>
                        <select class="form-select" id="customerTarget">
                            <option value="b2c">Langsung ke Pelanggan</option>
                            <option value="b2b">Bisnis ke Bisnis</option>
                            <option value="mixed">Campuran</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Sektor Bisnis</label>
                        <select class="form-select" id="businessSector">
                            <option value="food">Makanan & Minuman</option>
                            <option value="retail">Retail</option>
                            <option value="services">Jasa</option>
                            <option value="manufacturing">Manufaktur</option>
                        </select>
                    </div>
                    <button class="btn btn-warning w-100" onclick="generateMarketAnalysis()">
                        <i class="bi bi-graph-up"></i> Analisis Pasar
                    </button>
                </div>
                <div class="col-md-6">
                    <div id="marketAnalysisResult">
                        <div class="text-center text-muted">
                            <i class="bi bi-bar-chart" style="font-size: 3rem;"></i>
                            <p>Analisis tren pasar dan peluang bisnis</p>
                        </div>
                    </div>
                </div>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true,
        width: '900px'
    });
}

function generateMarketAnalysis() {
    const location = document.getElementById('businessLocation')?.value;
    const customer = document.getElementById('customerTarget')?.value;
    const sector = document.getElementById('businessSector')?.value;
    
    const resultDiv = document.getElementById('marketAnalysisResult');
    resultDiv.innerHTML = '<div class="text-center"><div class="loading"></div><p>Menganalisis data pasar...</p></div>';
    
    // Simulate market analysis
    setTimeout(() => {
        const analysis = performMarketAnalysis(location, customer, sector);
        displayMarketAnalysis(analysis);
    }, 2000);
}

function performMarketAnalysis(location, customer, sector) {
    // This is a simulation of market analysis
    return {
        marketSize: location === 'urban' ? 'Besar' : location === 'suburban' ? 'Menengah' : 'Kecil',
        competition: location === 'urban' ? 'Tinggi' : location === 'suburban' ? 'Sedang' : 'Rendah',
        opportunities: [
            'Makanan sehat dan organik sedang tren',
            'Delivery service masih berkembang',
            'Peluang kolaborasi dengan cafe-cafe'
        ],
        threats: [
            'Banyak kompetitor serupa',
            'Harga bahan baku fluktuatif',
            'Perubahan selera konsumen cepat'
        ],
        recommendations: [
            'Fokus pada keunikan produk',
            'Manfaatkan media sosial untuk pemasaran',
            'Bangun relasi dengan pelanggan',
            'Monitor tren secara berkala'
        ],
        profitPotential: location === 'urban' ? '60-80%' : location === 'suburban' ? '50-70%' : '40-60%'
    };
}

function displayMarketAnalysis(analysis) {
    const resultDiv = document.getElementById('marketAnalysisResult');
    
    resultDiv.innerHTML = `
        <div class="analysis-result">
            <div class="row mb-3">
                <div class="col-6">
                    <div class="card bg-success text-white">
                        <div class="card-body text-center">
                            <h5>Peluang</h5>
                            <h3>${analysis.marketSize}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="card bg-warning text-white">
                        <div class="card-body text-center">
                            <h5>Kompetisi</h5>
                            <h3>${analysis.competition}</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mb-3">
                <h6>Peluang Bisnis:</h6>
                <ul class="list-unstyled">
                    ${analysis.opportunities.map(opp => `<li><i class="bi bi-check-circle text-success"></i> ${opp}</li>`).join('')}
                </ul>
            </div>
            
            <div class="mb-3">
                <h6>Tantangan:</h6>
                <ul class="list-unstyled">
                    ${analysis.threats.map(threat => `<li><i class="bi bi-exclamation-triangle text-warning"></i> ${threat}</li>`).join('')}
                </ul>
            </div>
            
            <div class="mb-3">
                <h6>Rekomendasi Strategi:</h6>
                <ul class="list-unstyled">
                    ${analysis.recommendations.map(rec => `<li><i class="bi bi-lightbulb text-info"></i> ${rec}</li>`).join('')}
                </ul>
            </div>
            
            <div class="alert alert-info">
                <strong>Potensi Keuntungan:</strong> ${analysis.profitPotential}
            </div>
        </div>
    `;
}

// Export functions for use in other modules
window.showHPPCalculator = showHPPCalculator;
window.calculateHPP = calculateHPP;
window.calculateFromSellingPrice = calculateFromSellingPrice;
window.showBusinessIdeasAI = showBusinessIdeasAI;
window.generateBusinessIdeas = generateBusinessIdeas;
window.showRecipeRecommendations = showRecipeRecommendations;
window.searchYouTubeRecipes = searchYouTubeRecipes;
window.showMarketAnalysis = showMarketAnalysis;
window.generateMarketAnalysis = generateMarketAnalysis;
// Export aiRecommendations variable
window.aiRecommendations = aiRecommendations;
