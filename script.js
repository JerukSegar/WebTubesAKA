// ====================== KONFIGURASI ======================
const CATEGORIES = ['sofa', 'tv', 'meja', 'kursi', 'laptop']; // 5 kategori saja
const MIN_DATA = 1000;
const MAX_DATA = 30000; // Maksimal 30.000 data (dikurangi)

// ====================== IMPLEMENTASI ALGORITMA OPTIMIZED ======================

// Merge function yang dioptimasi (minimal alokasi memori)
function mergeOptimized(left, right) {
    const result = new Array(left.length + right.length);
    let i = 0, j = 0, k = 0;
    
    // Merge dengan perbandingan descending
    while (i < left.length && j < right.length) {
        result[k++] = left[i].sales >= right[j].sales ? left[i++] : right[j++];
    }
    
    // Sisa dari left
    while (i < left.length) {
        result[k++] = left[i++];
    }
    
    // Sisa dari right
    while (j < right.length) {
        result[k++] = right[j++];
    }
    
    return result;
}

// Merge Sort Rekursif (Optimized - mengurangi slice)
function mergeSortRecursiveOptimized(arr) {
    if (arr.length <= 1) {
        return arr;
    }
    
    const mid = Math.floor(arr.length / 2);
    
    // Alokasi array manual (lebih efisien daripada slice berulang)
    const left = new Array(mid);
    const right = new Array(arr.length - mid);
    
    for (let i = 0; i < mid; i++) {
        left[i] = arr[i];
    }
    for (let i = mid; i < arr.length; i++) {
        right[i - mid] = arr[i];
    }
    
    return mergeOptimized(
        mergeSortRecursiveOptimized(left),
        mergeSortRecursiveOptimized(right)
    );
}

// Merge Sort Iteratif (Optimized - in-place merging)
function mergeSortIterativeOptimized(arr) {
    const n = arr.length;
    if (n <= 1) return arr;
    
    // Array temp untuk merging
    const temp = new Array(n);
    
    for (let size = 1; size < n; size *= 2) {
        for (let left = 0; left < n; left += 2 * size) {
            const mid = Math.min(left + size, n);
            const right = Math.min(left + 2 * size, n);
            
            let i = left;
            let j = mid;
            let k = left;
            
            // Merge dua bagian
            while (i < mid && j < right) {
                temp[k++] = arr[i].sales >= arr[j].sales ? arr[i++] : arr[j++];
            }
            
            // Salin sisa dari bagian kiri
            while (i < mid) {
                temp[k++] = arr[i++];
            }
            
            // Salin sisa dari bagian kanan
            while (j < right) {
                temp[k++] = arr[j++];
            }
            
            // Salin kembali ke array asli
            for (let m = left; m < right; m++) {
                arr[m] = temp[m];
            }
        }
    }
    
    return arr;
}

// ====================== GENERATOR DATA ======================

function generateDummyData(n, selectedCategory = null) {
    const data = new Array(n);
    
    if (selectedCategory) {
        // HANYA generate data untuk kategori yang dipilih
        for (let i = 0; i < n; i++) {
            data[i] = {
                id: i + 1,
                category: selectedCategory,
                sales: Math.floor(Math.random() * 200) + 1 // 1-200
            };
        }
    } else {
        // Generate data dengan semua kategori
        for (let i = 0; i < n; i++) {
            data[i] = {
                id: i + 1,
                category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
                sales: Math.floor(Math.random() * 200) + 1
            };
        }
    }
    
    return data;
}

// ====================== PENGUKURAN WAKTU ======================

function measureTime(algorithm, data) {
    const start = performance.now();
    
    // Buat salinan data untuk menghindari side effects
    const dataCopy = JSON.parse(JSON.stringify(data));
    algorithm(dataCopy);
    
    const end = performance.now();
    return end - start;
}

// Fungsi pengukuran dengan timeout (untuk data besar)
async function measureTimeWithTimeout(algorithm, data, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
        const start = performance.now();
        
        // Jalankan di setTimeout agar tidak block UI thread
        setTimeout(() => {
            try {
                const dataCopy = JSON.parse(JSON.stringify(data));
                algorithm(dataCopy);
                const end = performance.now();
                resolve(end - start);
            } catch (error) {
                reject(new Error(`Algorithm failed: ${error.message}`));
            }
        }, 0);
    });
}

// ====================== VARIABEL GLOBAL ======================

let chart = null;
let testResults = [];
let currentDataSize = 10000;
let currentCategory = 'sofa';

// ====================== INISIALISASI CHART ======================

