/* ===================================================================
   charts.js — Chart.js Configuration & Rendering (Async Supabase)
   =================================================================== */

const Charts = (() => {
    let expenseBreakdownChart = null;
    let monthlyTrendChart = null;
    let budgetVsActualChart = null;
    let reportAnnualChart = null;
    let reportCategoryChart = null;

    const CHART_COLORS = [
        '#22C55E', '#A78BFA', '#06B6D4', '#F59E0B', '#F43F5E',
        '#10B981', '#E879F9', '#14B8A6', '#84CC16', '#EA580C',
        '#4ADE80', '#0EA5E9', '#D946EF', '#FB923C', '#A3E635'
    ];

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 16,
                    usePointStyle: true,
                    pointStyleWidth: 10,
                    font: { size: 12, family: "'Inter', sans-serif" }
                }
            },
            tooltip: {
                backgroundColor: '#1E293B',
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function(ctx) {
                        return ` ${ctx.label}: ${Store.formatMoney(ctx.parsed || ctx.parsed.y || 0)}`;
                    }
                }
            }
        }
    };

    function destroyChart(chart) {
        if (chart) chart.destroy();
        return null;
    }

    // ===== Expense Breakdown (Doughnut) — receives data as params =====
    function renderExpenseBreakdown(transactions, categories) {
        const canvas = document.getElementById('chart-expense-breakdown');
        const emptyMsg = document.getElementById('chart-expense-empty');
        expenseBreakdownChart = destroyChart(expenseBreakdownChart);

        const expenses = transactions.filter(t => t.type === 'expense');
        if (expenses.length === 0) {
            canvas.style.display = 'none';
            if (emptyMsg) emptyMsg.style.display = 'block';
            return;
        }
        canvas.style.display = 'block';
        if (emptyMsg) emptyMsg.style.display = 'none';

        const grouped = {};
        expenses.forEach(t => {
            if (!grouped[t.categoryId]) grouped[t.categoryId] = 0;
            grouped[t.categoryId] += t.amount;
        });

        const labels = [];
        const data = [];
        const colors = [];

        Object.entries(grouped)
            .sort((a, b) => b[1] - a[1])
            .forEach(([catId, amount]) => {
                const cat = categories.find(c => c.id === catId);
                labels.push(cat ? cat.name : 'Autre');
                data.push(amount);
                colors.push(cat ? cat.color : '#94A3B8');
            });

        expenseBreakdownChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverOffset: 6
                }]
            },
            options: {
                ...defaultOptions,
                cutout: '65%',
                plugins: {
                    ...defaultOptions.plugins,
                    tooltip: {
                        ...defaultOptions.plugins.tooltip,
                        callbacks: {
                            label: function(ctx) {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                                return ` ${ctx.label}: ${Store.formatMoney(ctx.parsed)} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ===== Monthly Trend (Line) — NOW ASYNC =====
    async function renderMonthlyTrend(year) {
        const canvas = document.getElementById('chart-monthly-trend');
        monthlyTrendChart = destroyChart(monthlyTrendChart);

        const labels = [];
        const incomeData = [];
        const expenseData = [];
        const balanceData = [];

        for (let m = 0; m < 12; m++) {
            labels.push(Store.getMonthName(m).substr(0, 3));
            const txs = await Store.Transactions.getByMonth(year, m);
            const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            incomeData.push(income);
            expenseData.push(expense);
            balanceData.push(income - expense);
        }

        monthlyTrendChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Revenus',
                        data: incomeData,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Dépenses',
                        data: expenseData,
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Solde',
                        data: balanceData,
                        borderColor: '#22C55E',
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                ...defaultOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: v => Store.formatMoney(v)
                        },
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                plugins: {
                    ...defaultOptions.plugins,
                    tooltip: {
                        ...defaultOptions.plugins.tooltip,
                        callbacks: {
                            label: function(ctx) {
                                return ` ${ctx.dataset.label}: ${Store.formatMoney(ctx.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ===== Budget vs Actual (Bar) — receives data as params =====
    function renderBudgetVsActual(budgets, transactions, categories) {
        const canvas = document.getElementById('chart-budget-vs-actual');
        const emptyMsg = document.getElementById('chart-bva-empty');
        budgetVsActualChart = destroyChart(budgetVsActualChart);

        if (budgets.length === 0) {
            canvas.style.display = 'none';
            if (emptyMsg) emptyMsg.style.display = 'block';
            return;
        }
        canvas.style.display = 'block';
        if (emptyMsg) emptyMsg.style.display = 'none';

        const labels = [];
        const budgetData = [];
        const actualData = [];
        const bgColors = [];

        budgets.forEach(b => {
            const cat = categories.find(c => c.id === b.categoryId);
            labels.push(cat ? cat.name : 'Autre');
            budgetData.push(b.amount);
            const spent = transactions
                .filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
                .reduce((s, t) => s + t.amount, 0);
            actualData.push(spent);
            bgColors.push(spent > b.amount ? '#EF4444' : '#10B981');
        });

        budgetVsActualChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Budget',
                        data: budgetData,
                        backgroundColor: 'rgba(34, 197, 94, 0.3)',
                        borderColor: '#22C55E',
                        borderWidth: 2,
                        borderRadius: 4
                    },
                    {
                        label: 'Réel',
                        data: actualData,
                        backgroundColor: bgColors.map(c => c === '#EF4444' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'),
                        borderColor: bgColors,
                        borderWidth: 2,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                ...defaultOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: v => Store.formatMoney(v) },
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    x: { grid: { display: false } }
                },
                plugins: {
                    ...defaultOptions.plugins,
                    tooltip: {
                        ...defaultOptions.plugins.tooltip,
                        callbacks: {
                            label: function(ctx) {
                                return ` ${ctx.dataset.label}: ${Store.formatMoney(ctx.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ===== Report Annual Chart — NOW ASYNC =====
    async function renderReportAnnual(year) {
        const canvas = document.getElementById('chart-report-annual');
        reportAnnualChart = destroyChart(reportAnnualChart);

        const labels = [];
        const incomeData = [];
        const expenseData = [];

        for (let m = 0; m < 12; m++) {
            labels.push(Store.getMonthName(m).substr(0, 3));
            const txs = await Store.Transactions.getByMonth(year, m);
            incomeData.push(txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0));
            expenseData.push(txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
        }

        reportAnnualChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Revenus',
                        data: incomeData,
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderRadius: 4
                    },
                    {
                        label: 'Dépenses',
                        data: expenseData,
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                ...defaultOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: v => Store.formatMoney(v) },
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    x: { grid: { display: false } }
                },
                plugins: {
                    ...defaultOptions.plugins,
                    tooltip: {
                        ...defaultOptions.plugins.tooltip,
                        callbacks: {
                            label: function(ctx) {
                                return ` ${ctx.dataset.label}: ${Store.formatMoney(ctx.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ===== Report Category Breakdown — NOW ASYNC =====
    async function renderReportCategory(year) {
        const canvas = document.getElementById('chart-report-category');
        reportCategoryChart = destroyChart(reportCategoryChart);

        const txs = (await Store.Transactions.getByYear(year)).filter(t => t.type === 'expense');
        const categories = await Store.Categories.getAll();
        const grouped = {};

        txs.forEach(t => {
            if (!grouped[t.categoryId]) grouped[t.categoryId] = 0;
            grouped[t.categoryId] += t.amount;
        });

        const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
        const labels = sorted.map(([catId]) => {
            const cat = categories.find(c => c.id === catId);
            return cat ? cat.name : 'Autre';
        });
        const data = sorted.map(([, amount]) => amount);
        const colors = sorted.map(([catId]) => {
            const cat = categories.find(c => c.id === catId);
            return cat ? cat.color : '#94A3B8';
        });

        reportCategoryChart = new Chart(canvas, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                ...defaultOptions,
                plugins: {
                    ...defaultOptions.plugins,
                    tooltip: {
                        ...defaultOptions.plugins.tooltip,
                        callbacks: {
                            label: function(ctx) {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                                return ` ${ctx.label}: ${Store.formatMoney(ctx.parsed)} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    return {
        renderExpenseBreakdown,
        renderMonthlyTrend,
        renderBudgetVsActual,
        renderReportAnnual,
        renderReportCategory,
        CHART_COLORS
    };
})();
