const params = new URLSearchParams(window.location.search);
const driverId = params.get('id');
resultsArray = []

document.addEventListener('DOMContentLoaded', function () {
    if (driverId) {
        fetch('https://driving.krishrp.xyz/api/get-user-data', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ driverId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 200) {
                resultsArray = data.data;
                //find total driving duration
                const firstTimestamp = data.data.sort((a, b) => a.timestamp - b.timestamp)[0]
                const lastTimestamp = data.data.sort((a, b) => a.timestamp - b.timestamp)[data.data.length - 1]
                driveDuration = lastTimestamp.timestamp - firstTimestamp.timestamp;
                const minutes = Math.floor(driveDuration / 60000);
                const seconds = Math.floor((driveDuration - minutes*60000) / 1000);
                document.querySelector('.inventory-value-number-value-container').textContent = `${minutes}m ${seconds}s`;
                
                //find total steering actions value from seeing how many time the steering value changes from incresaing to decreasing or vice versa
                const steeringActions = data.data.reduce((acc, curr, index, array) => {
                    if (index === 0) {
                        return 0;
                    }
                    if (array[index - 1].steering > curr.steering && array[index + 1]?.steering > curr.steering) {
                        return acc + 1;
                    }
                    if (array[index - 1]?.steering < curr?.steering && array[index + 1]?.steering < curr?.steering) {
                        return acc + 1;
                    }
                    return acc;
                }, 0);
                animateValue(document.querySelector('.all-time-sales-number-value-container'), 0, steeringActions, 1500, false);
            
                //find total braking actions value by seeing how many brake values of 1 have a value of 0 before
                const brakingActions = resultsArray.filter(item => item.brake > 0 && resultsArray[resultsArray.indexOf(item) - 1]?.brake == 0).length
                animateValue(document.querySelector('.available-balance-number-value-container'), 0, brakingActions, 1500, false);
            
                //find average speed
                const averageSpeed = data.data.reduce((acc, curr) => acc + parseFloat(curr.speed), 0) / data.data.length;
                animateValue(document.querySelector('.speed-number-value-container'), 0, averageSpeed, 1500, true);
            
                //pass values into compare with averages function
                compareWithAverages(steeringActions, brakingActions, driveDuration, averageSpeed, data.data, data.indicators);
            }
        })
    }
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