function initializeChart() {
    const ctx = document.getElementById('timeChart');
    if (!ctx) {
        console.error('Canvas element not found!');
        return;
    }
    
    const ctx2d = ctx.getContext('2d');
    if (!ctx2d) {
        console.error('Could not get 2D context!');
        return;
    }
    
    if (chart) {
        chart.destroy();
    }
    
    // Hanya tampilkan maksimal 10 titik data terbaru agar grafik tidak penuh
    const displayResults = testResults.slice(-10);
    
    chart = new Chart(ctx2d, {
        type: 'line',
        data: {
            labels: displayResults.map(r => r.n.toLocaleString()),
            datasets: [
                {
                    label: 'Merge Sort Rekursif',
                    data: displayResults.map(r => r.recursiveTime),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.05)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Merge Sort Iteratif',
                    data: displayResults.map(r => r.iterativeTime),
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.05)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Perbandingan Waktu Eksekusi (ms) vs Jumlah Data',
                    color: '#2c3e50',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} ms`;
                        }
                    }
                },
                legend: {
                    labels: {
                        color: '#2c3e50',
                        font: {
                            size: 13
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Jumlah Data (n)',
                        color: '#34495e',
                        font: {
                            size: 13,
                            weight: '600'
                        }
                    },
                    ticks: {
                        color: '#7f8c8d',
                        maxRotation: 45
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Waktu Eksekusi (ms)',
                        color: '#34495e',
                        font: {
                            size: 13,
                            weight: '600'
                        }
                    },
                    ticks: {
                        color: '#7f8c8d'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// ====================== UPDATE TABEL ======================

function updateResultsTable() {
    const tbody = document.getElementById('resultsBody');
    if (!tbody) {
        console.error('Results table body not found!');
        return;
    }
    
    if (testResults.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px; color: #95a5a6;">
                    Belum ada data pengujian. Klik "Jalankan Pengujian" untuk memulai.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    // Tampilkan maksimal 15 hasil terbaru
    const displayResults = testResults.slice(-15);
    
    displayResults.forEach(result => {
        const diff = result.recursiveTime - result.iterativeTime;
        const ratio = result.iterativeTime > 0 ? (result.recursiveTime / result.iterativeTime).toFixed(2) : 'N/A';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.n.toLocaleString()}</td>
            <td class="time-cell recursive-time">${result.recursiveTime.toFixed(2)} ms</td>
            <td class="time-cell iterative-time">${result.iterativeTime.toFixed(2)} ms</td>
            <td class="${diff > 0 ? 'recursive-time' : 'iterative-time'}">
                ${diff > 0 ? '+' : ''}${diff.toFixed(2)} ms
            </td>
            <td>${ratio}x</td>
        `;
        tbody.appendChild(row);
    });
}

// ====================== UPDATE INFO DATA ======================

function updateDataInfo(totalData, category, filteredCount) {
    const totalDataElement = document.getElementById('totalData');
    const currentCategoryElement = document.getElementById('currentCategory');
    const filteredCountElement = document.getElementById('filteredCount');
    const dataInfoElement = document.getElementById('dataInfo');
    
    if (totalDataElement) totalDataElement.textContent = totalData.toLocaleString();
    if (currentCategoryElement) currentCategoryElement.textContent = category;
    if (filteredCountElement) filteredCountElement.textContent = filteredCount.toLocaleString();
    
    if (dataInfoElement) {
        dataInfoElement.innerHTML = `
            <strong>Informasi Data:</strong> Menggunakan ${totalData.toLocaleString()} data total. 
            Filter aktif untuk kategori "<strong>${category}</strong>". 
            Hasil filter: <strong>${filteredCount.toLocaleString()}</strong> data.
            <br><small>Semua data yang di-generate adalah kategori "${category}" dengan nilai penjualan acak 1-200 unit.</small>
        `;
    }
}

// ====================== FUNGSI UTAMA PENGUJIAN ======================

