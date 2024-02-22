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
                const driveDuration = data.data.sort((a, b) => a.timestamp - b.timestamp).reduce((acc, curr, index, array) => {
                    if (index === 0) {
                        return 0;
                    }
                    return acc + (curr.timestamp - array[index - 1].timestamp);
                }, 0);
                const minutes = Math.floor(driveDuration / 60000);
                const seconds = driveDuration % 60;
                document.querySelector('.inventory-value-number-value-container').textContent = `${minutes}m ${seconds}s`;
                
                //find total steering actions value from seeing how many time the steering value changes from incresaing to decreasing or vice versa
                const steeringActions = data.data.reduce((acc, curr, index, array) => {
                    if (index === 0) {
                        return 0;
                    }
                    if (array[index - 1].steering > curr.steering && array[index + 1]?.steering > curr.steering) {
                        return acc + 1;
                    }
                    if (array[index - 1].steering < curr.steering && array[index + 1].steering < curr.steering) {
                        return acc + 1;
                    }
                    return acc;
                }, 0);
                animateValue(document.querySelector('.all-time-sales-number-value-container'), 0, steeringActions, 1500, false);
            
                //find total braking actions value by seeing how many brake values of 1 have a value of 0 before
                const brakingActions = resultsArray.filter(item => item.brake > 0 && resultsArray[resultsArray.indexOf(item) - 1]?.brake == 0).length
                animateValue(document.querySelector('.available-balance-number-value-container'), 0, brakingActions, 1500, false);
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