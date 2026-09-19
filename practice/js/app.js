'use strict';

var books = [
    { id: 1, title: '百年孤独', author: '马尔克斯', category: '文学', status: '在馆', location: 'A区3排' },
    { id: 2, title: '红楼梦', author: '曹雪芹', category: '文学', status: '在馆', location: 'A区1排' },
    { id: 3, title: '追风筝的人', author: '胡赛尼', category: '文学', status: '借出', location: 'A区5排' },
    { id: 4, title: '三体', author: '刘慈欣', category: '科技', status: '在馆', location: 'B区2排' },
    { id: 5, title: '时间简史', author: '霍金', category: '科技', status: '在馆', location: 'B区4排' },
    { id: 6, title: 'python编程', author: 'Eric Matthes', category: '科技', status: '借出', location: 'B区6排' },
    { id: 7, title: '史记', author: '司马迁', category: '历史', status: '在馆', location: 'C区1排' },
    { id: 8, title: '明朝那些事', author: '当年明月', category: '历史', status: '借出', location: 'C区3排' },
    { id: 9, title: '艺术的故事', author: '贡布里希', category: '艺术', status: '在馆', location: 'D区2排' },
    { id: 10, title: '小王子', author: '圣埃克苏佩里', category: '少儿', status: '在馆', location: 'E区1排' },
    { id: 11, title: '夏洛的网', author: '怀特', category: '少儿', status: '借出', location: 'E区2排' },
    { id: 12, title: '活着', author: '余华', category: '文学', status: '在馆', location: 'A区2排' }
];

var chartData = {
    title: '各类别图书近30天借阅量',
    unit: '册',
    source: '城市图书馆管理系统',
    categories: ['文学', '科技', '历史', '艺术', '少儿'],
    counts: [320, 280, 150, 95, 190]
};

document.addEventListener('DOMContentLoaded', function () {
    initBookFilter();
    initCharts();
    initScrollHighlight();
});

function initScrollHighlight() {
    var links = document.querySelectorAll('.navbar-nav .nav-link');
    links.forEach(function (link) {
        link.addEventListener('click', function () {
            links.forEach(function (l) { l.classList.remove('active'); });
            this.classList.add('active');
        });
    });
}

function initBookFilter() {
    var catSelect = document.getElementById('filter-category');
    var statusSelect = document.getElementById('filter-status');
    if (!catSelect || !statusSelect) return;
    catSelect.addEventListener('change', renderBooks);
    statusSelect.addEventListener('change', renderBooks);
    renderBooks();
}

function renderBooks() {
    var cat = document.getElementById('filter-category').value;
    var status = document.getElementById('filter-status').value;
    var list = document.getElementById('book-list');
    var noResult = document.getElementById('no-result');
    var countBadge = document.getElementById('result-count');

    var filtered = books.filter(function (b) {
        var catOk = (cat === 'all' || b.category === cat);
        var statusOk = (status === 'all' || b.status === status);
        return catOk && statusOk;
    });

    countBadge.textContent = '共 ' + filtered.length + ' 本图书';

    if (filtered.length === 0) {
        list.innerHTML = '';
        noResult.classList.remove('d-none');
        return;
    }
    noResult.classList.add('d-none');

    list.innerHTML = filtered.map(function (b) {
        var statusClass = b.status === '在馆' ? 'status-in' : 'status-out';
        return ''
            + '<div class="col-md-6 col-lg-4">'
            + '  <div class="book-card">'
            + '    <div class="book-title">' + b.title + '</div>'
            + '    <div class="book-meta">作者：' + b.author + ' | 分类：' + b.category + '</div>'
            + '    <div class="book-meta">位置：' + b.location + '</div>'
            + '    <span class="status-badge ' + statusClass + '">' + b.status + '</span>'
            + '  </div>'
            + '</div>';
    }).join('');
}

var chartInstance = null;

function initCharts() {
    var chartContainer = document.getElementById('chart-container');
    var chartError = document.getElementById('chart-error');
    var retryBtn = document.getElementById('retry-chart');
    if (!chartContainer) return;

    if (retryBtn) {
        retryBtn.addEventListener('click', function () {
            chartError.classList.add('d-none');
            chartContainer.style.display = 'block';
            loadChartData();
        });
    }

    loadChartData();

    window.addEventListener('resize', function () {
        if (chartInstance) {
            chartInstance.resize();
        }
    });
}

function loadChartData() {
    var chartContainer = document.getElementById('chart-container');
    var chartError = document.getElementById('chart-error');
    var chartSource = document.getElementById('chart-source');

    try {
        if (typeof echarts === 'undefined') {
            throw new Error('ECharts 未加载');
        }

        if (chartInstance) {
            chartInstance.dispose();
        }

        chartInstance = echarts.init(chartContainer);

        var option = {
            title: {
                text: chartData.title,
                left: 'center',
                textStyle: { fontSize: 16, fontWeight: 'normal' }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function (params) {
                    return params[0].name + '<br/>借阅量：' + params[0].value + ' ' + chartData.unit;
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '8%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: chartData.categories,
                axisLabel: { fontSize: 13 }
            },
            yAxis: {
                type: 'value',
                name: '借阅量（' + chartData.unit + '）'
            },
            series: [{
                type: 'bar',
                data: chartData.counts,
                itemStyle: {
                    color: function (params) {
                        var colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];
                        return colors[params.dataIndex % colors.length];
                    },
                    borderRadius: [6, 6, 0, 0]
                },
                barWidth: '50%',
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c} ' + chartData.unit
                }
            }]
        };

        chartInstance.setOption(option);

        if (chartSource) {
            chartSource.textContent = '数据来源：' + chartData.source + ' | 统计周期：' + chartData.title.match(/近\d+天/) || '近30天';
        }
    } catch (error) {
        console.error('图表渲染失败:', error);
        if (chartError && chartContainer) {
            chartContainer.style.display = 'none';
            chartError.classList.remove('d-none');
        }
    }
}