function cubicEaseOut(t) {
    return (--t) * t * t + 1;
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

function compareWithAverages(steeringActions, brakingActions, driveDuration, averageSpeed, allData, indicators) {
    fetch('https://driving.krishrp.xyz/api/get-average-values')
    .then(response => response.json())
    .then(data => {
        if (data.status === 200) {
            //calculate percentage difference between user and average values
            const steeringDifference = ((parseFloat(steeringActions) - data.data.average_steering_actions) / data.data.average_steering_actions) * 100;
            const brakingDifference = ((parseFloat(brakingActions) - data.data.number_of_brakes) / data.data.number_of_brakes) * 100;
            const driveDurationDifference = ((parseFloat(driveDuration) - data.data.average_duration) / data.data.average_duration) * 100;
            const averageSpeedDifference = ((parseFloat(averageSpeed) - data.data.average_velocity) / data.data.average_velocity) * 100;
            //pass values into animate value function
            animateValue(document.querySelector('#steering'), 0, steeringDifference, 1500, false);
            animateValue(document.querySelector('#braking'), 0, brakingDifference, 1500, false);
            animateValue(document.querySelector('#duration'), 0, driveDurationDifference, 1500, false);
            animateValue(document.querySelector('#speed'), 0, averageSpeedDifference, 1500, false);

            //change colour of percentage difference based on if it is positive or negative
            (steeringDifference > 0) ? document.querySelector('#steering').parentElement.classList.add('positive') : document.querySelector('#steering').parentElement.classList.add('negative');
            (brakingDifference > 0) ? document.querySelector('#braking').parentElement.classList.add('positive') : document.querySelector('#braking').parentElement.classList.add('negative');
            (driveDurationDifference > 0) ? document.querySelector('#duration').parentElement.classList.add('positive') : document.querySelector('#duration').parentElement.classList.add('negative');
            (averageSpeedDifference > 0) ? document.querySelector('#speed').parentElement.classList.add('positive') : document.querySelector('#speed').parentElement.classList.add('negative');

            //change text content depeiending on if the percentage difference is positive or negative
            if (steeringDifference <= 0) {
                document.querySelector('#steering').parentElement.querySelector('.percent-sign').textContent = `% less than average`;
            }
            if (brakingDifference <= 0) {
                document.querySelector('#braking').parentElement.querySelector('.percent-sign').textContent = `% less than average`;
            }
            if (driveDurationDifference <= 0) {
                document.querySelector('#duration').parentElement.querySelector('.percent-sign').textContent = `% less than average`;
            }
            if (averageSpeedDifference <= 0) {
                document.querySelector('#speed').parentElement.querySelector('.percent-sign').textContent = `% less than average`;
            }

            //create array of timestamps changed to seconds to be used in x axis of charts
            const timestamps = allData.map(item => item.timestamp);
            const firstTimestamp = timestamps[0];
            let timeStampsArray = [];

            for (let i = 0; i < timestamps.length; i++) {
                timeStampsArray.push(`${Math.floor((timestamps[i] - firstTimestamp) / 1000)}s`);
            }

            renderAverageSpeedGraph(allData, data.data.velocity_data, indicators, timeStampsArray);
            renderAverageSteeringWheelAngleGraph(allData, data.data.steering_data, indicators, timeStampsArray);
            renderAverageAccelerationGraph(allData, data.data.acceleration_data, indicators, timeStampsArray);
            renderAverageBrakingGraph(allData, data.data.acceleration_data, indicators, timeStampsArray)

            for (const indicator of indicators) {
                const relevantData = allData.filter(item => item.timestamp > indicator.timestamp);
                const reactionData = relevantData.filter(item => item.brake > 0 || item.acceleration < 0 || (item.acceleration - relevantData[relevantData.indexOf(item) - 1]?.acceleration < 0))[0];
                const recentSalesContainer = document.querySelector('.recent-sales-table');
                const reactionHtml = `
                <div class="recent-sale">
                    <div class="recent-sale-shoe">Scenario ${indicators.indexOf(indicator) + 1} at ${(indicator.timestamp - allData[0].timestamp) / 1000}s</div>
                    <div style=";gap: 5px; font-size: 16px; display:flex; flex-direction: column" class="info-container">
                        <div class="recent-sale-date recent-sale-shoe">${reactionData.timestamp - indicator.timestamp} ms</div>
                    </div>
                </div>
                `;
                recentSalesContainer.insertAdjacentHTML('beforeend', reactionHtml);
            }
        }
    })
}

function getGradient(ctx, chartArea) {
    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;
    if (!gradient || width !== chartWidth || height !== chartHeight) {
        // Create the gradient because this is either the first render
        // or the size of the chart has changed
        width = chartWidth;
        height = chartHeight;
        gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, "#37b3eb");
        gradient.addColorStop(1, "#db1fa0");
    }

    return gradient;
}

Chart.defaults.backgroundColor = '#fffeff';
Chart.defaults.elements.point.pointStyle = false;
let delayed, width, height, gradient;

function renderAverageSpeedGraph(driver_data, average_data, indicators, xAxis) {
    const driverData = driver_data.map(item => parseFloat(item.speed));
    const averageData = average_data;
    const ctx = document.getElementById('chart2').getContext('2d');
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xAxis,
            datasets: [
                {
                    label: 'Your Speed',
                    data: driverData,
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    borderColor: function (context) {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;

                        if (!chartArea)return;
                        return getGradient(ctx, chartArea);
                    },
                    pointBorderColor: "white",
                    pointHoverBackgroundColor: "white",
                    pointRadius: 3,
                    borderWidth: 2,
                    pointBackgroundColor: function (context) {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;

                        if (!chartArea) return;
                        return getGradient(ctx, chartArea);
                    },
                },
                {
                    label: 'Average Speed',
                    data: averageData,
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    borderColor: 'grey',
                    pointBorderColor: "white",
                    pointHoverBackgroundColor: "white",
                    pointBackgroundColor: 'grey',
                    pointRadius: 3,
                    borderWidth: 2,
                    borderDash: [2, 2],
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false,
                    text: "Sales Count"
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
                annotation: {
                    annotations: indicators.map(indicator => {
                        return {
                            type: 'line',
                            mode: 'vertical',
                            scaleID: 'x',
                            value: driver_data.filter(item => parseFloat(item.timestamp) < parseFloat(indicator.timestamp)).length,
                            borderColor: 'red',
                            borderWidth: 2,
                            label: {
                                content: `Scenario at 1`,
                                enabled: true,
                                position: 'top'
                            },
                        }
                    })
                }
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
                        autoSkip: true,
                        maxTicksLimit: 7
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: false,
                    },
                    grid: {
                        color: "#f0f0f0",
                    },
                    ticks: {
                        callback: function (value) { if (value % 1 === 0) { return value; } }
                    }
                }
            },
            hoverRadius: 0,
            animation: {
                tension: {
                    duration: 1000,
                    easing: 'easeInBounce',
                    from: 0.6,
                    to: 0.7,
                    loop: false
                },
                onComplete: function () {
                    delayed = true;
                },
                delay: function (context) {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 5 + context.datasetIndex * 10;
                    }
                    return delay;
                },
            },
            linearGradientLine: true,
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
            },
        }],
    })
    

}

