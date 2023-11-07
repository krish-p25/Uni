document.addEventListener('DOMContentLoaded', function () {
    const userData = document.querySelector('.user-data');
    userData.style.transition = 'margin-left 0.5s';
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.transition = 'margin-left 0.3s';
    const sidebarTag = document.querySelectorAll('.sidebar-tag');

    document.querySelector('.first-button').addEventListener('click', function () {
        document.querySelector('.animated-icon1').classList.toggle('open');
    });

    document.querySelector('.second-button').addEventListener('click', function () {
        document.querySelector('.animated-icon2').classList.toggle('open');
    });

    userData.addEventListener('click', closeSidebar);

    // Check if CrepslockerBasket exists in localStorage
    const basket = JSON.parse(localStorage.getItem('CrepslockerBasket'));

    // Get the notification badge element
    const notificationBadge = document.querySelectorAll('.basket-notification-badge');

    notificationBadge.forEach((badge) => {
        // Update the count if the basket exists
        if (basket && basket.length > 0) {
            badge.textContent = basket.length;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    })

    fetch('https://sell.crepslocker.com/api/dash/full-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ api_key: localStorage.getItem('CrepslockerUserApiKey') }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === 200) {
                var user_commission = data.user.commission;
                if ((Date.now() - localStorage.getItem('TOLI')) < 3000) showNotification(`Welcome back, ${data.user.firstName}`);
                const profileBadge = document.querySelector('.profile-notification-badge');
                const notificationBadge = document.querySelector('.notifications-notification-badge');

                if (data.notifications.length > 0) {
                    notificationBadge.textContent = data.notifications.length > 9 ? '9+' : data.notifications.length;
                    notificationBadge.style.display = 'flex';
                }
                else {
                    notificationBadge.style.display = 'none';
                }

                if (data.hasNull) {
                    profileBadge.textContent = 1;
                    profileBadge.style.display = 'flex';
                    showNotification('Please complete your profile to start selling')
                } else {
                    profileBadge.style.display = 'none';
                }

                if (window.location.href.includes('?') ? window.location.href.split('?') : window.location.href === 'https://sell.crepslocker.com/dashboard/confirm-shipment') {
                    if (!(!!(data.user.firstName)) || !(!!(data.user.lastName)) || !(!!(data.user.address_one)) || !(!!(data.user.city)) || !(!!(data.user.postcode)) || !(!!(data.user.phone)) || !(!!(data.user.email))) {
                        document.getElementById('generate-button').disabled = true;
                        window.open('https://sell.crepslocker.com/dashboard/profile');
                        alert('Please refresh this page after you have completed your profile');
                    }

                    document.querySelector('.return-address-container').innerHTML = `
                    <div class="return-address">
                        <div style="margin-top: 10px; margin-bottom: 10px; font-weight: bold;" class="return-address-title">Return Address</div>
                        <div class="return-address-content">
                            <div class="return-address-content-name">${data.user.firstName + ' ' + data.user.lastName}</div>
                            <div class="return-address-content-address">${data.user.address_one}</div>
                            <div class="return-address-content-city">${data.user.city}</div>
                            <div class="return-address-content-postcode">${data.user.postcode}</div>
                        </div>
                    </div>`
                }
            }
            else {
                window.location.href = 'https://sell.crepslocker.com/login';
            }
        });

    const slider = document.getElementById('live-inventory');
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('scrolling');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('scrolling');
    });
    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('scrolling');
    });
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1; //scroll-fast
        slider.scrollLeft = scrollLeft - walk;
    });
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