// ====================== KONFIGURASI ======================
const CATEGORIES = ['sofa', 'tv', 'meja', 'kursi', 'lemari', 'kasur', 'laptop', 'smartphone'];
const MIN_DATA = 1000;
const MAX_DATA = 100000;

// ====================== IMPLEMENTASI ALGORITMA ======================

function merge(left, right) {
    let result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (left[i].sales >= right[j].sales) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
}

function mergeSortRecursive(arr) {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSortRecursive(arr.slice(0, mid));
    const right = mergeSortRecursive(arr.slice(mid));
    
    return merge(left, right);
}

function mergeSortIterative(arr) {
    const n = arr.length;
    let size = 1;
    let result = [...arr];
    
    while (size < n) {
        for (let left = 0; left < n; left += 2 * size) {
            const mid = Math.min(left + size, n);
            const right = Math.min(left + 2 * size, n);
            
            const leftArr = result.slice(left, mid);
            const rightArr = result.slice(mid, right);
            const merged = merge(leftArr, rightArr);
            
            for (let i = 0; i < merged.length; i++) {
                result[left + i] = merged[i];
            }
        }
        size *= 2;
    }
    
    return result;
}

// ====================== GENERATOR DATA ======================

function generateDummyData(n, selectedCategory = null) {
    const data = [];
    
    if (selectedCategory) {
        // HANYA generate data untuk kategori yang dipilih
        for (let i = 0; i < n; i++) {
            data.push({
                id: i + 1,
                category: selectedCategory,
                sales: Math.floor(Math.random() * 200) + 1
            });
        }
    } else {
        // Generate data dengan semua kategori (untuk total data)
        for (let i = 0; i < n; i++) {
            data.push({
                id: i + 1,
                category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
                sales: Math.floor(Math.random() * 200) + 1
            });
        }
    }
    
    return data;
}

// ====================== PENGUKURAN WAKTU ======================

function measureTime(algorithm, data) {
    const start = performance.now();
    algorithm([...data]);
    const end = performance.now();
    return end - start;
}

// ====================== VARIABEL GLOBAL ======================

let chart = null;
let testResults = [];
let currentDataSize = 20000;
let currentCategory = 'sofa';

// ====================== INISIALISASI CHART ======================

function initializeChart() {
    const ctx = document.getElementById('timeChart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: testResults.map(r => r.n.toLocaleString()),
            datasets: [
                {
                    label: 'Merge Sort Rekursif',
                    data: testResults.map(r => r.recursiveTime),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.1
                },
                {
                    label: 'Merge Sort Iteratif',
                    data: testResults.map(r => r.iterativeTime),
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.1
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
                        text: 'Jumlah Data Setelah Filter (n)',
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
                        text: 'Waktu Eksekusi (milidetik)',
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
    
    testResults.forEach(result => {
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
    document.getElementById('totalData').textContent = totalData.toLocaleString();
    document.getElementById('currentCategory').textContent = category;
    document.getElementById('filteredCount').textContent = filteredCount.toLocaleString();
    
    document.getElementById('dataInfo').innerHTML = `
        <strong>Informasi Data:</strong> Menggunakan ${totalData.toLocaleString()} data total. 
        Filter aktif untuk kategori "<strong>${category}</strong>". 
        Hasil filter: <strong>${filteredCount.toLocaleString()}</strong> data.
        <br><small>Note: Semua data yang di-generate adalah kategori "${category}" dengan nilai penjualan acak 1-200.</small>
    `;
}

// ====================== FUNGSI UTAMA ======================

async function runTests() {
    const dataSize = parseInt(document.getElementById('dataSize').value);
    const category = document.getElementById('categoryFilter').value;
    
    currentDataSize = dataSize;
    currentCategory = category;
    
    // Update tampilan
    document.getElementById('dataSizeValue').textContent = dataSize.toLocaleString();
    document.getElementById('loading').style.display = 'block';
    
    // Tunggu sedikit untuk render UI
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Generate data HANYA untuk kategori yang dipilih
    const dummyData = generateDummyData(dataSize, category);
    
    // Update info
    updateDataInfo(dataSize, category, dummyData.length);
    
    // Jalankan pengujian
    const recursiveTime = measureTime(mergeSortRecursive, dummyData);
    const iterativeTime = measureTime(mergeSortIterative, dummyData);
    
    // Simpan hasil
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
    
    // Urutkan berdasarkan n
    testResults.sort((a, b) => a.n - b.n);
    
    // Update tampilan
    initializeChart();
    updateResultsTable();
    
    // Sembunyikan loading
    document.getElementById('loading').style.display = 'none';
}

// ====================== FUNGSI RESET ======================

function resetChart() {
    if (confirm('Apakah Anda yakin ingin menghapus semua data pengujian?')) {
        testResults = [];
        initializeChart();
        updateResultsTable();
        updateDataInfo(currentDataSize, currentCategory, currentDataSize);
    }
}

// ====================== INISIALISASI ======================

document.addEventListener('DOMContentLoaded', function() {
    // Setup slider
    const slider = document.getElementById('dataSize');
    const valueDisplay = document.getElementById('dataSizeValue');
    
    slider.addEventListener('input', function() {
        valueDisplay.textContent = parseInt(this.value).toLocaleString();
    });
    
    // Setup category filter
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.addEventListener('change', function() {
        currentCategory = this.value;
        updateDataInfo(currentDataSize, currentCategory, currentDataSize);
    });
    
    // Initialize
    updateDataInfo(currentDataSize, currentCategory, currentDataSize);
    
    // Jalankan pengujian pertama otomatis
    setTimeout(() => {
        runTests();
    }, 500);
});