function renderAverageSteeringWheelAngleGraph(driver_data, average_data, indicators, xAxis) {
    //for the first and last 6 seconds, set the steering wheel angle to 0
    startTimestamp = driver_data[0].timestamp;
    endTimestamp = driver_data[driver_data.length - 1].timestamp;
    
    driverData = driver_data.map(item => parseFloat(item.steering));
    driverData = driverData.map(item => item > 539 ? 0 : item < -539 ? 0 : item);
    average_data = average_data.map(item => item > 539 ? 0 : item < -539 ? 0 : item);
    
    const averageData = average_data
    const ctx = document.getElementById('chart').getContext('2d');

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xAxis,
            datasets: [
                {
                    label: 'Your Steering Wheel Angle',
                    data: driverData,
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    borderColor: function (context) {
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
                    pointRadius: 3,
                    borderWidth: 2,
                    pointBackgroundColor: function (context) {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;

                        if (!chartArea) {
                            // This case happens on initial chart load
                            return;
                        }
                        return getGradient(ctx, chartArea);
                    },
                },
                {
                    label: 'Average Steering Wheel Angle',
                    data: averageData,
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    borderColor: 'grey',
                    pointBorderColor: "white",
                    pointHoverBackgroundColor: "white",
                    pointBackgroundColor: 'grey',
                    pointRadius: 3,
                    borderWidth: 2,
                    borderDash: [2, 2],
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false,
                    text: "Sales Count"
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
                annotation: {
                    annotations: indicators.map(indicator => {
                        return {
                            type: 'line',
                            mode: 'vertical',
                            scaleID: 'x',
                            value: driver_data.filter(item => parseFloat(item.timestamp) < parseFloat(indicator.timestamp)).length,
                            borderColor: 'red',
                            borderWidth: 2,
                            label: {
                                content: `Scenario at 1`,
                                enabled: true,
                                position: 'top'
                            },
                        }
                    })
                }
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
                        autoSkip: true,
                        maxTicksLimit: 7
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: false,
                    },
                    grid: {
                        color: "#f0f0f0",
                    },
                    ticks: {
                        callback: function (value) { if (value % 1 === 0) { return value; } }
                    }
                }
            },
            hoverRadius: 0,
            animation: {
                tension: {
                    duration: 1000,
                    easing: 'easeInBounce',
                    from: 0.6,
                    to: 0.7,
                    loop: false
                },
                onComplete: function () {
                    delayed = true;
                },
                delay: function (context) {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 5 + context.datasetIndex * 10;
                    }
                    return delay;
                },
            },
            linearGradientLine: true,
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
                    ctx.strokeStyle = 'gre,y';
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

