// Shared utility functions for Futuros application

// Constants
const VOTE_CHOICE_KEY = 'futuros_vote_choice';
const VOTE_TIMESTAMP_KEY = 'futuros_vote_timestamp';
const VOTE_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds

// Vote tracking functions
function saveVote(choice) {
    localStorage.setItem(VOTE_CHOICE_KEY, choice);
    localStorage.setItem(VOTE_TIMESTAMP_KEY, new Date().getTime().toString());
}

function getVoteChoice() {
    return localStorage.getItem(VOTE_CHOICE_KEY);
}

function getVoteTimestamp() {
    const timestamp = localStorage.getItem(VOTE_TIMESTAMP_KEY);
    return timestamp ? parseInt(timestamp) : null;
}

function canVote() {
    const previousTimestamp = getVoteTimestamp();

    if (!previousTimestamp) {
        return true;
    }

    const currentTime = new Date().getTime();
    const timeSinceLastVote = currentTime - previousTimestamp;

    return timeSinceLastVote >= VOTE_COOLDOWN;
}

function getRemainingCooldownTime() {
    const previousTimestamp = getVoteTimestamp();

    if (!previousTimestamp) {
        return 0;
    }

    const currentTime = new Date().getTime();
    const timeSinceLastVote = currentTime - previousTimestamp;

    return Math.max(0, VOTE_COOLDOWN - timeSinceLastVote);
}

// Formatting functions
function formatTimeRemaining(milliseconds) {
    return Math.ceil(milliseconds / 60000) + ' minuto(s)';
}

// Generate a unique ID with a prefix
function generateUniqueId(prefix) {
    return prefix + '-futuros-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
}
