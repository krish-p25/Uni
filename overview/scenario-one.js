document.addEventListener('DOMContentLoaded', function () {
    fetch('https://driving.krishrp.xyz/api/scenario-one-stats', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        animateValue(document.getElementById('total-users'), 0, data.total_users, 1800, false)
        animateValue(document.getElementById('braking'), 0, (data.number_of_brakes/data.total_users).toFixed(2), 1800, true)
        animateValue(document.getElementById('velocity'), 0, data.average_velocity_x, 1800, true)
        animateValue(document.getElementById('acceleration'), 0, data.average_throttle, 1800, true)
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