function renderAverageAccelerationGraph(driver_data, average_data, indicators, xAxis) {
    //use speed and timestamp from driver data to calculate acceleration
    const driverData = driver_data.map(item => parseFloat(item.speed));
    const driverTimestamp = driver_data.map(item => item.timestamp);
    let driverAcceleration = [];
    for (let i = 0; i < driverData.length - 1; i++) {
        driverAcceleration.push((driverData[i + 10] - driverData[i]) / (driverTimestamp[i + 10]/1000 - driverTimestamp[i]/1000));
    }
    const averageData = average_data
    const ctx = document.getElementById('chart3').getContext('2d');

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xAxis,
            datasets: [
                {
                    label: 'Your Speed',
                    data: driverAcceleration,
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    borderColor: function (context) {
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
                    pointRadius: 3,
                    borderWidth: 2,
                    pointBackgroundColor: function (context) {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;

                        if (!chartArea) {
                            // This case happens on initial chart load
                            return;
                        }
                        return getGradient(ctx, chartArea);
                    },
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false,
                    text: "Sales Count"
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
                annotation: {
                    annotations: indicators.map(indicator => {
                        return {
                            type: 'line',
                            mode: 'vertical',
                            scaleID: 'x',
                            value: driver_data.filter(item => parseFloat(item.timestamp) < parseFloat(indicator.timestamp)).length,
                            borderColor: 'red',
                            borderWidth: 2,
                            label: {
                                content: `Scenario at 1`,
                                enabled: true,
                                position: 'top'
                            },
                        }
                    })
                }
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
                        autoSkip: true,
                        maxTicksLimit: 7
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: false,
                    },
                    grid: {
                        color: "#f0f0f0",
                    },
                    ticks: {
                        callback: function (value) { if (value % 1 === 0) { return value; } }
                    }
                }
            },
            hoverRadius: 0,
            animation: {
                tension: {
                    duration: 1000,
                    easing: 'easeInBounce',
                    from: 0.6,
                    to: 0.7,
                    loop: false
                },
                onComplete: function () {
                    delayed = true;
                },
                delay: function (context) {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 5 + context.datasetIndex * 10;
                    }
                    return delay;
                },
            },
            linearGradientLine: true,
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

function renderAverageBrakingGraph(driver_data, average_data, indicators, xAxis) {
    const driverData = driver_data.map(item => parseFloat(item.speed));
    const driverTimestamp = driver_data.map(item => item.timestamp);
    let driverAcceleration = [];
    for (let i = 0; i < driverData.length - 1; i++) {
        driverAcceleration.push((- driverData[i + 10] + driverData[i]) / (driverTimestamp[i + 10] / 1000 - driverTimestamp[i] / 1000));
    }
    const averageData = average_data;
    const ctx = document.getElementById('chart5').getContext('2d');

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xAxis,
            datasets: [
                {
                    label: 'Your Speed',
                    data: driverData,
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    borderColor: function (context) {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;

                        if (!chartArea) return;
                        return getGradient(ctx, chartArea);
                    },
                    pointBorderColor: "white",
                    pointHoverBackgroundColor: "white",
                    pointRadius: 3,
                    borderWidth: 2,
                    pointBackgroundColor: function (context) {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;

                        if (!chartArea) return;
                        return getGradient(ctx, chartArea);
                    },
                },
                {
                    label: 'Average Speed',
                    data: averageData,
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    borderColor: 'grey',
                    pointBorderColor: "white",
                    pointHoverBackgroundColor: "white",
                    pointBackgroundColor: 'grey',
                    pointRadius: 3,
                    borderWidth: 2,
                    borderDash: [2, 2],
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false,
                    text: "Sales Count"
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
                annotation: {
                    annotations: indicators.map(indicator => {
                        return {
                            type: 'line',
                            mode: 'vertical',
                            scaleID: 'x',
                            value: driver_data.filter(item => parseFloat(item.timestamp) < parseFloat(indicator.timestamp)).length,
                            borderColor: 'red',
                            borderWidth: 2,
                            label: {
                                content: `Scenario at 1`,
                                enabled: true,
                                position: 'top'
                            },
                        }
                    })
                }
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
                        autoSkip: true,
                        maxTicksLimit: 7
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: false,
                    },
                    grid: {
                        color: "#f0f0f0",
                    },
                    ticks: {
                        callback: function (value) { if (value % 1 === 0) { return value; } }
                    }
                }
            },
            hoverRadius: 0,
            animation: {
                tension: {
                    duration: 1000,
                    easing: 'easeInBounce',
                    from: 0.6,
                    to: 0.7,
                    loop: false
                },
                onComplete: function () {
                    delayed = true;
                },
                delay: function (context) {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 5 + context.datasetIndex * 10;
                    }
                    return delay;
                },
            },
            linearGradientLine: true,
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
            },
        }],
    })
}