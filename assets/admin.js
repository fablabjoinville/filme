document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const leftVoteCountElem = document.getElementById('leftVoteCount');
    const rightVoteCountElem = document.getElementById('rightVoteCount');
    const voteChartFillElem = document.getElementById('voteChartFill');
    const votePercentageElem = document.getElementById('votePercentage');
    const peerLogElem = document.getElementById('peerLog');
    const adminPeerIdElem = document.getElementById('adminPeerId');
    const resetVotesBtn = document.getElementById('resetVotesBtn');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const clearLogBtn = document.getElementById('clearLogBtn');
    const exportLogBtn = document.getElementById('exportLogBtn');
    const connectionStatusElem = document.getElementById('connectionStatus');

    // Connection status
    let connectionStatus = 'Initializing';
    updateConnectionStatus('Initializing', 'pending');

    // Vote tracking
    let voteData = {
        left: 0,
        right: 0,
        peers: new Map(), // Will store peer IDs and their votes
        adminId: ADMIN_PEER_ID // Using shared constant
    };

    // Initialize PeerJS
    let peer;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 5000;
    initPeer();

    // Initialize admin peer ID display
    adminPeerIdElem.textContent = voteData.adminId;

    // Add initial log entry with timestamp
    addLogEntry('Admin dashboard initialized with ID: ' + voteData.adminId);

    // Event listeners for buttons
    resetVotesBtn.addEventListener('click', resetVotes);
    exportDataBtn.addEventListener('click', exportVoteData);
    clearLogBtn.addEventListener('click', clearLog);
    exportLogBtn.addEventListener('click', exportLog);

    // Function to update connection status display
    function updateConnectionStatus(status, type = 'normal') {
        connectionStatus = status;
        connectionStatusElem.textContent = status;

        // Remove all status classes and add the current one
        connectionStatusElem.className = '';
        connectionStatusElem.classList.add(type);
    }

    // Function to initialize PeerJS
    function initPeer() {
        updateConnectionStatus('Connecting to PeerJS server...', 'pending');

        peer = new Peer(voteData.adminId, PEER_CONFIG);

        peer.on('open', function(id) {
            reconnectAttempts = 0;
            addLogEntry('PeerJS connection established with ID: ' + id, 'connect');
            adminPeerIdElem.textContent = id;
            updateConnectionStatus('Connected', 'success');
        });

        peer.on('error', function(err) {
            console.error('PeerJS error:', err);

            addLogEntry('PeerJS error: ' + err.type, 'error');

            // Update status based on error type
            let errorMessage = 'Connection error: ' + err.type;
            updateConnectionStatus(errorMessage, 'error');

            // If the server connection failed, try to reconnect after a delay
            if (['server-error', 'network', 'unavailable-id', 'socket-error'].includes(err.type)) {
                // Destroy the peer object
                if (peer) {
                    peer.destroy();
                }

                reconnectAttempts++;

                if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
                    const delay = RECONNECT_DELAY * Math.min(reconnectAttempts, 3);
                    updateConnectionStatus(`Reconnecting in ${delay/1000}s (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`, 'pending');
                    addLogEntry(`Reconnecting in ${delay/1000} seconds (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`, 'connect');

                    setTimeout(initPeer, delay);
                } else {
                    updateConnectionStatus('Max reconnection attempts reached. Please refresh the page.', 'error');
                    addLogEntry('Max reconnection attempts reached. Please refresh the page.', 'error');
                }
            }
        });

        peer.on('connection', function(conn) {
            const peerId = conn.peer;

            conn.on('open', function() {
                addLogEntry(`Peer ${peerId} connected`, 'connect');
                voteData.peers.set(peerId, null);

                // Send current vote data to the new peer
                conn.send({
                    type: 'vote-data',
                    data: {
                        left: voteData.left,
                        right: voteData.right
                    }
                });
            });

            conn.on('data', function(data) {
                handlePeerData(peerId, data);
            });

            conn.on('close', function() {
                addLogEntry(`Peer ${peerId} disconnected`, 'disconnect');
                voteData.peers.delete(peerId);
            });

            conn.on('error', function(err) {
                addLogEntry(`Error with peer ${peerId}: ${err}`, 'error');
            });
        });

        peer.on('disconnected', function() {
            updateConnectionStatus('Disconnected from server. Attempting to reconnect...', 'pending');
            addLogEntry('Disconnected from PeerJS server. Attempting to reconnect...', 'error');

            // Try to reconnect automatically
            peer.reconnect();
        });

        peer.on('close', function() {
            updateConnectionStatus('Connection closed', 'error');
            addLogEntry('PeerJS connection closed', 'error');
        });
    }

    // Function to handle data received from peers
    function handlePeerData(peerId, data) {
        if (data.type === 'vote') {
            const vote = data.choice;
            const previousVote = voteData.peers.get(peerId);

            // If this peer already voted, subtract their previous vote
            if (previousVote) {
                if (previousVote === 'left') voteData.left--;
                else if (previousVote === 'right') voteData.right--;
            }

            // Record their new vote
            voteData.peers.set(peerId, vote);

            // Add to the vote count
            if (vote === 'left') voteData.left++;
            else if (vote === 'right') voteData.right++;

            addLogEntry(`Peer ${peerId} voted: ${vote}`, 'vote');
            updateVoteDisplay();
        }
    }

    // Function to update the vote display
    function updateVoteDisplay() {
        // Update vote counts
        leftVoteCountElem.textContent = voteData.left;
        rightVoteCountElem.textContent = voteData.right;

        // Calculate percentages
        const totalVotes = voteData.left + voteData.right;
        let leftPercentage = 0;
        let rightPercentage = 0;

        if (totalVotes > 0) {
            leftPercentage = Math.round((voteData.left / totalVotes) * 100);
            rightPercentage = 100 - leftPercentage;
        } else {
            // Default to 50/50 if no votes
            leftPercentage = 50;
            rightPercentage = 50;
        }

        // Update chart
        voteChartFillElem.style.width = leftPercentage + '%';
        votePercentageElem.textContent = `${leftPercentage}% / ${rightPercentage}%`;
    }

    // Function to add a log entry
    function addLogEntry(message, type = '') {
        const now = new Date();
        const timestamp = now.toTimeString().split(' ')[0];

        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry ' + type;

        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'timestamp';
        timestampSpan.textContent = `[${timestamp}]`;

        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;

        logEntry.appendChild(timestampSpan);
        logEntry.appendChild(messageSpan);

        peerLogElem.appendChild(logEntry);

        // Auto-scroll to bottom
        peerLogElem.scrollTop = peerLogElem.scrollHeight;
    }

    // Function to reset votes
    function resetVotes() {
        voteData.left = 0;
        voteData.right = 0;
        voteData.peers.clear();
        updateVoteDisplay();
        addLogEntry('Votes have been reset by admin', 'connect');

        // Notify all connected peers about the reset
        if (peer && peer.connections) {
            Object.keys(peer.connections).forEach(peerId => {
                const conns = peer.connections[peerId];
                conns.forEach(conn => {
                    if (conn.open) {
                        conn.send({
                            type: 'vote-reset'
                        });
                    }
                });
            });
        }
    }

    // Function to export vote data
    function exportVoteData() {
        const dataStr = JSON.stringify({
            timestamp: new Date().toISOString(),
            votes: {
                left: voteData.left,
                right: voteData.right
            },
            peerCount: voteData.peers.size
        }, null, 2);

        downloadData(dataStr, 'futuros-vote-data.json', 'application/json');
        addLogEntry('Vote data exported', 'connect');
    }

    // Function to clear log
    function clearLog() {
        // Keep only the first entry (initialization)
        while (peerLogElem.childNodes.length > 1) {
            peerLogElem.removeChild(peerLogElem.lastChild);
        }
        addLogEntry('Log cleared by admin', 'connect');
    }

    // Function to export log
    function exportLog() {
        let logText = '';
        peerLogElem.childNodes.forEach(node => {
            if (node.textContent) {
                logText += node.textContent + '\n';
            }
        });

        downloadData(logText, 'futuros-peer-log.txt', 'text/plain');
        addLogEntry('Log exported', 'connect');
    }

    // Simulate some peer connections and votes for demonstration
    // This function exists but is not called automatically
    function simulatePeerActivity() {
        // Simulate initial peers
        setTimeout(() => {
            const peerId = 'peer-' + Math.floor(Math.random() * 1000);
            addLogEntry(`Peer ${peerId} connected`, 'connect');
            voteData.peers.set(peerId, null);
        }, 2000);

        setTimeout(() => {
            const peerId = 'peer-' + Math.floor(Math.random() * 1000);
            addLogEntry(`Peer ${peerId} connected`, 'connect');
            voteData.peers.set(peerId, null);
        }, 3500);

        // Simulate votes
        setTimeout(() => {
            const peerId = Array.from(voteData.peers.keys())[0];
            const vote = 'left';
            addLogEntry(`Peer ${peerId} voted: ${vote}`, 'vote');
            voteData.peers.set(peerId, vote);
            voteData.left++;
            updateVoteDisplay();
        }, 5000);

        setTimeout(() => {
            const peerId = Array.from(voteData.peers.keys())[1];
            const vote = 'right';
            addLogEntry(`Peer ${peerId} voted: ${vote}`, 'vote');
            voteData.peers.set(peerId, vote);
            voteData.right++;
            updateVoteDisplay();
        }, 7000);

        // Simulate more activity over time
        setTimeout(() => {
            const peerId = 'peer-' + Math.floor(Math.random() * 1000);
            addLogEntry(`Peer ${peerId} connected`, 'connect');
            voteData.peers.set(peerId, null);

            setTimeout(() => {
                const vote = Math.random() > 0.5 ? 'left' : 'right';
                addLogEntry(`Peer ${peerId} voted: ${vote}`, 'vote');
                voteData.peers.set(peerId, vote);
                if (vote === 'left') voteData.left++;
                else voteData.right++;
                updateVoteDisplay();
            }, 1500);
        }, 10000);

        // Simulate a disconnection
        setTimeout(() => {
            const peerId = Array.from(voteData.peers.keys())[0];
            addLogEntry(`Peer ${peerId} disconnected`, 'disconnect');
            voteData.peers.delete(peerId);
        }, 15000);
    }
});
