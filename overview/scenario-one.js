document.addEventListener('DOMContentLoaded', function () {
    fetch('https://driving.krishrp.xyz/api/scenario-one-stats', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        animateValue(document.getElementById('total-users'), 0, data.total_users, 1800, false)
        animateValue(document.getElementById('braking'), 0, (data.number_of_brakes/data.total_users).toFixed(2), 1800, true)
        animateValue(document.getElementById('velocity'), 0, data.average_velocity, 1800, true)
        animateValue(document.getElementById('acceleration'), 0, data.average_throttle, 1800, true)

        average_speed_graph(data.velocity_data)
    })
})

function showNotification(notificationText) {
    const notificationContainer = document.createElement('div');
    notificationContainer.classList.add('window-notification');

    const notificationTextElement = document.createElement('p');
    notificationTextElement.textContent = notificationText;

    const notificationProgressElement = document.createElement('span');
    notificationProgressElement.classList.add('notification__progress');

    notificationContainer.appendChild(notificationTextElement);
    notificationContainer.appendChild(notificationProgressElement);

    document.body.appendChild(notificationContainer);
}

function animateValue(obj, start, end, duration, currency, easingFunction = cubicEaseOut) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easedProgress = easingFunction(progress);
        const value = easedProgress * (end - start) + start;
        const formattedValue = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        obj.innerHTML = currency ? formattedValue : Math.floor(value).toLocaleString('en-US');
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function cubicEaseOut(t) {
    return (--t) * t * t + 1;
}

let width, height, gradient;
let delayed;
Chart.defaults.elements.point.pointStyle = false;
Chart.defaults.backgroundColor = '#fffeff';

function getGradient(ctx, chartArea) {
    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;
    if (!gradient || width !== chartWidth || height !== chartHeight) {
        width = chartWidth;
        height = chartHeight;
        gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, "#37b3eb");
        gradient.addColorStop(1, "#db1fa0");
    }

    return gradient;
}

function average_speed_graph(data) {
    const ctx = document.getElementById('chart2').getContext('2d');

    const chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.map((_, index) => index),
            datasets: [
                {
                    data: data,
                    borderColor: function (context) {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;

                        if (!chartArea) {
                            // This case happens on initial chart load
                            return;
                        }
                        return getGradient(ctx, chartArea);
                    },
                    backgroundColor: "rgba(0, 0, 0, 0)",
                    pointBackgroundColor: function (context) {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;

                        if (!chartArea) {
                            // This case happens on initial chart load
                            return;
                        }
                        return getGradient(ctx, chartArea);
                    },
                    pointBorderColor: "white",
                    pointHoverBackgroundColor: "white",
                    pointHoverBorderColor: "#37b3eb",
                    pointRadius: 3,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false,
                    text: "Average Velocitry Graph"
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                    backgroundColor: "#fffeff",
                    titleColor: "#1e2024",
                    footerColor: "#1e2024",
                    bodyColor: "#1e2024",
                    borderColor: "grey",
                },
                legend: {
                    display: false,
                },
            },
            scales: {
                x: {
                    title: {
                        display: false,
                    },
                    grid: {
                        display: false,
                    },
                    ticks: {
                        display: false,
                        autoSkip: true,
                        maxTicksLimit: 7,
                    },
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: false,
                    },
                    ticks: {
                        // Format the tick values as currency (pounds)
                        callback: function (value, index, values) {
                            return value.toLocaleString();
                        },
                    },
                    grid: {
                        color: "#f0f0f0",
                    }
                }
            },
            hoverRadius: 0,
            animation: {
                tension: {
                    duration: 1000,
                    easing: 'easeInBounce',
                    from: 0.6,
                    to: 0.5,
                    loop: false
                },
                onComplete: function () {
                    delayed = true;
                },
                delay: function (context) {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 0.2 + context.datasetIndex * 0.1;
                    }
                    return delay;
                },
            },
            linearGradientLine: true,
        },
        elements: {
            point: {
                radius: 0,
            }
        },
        plugins: [{
            afterDraw: chart => {
                if (chart.tooltip?._active?.length) {
                    let x = chart.tooltip._active[0].element.x;
                    let yAxis = chart.scales.y;
                    let ctx = chart.ctx;
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(x, yAxis.top);
                    ctx.lineTo(x, yAxis.bottom);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = 'grey';
                    ctx.stroke();
                    ctx.restore();
                }
            },
            draw: function () {
                let ctx = chart.ctx;
                ctx.save();
                ctx.shadowColor = 'red';
                ctx.shadowBlur = 12;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 5;
                ctx.stroke();
                draw.apply(this, arguments);
                ctx.restore();
            }
        }],
    });
}