async function runTests() {
    const dataSize = parseInt(document.getElementById('dataSize').value);
    const category = document.getElementById('categoryFilter').value;
    
    // Validasi input
    if (dataSize < MIN_DATA || dataSize > MAX_DATA) {
        alert(`Jumlah data harus antara ${MIN_DATA.toLocaleString()} - ${MAX_DATA.toLocaleString()}`);
        return;
    }
    
    currentDataSize = dataSize;
    currentCategory = category;
    
    // Update tampilan slider
    const dataSizeValueElement = document.getElementById('dataSizeValue');
    if (dataSizeValueElement) {
        dataSizeValueElement.textContent = dataSize.toLocaleString();
    }
    
    // Tampilkan loading
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'block';
        loadingElement.innerHTML = `
            <div class="spinner"></div>
            <p>Menjalankan pengujian untuk ${dataSize.toLocaleString()} data ${category}...</p>
            <p style="font-size: 0.9rem; color: #666;">Harap tunggu, proses mungkin memakan waktu beberapa detik</p>
        `;
    }
    
    try {
        // Beri waktu untuk render UI
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Generate data
        console.time('Generate Data');
        const dummyData = generateDummyData(dataSize, category);
        console.timeEnd('Generate Data');
        
        // Update informasi data
        updateDataInfo(dataSize, category, dummyData.length);
        
        // Tentukan algoritma pengukuran berdasarkan ukuran data
        let recursiveTime, iterativeTime;
        
        if (dataSize <= 20000) {
            // Untuk data kecil, gunakan pengukuran langsung
            console.time('Merge Sort Rekursif');
            recursiveTime = measureTime(mergeSortRecursiveOptimized, dummyData);
            console.timeEnd('Merge Sort Rekursif');
            
            console.time('Merge Sort Iteratif');
            iterativeTime = measureTime(mergeSortIterativeOptimized, dummyData);
            console.timeEnd('Merge Sort Iteratif');
        } else {
            // Untuk data besar, gunakan pengukuran dengan timeout
            console.time('Merge Sort Rekursif (Large)');
            recursiveTime = await measureTimeWithTimeout(mergeSortRecursiveOptimized, dummyData);
            console.timeEnd('Merge Sort Rekursif (Large)');
            
            console.time('Merge Sort Iteratif (Large)');
            iterativeTime = await measureTimeWithTimeout(mergeSortIterativeOptimized, dummyData);
            console.timeEnd('Merge Sort Iteratif (Large)');
        }
        
        console.log(`Hasil: n=${dataSize}, Rekursif=${recursiveTime.toFixed(2)}ms, Iteratif=${iterativeTime.toFixed(2)}ms`);
        
        // Simpan hasil pengujian
        const existingIndex = testResults.findIndex(r => r.n === dataSize && r.category === category);
        const result = {
            n: dataSize,
            category: category,
            recursiveTime,
            iterativeTime,
            timestamp: new Date().toLocaleTimeString()
        };
        
        if (existingIndex >= 0) {
            testResults[existingIndex] = result;
        } else {
            testResults.push(result);
        }
        
        // Urutkan berdasarkan ukuran data
        testResults.sort((a, b) => a.n - b.n);
        
        // Update tampilan
        initializeChart();
        updateResultsTable();
        
        // Tampilkan notifikasi singkat untuk data besar
        if (dataSize > 20000) {
            alert(`Pengujian selesai! \nRekursif: ${recursiveTime.toFixed(2)} ms \nIteratif: ${iterativeTime.toFixed(2)} ms`);
        }
        
    } catch (error) {
        console.error('Error dalam pengujian:', error);
        alert(`Terjadi kesalahan: ${error.message}\nCoba kurangi jumlah data atau refresh halaman.`);
    } finally {
        // Pastikan loading disembunyikan
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
}

// ====================== FUNGSI RESET ======================

function resetChart() {
    if (testResults.length === 0) {
        alert('Belum ada data pengujian yang perlu direset.');
        return;
    }
    
    if (confirm('Apakah Anda yakin ingin menghapus semua data pengujian?')) {
        testResults = [];
        initializeChart();
        updateResultsTable();
        updateDataInfo(currentDataSize, currentCategory, currentDataSize);
        alert('Semua data pengujian telah direset.');
    }
}

// ====================== INISIALISASI ======================

document.addEventListener('DOMContentLoaded', function() {
    // Setup slider
    const slider = document.getElementById('dataSize');
    const valueDisplay = document.getElementById('dataSizeValue');
    
    if (slider && valueDisplay) {
        slider.addEventListener('input', function() {
            const value = parseInt(this.value);
            valueDisplay.textContent = value.toLocaleString();
            
            // Update info
            updateDataInfo(value, currentCategory, value);
        });
    }
    
    // Setup category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            currentCategory = this.value;
            updateDataInfo(currentDataSize, currentCategory, currentDataSize);
        });
    }
    
    // Initialize data info
    updateDataInfo(currentDataSize, currentCategory, currentDataSize);
    
    // Inisialisasi chart
    setTimeout(() => {
        initializeChart();
    }, 500);
    
    // Jalankan pengujian pertama dengan data kecil (1000) untuk demo cepat
    setTimeout(() => {
        const dataSizeElement = document.getElementById('dataSize');
        const dataSizeValueElement = document.getElementById('dataSizeValue');
        
        if (dataSizeElement) {
            dataSizeElement.value = 1000;
        }
        
        if (dataSizeValueElement) {
            dataSizeValueElement.textContent = '1,000';
        }
        
        currentDataSize = 1000;
        updateDataInfo(1000, currentCategory, 1000);
    }, 1000);
});