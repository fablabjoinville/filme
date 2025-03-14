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
        message.innerHTML = "O destino de Lian foi escolhido.";
        showMessage();

        // Add screen shake effect
        document.body.classList.add('shake');
        setTimeout(() => {
            document.body.classList.remove('shake');
        }, 500);
    });

    btnRight.addEventListener('click', function() {
        message.innerHTML = "O destino de Lian foi escolhido.";
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
        // Clear previous message styling
        message.className = 'message';
        void message.offsetWidth; // Trigger reflow

        // Add show class with slight delay for effect
        setTimeout(() => {
            message.classList.add('show');
        }, 100);

        // Add typing effect
        const text = message.innerHTML;
        message.innerHTML = '';
        let i = 0;
        const typeWriter = setInterval(() => {
            if (i < text.length) {
                message.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(typeWriter);
            }
        }, 30);

        // Add heartbeat sound effect
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-horror-deep-drum-heartbeat-518.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
});
