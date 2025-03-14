document.addEventListener('DOMContentLoaded', function() {
    const BTN_LEFT_ELEM = document.getElementById('btnLeft');
    const BTN_RIGHT_ELEM = document.getElementById('btnRight');
    const MESSAGE_ELEM = document.getElementById('message');
    const CONNECTION_STATUS_ELEM = document.getElementById('connectionStatus');

    // Constants for localStorage keys
    const VOTE_CHOICE_KEY = 'futuros_vote_choice';
    const VOTE_TIMESTAMP_KEY = 'futuros_vote_timestamp';
    const VOTE_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds

    // PeerJS variables
    let peer = null;
    let conn = null;
    let peerId = null;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 5000;

    // Update connection status
    function updateConnectionStatus(status, isError = false) {
        CONNECTION_STATUS_ELEM.textContent = status;
        CONNECTION_STATUS_ELEM.className = 'connection-indicator';

        if (isError) {
            CONNECTION_STATUS_ELEM.classList.add('error');
        } else {
            CONNECTION_STATUS_ELEM.classList.remove('error');
        }

        // Show the status briefly, then fade out
        CONNECTION_STATUS_ELEM.classList.add('show');

        if (!isError) {
            setTimeout(() => {
                CONNECTION_STATUS_ELEM.classList.remove('show');
            }, 3000);
        }
    }

    // Initialize PeerJS
    initPeer();

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

    // Initialize PeerJS
    function initPeer() {
        updateConnectionStatus('Connecting...');

        // Create a new peer with a random ID
        peer = new Peer(generateUniqueId('user'), {
            host: '0.peerjs.com',
            key: 'futuros-filme',
            secure: false,
            port: 443,
            path: '/',
            debug: 1,
            config: {
                "iceServers": [{ "urls": "stun:stun2.1.google.com:19302" }],
                'iceCandidatePoolSize': 10
            }
        });

        peer.on('open', function(id) {
            console.log('Connected to PeerJS with ID:', id);
            peerId = id;
            reconnectAttempts = 0;
            updateConnectionStatus('Connected to network');

            // Connect to the admin peer
            connectToAdmin();
        });

        peer.on('error', function(err) {
            console.error('PeerJS error:', err);

            // Display error to user
            updateConnectionStatus('Connection error: ' + err.type, true);

            // Try to reconnect if there's a connection issue
            if (['server-error', 'network', 'unavailable-id', 'socket-error'].includes(err.type)) {
                // Destroy the peer object
                if (peer) {
                    peer.destroy();
                }

                reconnectAttempts++;

                if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
                    const delay = RECONNECT_DELAY * Math.min(reconnectAttempts, 3);
                    updateConnectionStatus(`Reconnecting in ${delay/1000}s (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`, true);

                    setTimeout(initPeer, delay);
                } else {
                    updateConnectionStatus('Connection failed. Please refresh the page.', true);
                }
            }
        });

        peer.on('disconnected', function() {
            updateConnectionStatus('Disconnected. Attempting to reconnect...', true);

            // Try to reconnect automatically
            peer.reconnect();
        });

        peer.on('close', function() {
            updateConnectionStatus('Connection closed. Refresh to reconnect.', true);
        });
    }

    // Connect to the admin peer
    function connectToAdmin() {
        if (!peer) return;

        updateConnectionStatus('Connecting to voting system...');
        conn = peer.connect(ADMIN_PEER_ID);

        conn.on('open', function() {
            console.log('Connected to admin peer');
            updateConnectionStatus('Connected to voting system');

            // Send any existing vote immediately upon connection
            const existingVote = getVoteChoice();
            if (existingVote) {
                sendVoteToAdmin(existingVote);
            }
        });

        conn.on('data', function(data) {
            // Handle data received from admin peer
            handleAdminData(data);
        });

        conn.on('close', function() {
            console.log('Disconnected from admin peer');
            updateConnectionStatus('Disconnected from voting system', true);

            // Try to reconnect after a delay
            setTimeout(connectToAdmin, 5000);
        });

        conn.on('error', function(err) {
            console.error('Connection error:', err);
            updateConnectionStatus('Error connecting to voting system', true);

            // Try to reconnect after a delay
            setTimeout(connectToAdmin, 5000);
        });
    }

    // Handle data received from admin
    function handleAdminData(data) {
        if (data.type === 'vote-reset') {
            // Admin reset the votes, clear local storage
            localStorage.removeItem(VOTE_CHOICE_KEY);
            localStorage.removeItem(VOTE_TIMESTAMP_KEY);

            // Update the UI
            BTN_LEFT_ELEM.classList.remove('selected');
            BTN_RIGHT_ELEM.classList.remove('selected');
            MESSAGE_ELEM.classList.remove('show');
            enableButtons();
        }
    }

    // Send vote to admin
    function sendVoteToAdmin(choice) {
        if (conn && conn.open) {
            conn.send({
                type: 'vote',
                choice: choice
            });
            console.log('Vote sent to admin:', choice);
        } else {
            console.warn('Cannot send vote: not connected to admin');
            // Try to reconnect
            connectToAdmin();
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

        // Send the vote to admin via PeerJS
        sendVoteToAdmin(choice);
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
