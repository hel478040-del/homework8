// 校园信息中心 - 主应用脚本
// 包含：导航高亮、自习室筛选交互、图表渲染等功能

'use strict';

// ========== 全局数据 ==========
let studyRoomsData = [];
let chartInstance = null;

// ========== 导航高亮功能 ==========
function initNavHighlight() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const sections = document.querySelectorAll('section[id]');

    function updateActiveNav() {
        const scrollPosition = window.scrollY + 100;
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = sectionId;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === '#' + currentSection) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();
}

// ========== 自习室筛选功能 ==========
function initStudyRoomFilter() {
    // 自习室数据（写死在JS数组中）
    studyRoomsData = [
        { id: 1, name: '101自习室', floor: 1, status: 'open', capacity: 80, current: 65, openTime: '07:00', closeTime: '22:00', description: '一楼大厅东侧，安静舒适，配备空调' },
        { id: 2, name: '102自习室', floor: 1, status: 'open', capacity: 60, current: 45, openTime: '07:00', closeTime: '22:00', description: '一楼大厅西侧，靠近洗手间' },
        { id: 3, name: '103自习室', floor: 1, status: 'closed', capacity: 50, current: 0, openTime: '08:00', closeTime: '18:00', description: '一楼南侧，维修中，暂不开放' },
        { id: 4, name: '201自习室', floor: 2, status: 'open', capacity: 100, current: 88, openTime: '06:30', closeTime: '22:30', description: '二楼东侧，考研专区，座位宽敞' },
        { id: 5, name: '202自习室', floor: 2, status: 'open', capacity: 70, current: 52, openTime: '07:00', closeTime: '22:00', description: '二楼西侧，有讨论区' },
        { id: 6, name: '203自习室', floor: 2, status: 'open', capacity: 40, current: 30, openTime: '08:00', closeTime: '21:00', description: '二楼南侧，小型研讨室' },
        { id: 7, name: '301自习室', floor: 3, status: 'open', capacity: 120, current: 95, openTime: '06:00', closeTime: '23:00', description: '三楼东侧，图书馆自习区，24小时开放部分区域' },
        { id: 8, name: '302自习室', floor: 3, status: 'closed', capacity: 80, current: 0, openTime: '07:00', closeTime: '22:00', description: '三楼西侧，今日有活动占用' },
        { id: 9, name: '401自习室', floor: 4, status: 'open', capacity: 90, current: 70, openTime: '07:00', closeTime: '22:00', description: '四楼东侧，电子阅览室，配备电脑' },
        { id: 10, name: '402自习室', floor: 4, status: 'open', capacity: 55, current: 40, openTime: '08:00', closeTime: '21:00', description: '四楼西侧，外语学习专区' },
        { id: 11, name: '501自习室', floor: 5, status: 'open', capacity: 60, current: 48, openTime: '07:00', closeTime: '22:00', description: '五楼东侧，研究生自习区' },
        { id: 12, name: '502自习室', floor: 5, status: 'closed', capacity: 45, current: 0, openTime: '07:00', closeTime: '22:00', description: '五楼西侧，周末关闭' }
    ];

    const floorFilter = document.getElementById('floor-filter');
    const statusFilter = document.getElementById('status-filter');
    const resetBtn = document.getElementById('reset-filter');

    if (!floorFilter || !statusFilter) return;

    // 事件绑定
    floorFilter.addEventListener('change', renderStudyRooms);
    statusFilter.addEventListener('change', renderStudyRooms);
    resetBtn.addEventListener('click', function () {
        floorFilter.value = 'all';
        statusFilter.value = 'all';
        renderStudyRooms();
    });

    // 初始渲染
    renderStudyRooms();
}

