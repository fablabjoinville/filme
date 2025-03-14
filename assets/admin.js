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

    // Vote tracking
    let voteData = {
        left: 0,
        right: 0,
        peers: new Map(), // Will store peer IDs and their votes
        adminId: generateUniqueId('admin') // Use shared function instead of generateAdminId
    };

    // Initialize admin peer ID display
    adminPeerIdElem.textContent = voteData.adminId;

    // Add initial log entry with timestamp
    addLogEntry('Admin dashboard initialized with ID: ' + voteData.adminId);

    // Event listeners for buttons
    resetVotesBtn.addEventListener('click', resetVotes);
    exportDataBtn.addEventListener('click', exportVoteData);
    clearLogBtn.addEventListener('click', clearLog);
    exportLogBtn.addEventListener('click', exportLog);

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
    // This will be replaced with actual P2P functionality later
    simulatePeerActivity();

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

    // Add a note about future P2P implementation
    addLogEntry('Note: This is a simulation. P2P functionality will be implemented later.', '');
});
