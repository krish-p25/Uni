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
            
                //find average speed
                const averageSpeed = data.data.reduce((acc, curr) => acc + parseFloat(curr.speed), 0) / data.data.length;
                animateValue(document.querySelector('.speed-number-value-container'), 0, averageSpeed, 1500, true);
            
                //pass values into compare with averages function
                compareWithAverages(steeringActions, brakingActions, driveDuration, averageSpeed);
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

function compareWithAverages(steeringActions, brakingActions, driveDuration, averageSpeed) {
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

        }
    })
}