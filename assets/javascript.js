document.addEventListener('DOMContentLoaded', function() {
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const message = document.getElementById('message');

    // Add blood drips randomly
    function addBloodDrips() {
        const container = document.querySelector('.container');
        const numDrips = Math.floor(Math.random() * 5) + 3;

        for (let i = 0; i < numDrips; i++) {
            const drip = document.createElement('div');
            drip.classList.add('blood-drip');
            drip.style.left = `${Math.random() * 100}%`;
            drip.style.animationDelay = `${Math.random() * 2}s`;
            container.appendChild(drip);

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
    btnLeft.addEventListener('click', function() {
        showMessage();

        // Add screen shake effect
        document.body.classList.add('shake');
        setTimeout(() => {
            document.body.classList.remove('shake');
        }, 500);
    });

    btnRight.addEventListener('click', function() {
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
        message.className = 'message';
        void message.offsetWidth; // Trigger reflow
    }

    function animateMessage() {
        setTimeout(() => {
            message.classList.add('show');
        }, 100);
    }

    function typeWriterEffect() {
        const messageText = "O destino de Lian foi escolhido.";

        message.innerHTML = '';
        let i = 0;
        const typeSpeed = 30;

        const typeWriter = setInterval(() => {
            if (i < messageText.length) {
                message.innerHTML += messageText.charAt(i);
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