// 渲染自习室列表
function renderStudyRooms() {
    const listContainer = document.getElementById('study-room-list');
    const resultCount = document.getElementById('result-count');
    const noResult = document.getElementById('no-result');
    const floorFilter = document.getElementById('floor-filter');
    const statusFilter = document.getElementById('status-filter');

    if (!listContainer) return;

    const floorValue = floorFilter.value;
    const statusValue = statusFilter.value;

    // 筛选数据
    const filtered = studyRoomsData.filter(function (room) {
        const floorMatch = floorValue === 'all' || String(room.floor) === floorValue;
        const statusMatch = statusValue === 'all' || room.status === statusValue;
        return floorMatch && statusMatch;
    });

    // 更新结果计数
    resultCount.textContent = '共 ' + filtered.length + ' 间自习室';

    // 无结果处理
    if (filtered.length === 0) {
        listContainer.innerHTML = '';
        noResult.classList.remove('d-none');
        return;
    }

    noResult.classList.add('d-none');

    // 生成列表HTML
    listContainer.innerHTML = filtered.map(function (room) {
        const statusText = room.status === 'open' ? '开放中' : '已关闭';
        const statusClass = room.status === 'open' ? 'open' : 'closed';
        const occupancyRate = room.capacity > 0 ? Math.round((room.current / room.capacity) * 100) : 0;

        return '<div class="study-room-item ' + (room.status === 'closed' ? 'closed' : '') + '">' +
            '<div class="d-flex justify-content-between align-items-start flex-wrap gap-2">' +
                '<div>' +
                    '<h5>' + room.name + '</h5>' +
                    '<p class="text-muted mb-1">' + room.description + '</p>' +
                    '<small class="text-muted">' +
                        '楼层：' + room.floor + '楼 | ' +
                        '容量：' + room.capacity + '座 | ' +
                        '当前：' + room.current + '人 | ' +
                        '开放时间：' + room.openTime + '-' + room.closeTime +
                    '</small>' +
                '</div>' +
                '<div class="text-end">' +
                    '<span class="room-status ' + statusClass + '">' + statusText + '</span>' +
                    (room.status === 'open' ? '<div class="mt-2"><small>上座率：' + occupancyRate + '%</small></div>' : '') +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');
}

// ========== 图表初始化 ==========
function initCharts() {
    const chartContainer = document.getElementById('chart-container');
    const chartError = document.getElementById('chart-error');
    const retryBtn = document.getElementById('retry-chart');

    if (!chartContainer) return;

    // 重试按钮
    if (retryBtn) {
        retryBtn.addEventListener('click', function () {
            chartError.classList.add('d-none');
            chartContainer.style.display = 'block';
            loadChartData();
        });
    }

    loadChartData();

    // 响应式调整
    window.addEventListener('resize', function () {
        if (chartInstance) {
            chartInstance.resize();
        }
    });
}

// 加载图表数据
function loadChartData() {
    const chartContainer = document.getElementById('chart-container');
    const chartError = document.getElementById('chart-error');

    fetch('data/data.json')
        .then(function (response) {
            if (!response.ok) {
                throw new Error('网络请求失败');
            }
            return response.json();
        })
        .then(function (data) {
            if (!data.usageStatistics || !data.usageStatistics.rooms || !data.usageStatistics.usage) {
                throw new Error('数据格式错误');
            }
            renderChart(data.usageStatistics);
        })
        .catch(function (error) {
            console.error('图表数据加载失败:', error);
            if (chartError && chartContainer) {
                chartContainer.style.display = 'none';
                chartError.classList.remove('d-none');
            }
        });
}

// 渲染ECharts图表
function renderChart(stats) {
    const chartContainer = document.getElementById('chart-container');
    if (!chartContainer || typeof echarts === 'undefined') return;

    // 销毁旧实例，防止叠影
    if (chartInstance) {
        chartInstance.dispose();
    }

    chartInstance = echarts.init(chartContainer);

    const option = {
        title: {
            text: stats.title,
            left: 'center',
            textStyle: {
                fontSize: 16,
                fontWeight: 'normal'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function (params) {
                return params[0].name + '<br/>使用量：' + params[0].value + ' ' + stats.unit;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: stats.rooms,
            axisLabel: {
                rotate: 30,
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            name: stats.unit,
            nameTextStyle: {
                fontSize: 12
            }
        },
        series: [
            {
                name: '使用量',
                type: 'bar',
                data: stats.usage,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#36A2EB' },
                        { offset: 1, color: '#4BC0C0' }
                    ])
                },
                barWidth: '50%'
            }
        ]
    };

    chartInstance.setOption(option);
}

// ========== 页面初始化 ==========
document.addEventListener('DOMContentLoaded', function () {
    initNavHighlight();
    initStudyRoomFilter();
    initCharts();
});
