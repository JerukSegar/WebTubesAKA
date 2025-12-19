// ====================== IMPLEMENTASI ALGORITMA ======================

// Fungsi merge untuk menggabungkan dua array terurut
function merge(left, right) {
    let result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (left[i].sales >= right[j].sales) { // Descending
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
}

// 1. Merge Sort Rekursif (Top-Down)
function mergeSortRecursive(arr) {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSortRecursive(arr.slice(0, mid));
    const right = mergeSortRecursive(arr.slice(mid));
    
    return merge(left, right);
}

// 2. Merge Sort Iteratif (Bottom-Up)
function mergeSortIterative(arr) {
    const n = arr.length;
    let size = 1;
    
    // Salin array untuk diurutkan
    let result = [...arr];
    
    while (size < n) {
        for (let left = 0; left < n; left += 2 * size) {
            const mid = Math.min(left + size, n);
            const right = Math.min(left + 2 * size, n);
            
            // Merge dua bagian
            const leftArr = result.slice(left, mid);
            const rightArr = result.slice(mid, right);
            const merged = merge(leftArr, rightArr);
            
            // Salin kembali ke array hasil
            for (let i = 0; i < merged.length; i++) {
                result[left + i] = merged[i];
            }
        }
        size *= 2;
    }
    
    return result;
}

// ====================== GENERATOR DATA DUMMY ======================

function generateDummyData(n) {
    const categories = ['sofa', 'kursi', 'meja', 'lemari', 'kasur'];
    const data = [];
    
    for (let i = 0; i < n; i++) {
        data.push({
            id: i + 1,
            category: categories[Math.floor(Math.random() * categories.length)],
            sales: Math.floor(Math.random() * 200) + 1 // 1-200
        });
    }
    
    // Filter hanya kategori 'sofa' sesuai studi kasus
    return data.filter(item => item.category === 'sofa');
}

// ====================== PENGUKURAN WAKTU ======================

function measureTime(algorithm, data) {
    const start = performance.now();
    algorithm([...data]); // Salin array agar tidak termutasi
    const end = performance.now();
    return end - start;
}

// ====================== VARIABEL GLOBAL ======================

let chart = null;
let testResults = [];
let currentDataSize = 5000;

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
                    borderColor: '#f87171',
                    backgroundColor: 'rgba(248, 113, 113, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.2
                },
                {
                    label: 'Merge Sort Iteratif',
                    data: testResults.map(r => r.iterativeTime),
                    borderColor: '#4ade80',
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Perbandingan Running Time Merge Sort',
                    color: '#e6e6e6',
                    font: {
                        size: 16
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
                        color: '#e6e6e6',
                        font: {
                            size: 14
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Jumlah Data (n)',
                        color: '#90a4ae',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        color: '#b0bec5',
                        maxRotation: 45
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Waktu Eksekusi (ms)',
                        color: '#90a4ae',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        color: '#b0bec5'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// ====================== UPDATE TABEL HASIL ======================

function updateResultsTable() {
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
    
    testResults.forEach(result => {
        const diff = result.recursiveTime - result.iterativeTime;
        const ratio = result.recursiveTime / result.iterativeTime;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.n.toLocaleString()}</td>
            <td class="time-cell recursive-time">${result.recursiveTime.toFixed(2)} ms</td>
            <td class="time-cell iterative-time">${result.iterativeTime.toFixed(2)} ms</td>
            <td class="${diff > 0 ? 'recursive-time' : 'iterative-time'}">${diff.toFixed(2)} ms</td>
            <td>${ratio.toFixed(2)}x</td>
        `;
        tbody.appendChild(row);
    });
}

// ====================== FUNGSI UTAMA PENGUJIAN ======================

async function runTests() {
    const dataSize = parseInt(document.getElementById('dataSize').value);
    currentDataSize = dataSize;
    
    // Tampilkan loading
    document.getElementById('loading').style.display = 'block';
    
    // Beri waktu untuk render UI
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Generate data dummy
    const dummyData = generateDummyData(dataSize);
    const actualN = dummyData.length; // Setelah filter
    
    console.log(`Testing with n=${actualN} (after filter)`);
    
    // Jalankan pengujian
    const recursiveTime = measureTime(mergeSortRecursive, dummyData);
    const iterativeTime = measureTime(mergeSortIterative, dummyData);
    
    // Simpan hasil
    const existingIndex = testResults.findIndex(r => r.n === actualN);
    const result = {
        n: actualN,
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
    
    // Update info
    document.getElementById('dataSizeValue').textContent = `${dataSize.toLocaleString()} (${actualN} sofa)`;
}

// ====================== FUNGSI RESET ======================

function resetChart() {
    testResults = [];
    initializeChart();
    document.getElementById('resultsBody').innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center; padding: 30px; color: #90a4ae;">
                Belum ada data pengujian. Klik "Jalankan Pengujian" untuk memulai.
            </td>
        </tr>
    `;
}

// ====================== EVENT LISTENERS ======================

document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi slider
    const slider = document.getElementById('dataSize');
    const valueDisplay = document.getElementById('dataSizeValue');
    
    slider.addEventListener('input', function() {
        valueDisplay.textContent = parseInt(this.value).toLocaleString();
    });
    
    // Jalankan pengujian pertama kali
    setTimeout(() => {
        runTests();
    }, 1000);
});