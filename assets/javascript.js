document.addEventListener('DOMContentLoaded', function() {
    const BTN_LEFT_ELEM = document.getElementById('btnLeft');
    const BTN_RIGHT_ELEM = document.getElementById('btnRight');
    const MESSAGE_ELEM = document.getElementById('message');

    // Add blood drips randomly
    function addBloodDrips() {
        const CONTAINER_ELEM = document.querySelector('.container');
        const numDrips = Math.floor(Math.random() * 5) + 3;

        for (let i = 0; i < numDrips; i++) {
            const drip = document.createElement('div');
            drip.classList.add('blood-drip');
            drip.style.left = `${Math.random() * 100}%`;
            drip.style.animationDelay = `${Math.random() * 2}s`;
            CONTAINER_ELEM.appendChild(drip);

            // Remove drip after animation
            setTimeout(() => {
                drip.remove();
            }, 5000);
        }
    }

    // Add initial blood drips
    addBloodDrips();

    // Add more blood drips periodically
    setInterval(addBloodDrips, 8000);

    // Button click handlers
    BTN_LEFT_ELEM.addEventListener('click', function() {
        showMessage();

        // Add screen shake effect
        document.body.classList.add('shake');
        setTimeout(() => {
            document.body.classList.remove('shake');
        }, 500);
    });

    BTN_RIGHT_ELEM.addEventListener('click', function() {
        showMessage();

        // Add flicker effect
        const flickerEffect = setInterval(() => {
            document.body.style.opacity = Math.random() < 0.5 ? '0.7' : '1';
        }, 100);

        setTimeout(() => {
            clearInterval(flickerEffect);
            document.body.style.opacity = '1';
        }, 1000);
    });

    function showMessage() {
        resetMessageElement();
        animateMessage();
        typeWriterEffect();
        playHeartbeatSound();
    }

    function resetMessageElement() {
        MESSAGE_ELEM.className = 'message';
        void MESSAGE_ELEM.offsetWidth; // Trigger reflow
    }

    function animateMessage() {
        setTimeout(() => {
            MESSAGE_ELEM.classList.add('show');
        }, 100);
    }

    function typeWriterEffect() {
        const messageText = "O destino de Lian foi escolhido.";

        MESSAGE_ELEM.innerHTML = '';
        let i = 0;
        const typeSpeed = 30;

        const typeWriter = setInterval(() => {
            if (i < messageText.length) {
                MESSAGE_ELEM.innerHTML += messageText.charAt(i);
                i++;
            } else {
                clearInterval(typeWriter);
            }
        }, typeSpeed);
    }

    function playHeartbeatSound() {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-horror-deep-drum-heartbeat-518.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
});
