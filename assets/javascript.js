document.addEventListener('DOMContentLoaded', function() {
    const BTN_LEFT_ELEM = document.getElementById('btnLeft');
    const BTN_RIGHT_ELEM = document.getElementById('btnRight');
    const MESSAGE_ELEM = document.getElementById('message');

    // Constants for localStorage keys
    const VOTE_CHOICE_KEY = 'futuros_vote_choice';
    const VOTE_TIMESTAMP_KEY = 'futuros_vote_timestamp';
    const VOTE_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Check if user has already voted and update UI accordingly
    function checkPreviousVote() {
        const previousChoice = getVoteChoice();
        const remainingCooldown = getRemainingCooldownTime();

        if (previousChoice) {
            if (remainingCooldown > 0) {
                // User voted within cooldown period
                disableButtons();
                const timeLeft = formatTimeRemaining(remainingCooldown);
                MESSAGE_ELEM.innerHTML = `Você já votou. Poderá votar novamente em ${timeLeft}.`;
                MESSAGE_ELEM.classList.add('show');
            } else {
                // Cooldown period has passed
                enableButtons();
            }

            // Highlight the previously selected button
            if (previousChoice === 'left') {
                BTN_LEFT_ELEM.classList.add('selected');
            } else if (previousChoice === 'right') {
                BTN_RIGHT_ELEM.classList.add('selected');
            }
        }
    }

    function disableButtons() {
        BTN_LEFT_ELEM.disabled = true;
        BTN_RIGHT_ELEM.disabled = true;
    }

    function enableButtons() {
        BTN_LEFT_ELEM.disabled = false;
        BTN_RIGHT_ELEM.disabled = false;
    }

    function saveVote(choice) {
        localStorage.setItem(VOTE_CHOICE_KEY, choice);
        localStorage.setItem(VOTE_TIMESTAMP_KEY, new Date().getTime().toString());
    }

    function canVote() {
        const previousTimestamp = localStorage.getItem(VOTE_TIMESTAMP_KEY);

        if (!previousTimestamp) {
            return true;
        }

        const currentTime = new Date().getTime();
        const timeSinceLastVote = currentTime - parseInt(previousTimestamp);

        return timeSinceLastVote >= VOTE_COOLDOWN;
    }

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

    // Check for previous votes when page loads
    checkPreviousVote();

    // Button click handlers
    BTN_LEFT_ELEM.addEventListener('click', function() {
        // Remove previous selection styling
        BTN_RIGHT_ELEM.classList.remove('selected');
        BTN_LEFT_ELEM.classList.add('selected');

        if (canVote() || getVoteChoice() !== 'left') {
            saveVote('left');
            showMessage();
            disableButtons();

            // Re-enable buttons after cooldown
            setTimeout(() => {
                enableButtons();
            }, VOTE_COOLDOWN);

            // Add screen shake effect
            document.body.classList.add('shake');
            setTimeout(() => {
                document.body.classList.remove('shake');
            }, 500);
        }
    });

    BTN_RIGHT_ELEM.addEventListener('click', function() {
        // Remove previous selection styling
        BTN_LEFT_ELEM.classList.remove('selected');
        BTN_RIGHT_ELEM.classList.add('selected');

        if (canVote() || getVoteChoice() !== 'right') {
            saveVote('right');
            showMessage();
            disableButtons();

            // Re-enable buttons after cooldown
            setTimeout(() => {
                enableButtons();
            }, VOTE_COOLDOWN);

            // Add flicker effect
            const flickerEffect = setInterval(() => {
                document.body.style.opacity = Math.random() < 0.5 ? '0.7' : '1';
            }, 100);

            setTimeout(() => {
                clearInterval(flickerEffect);
                document.body.style.opacity = '1';
            }, 1000);
        }
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
