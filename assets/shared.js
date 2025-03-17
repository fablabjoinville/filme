// Supabase configuration
const SUPABASE_URL = 'https://kmpsnfiuunmocikuzpew.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttcHNuZml1dW5tb2Npa3V6cGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNjI4MjksImV4cCI6MjA1NzczODgyOX0.QEdhbw3DAEzdONvMPgikb1-ovePoVciZ01qlnyTfY74';

// Initialize the Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to save a vote to Supabase
async function saveVote(voting, choice) {
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      console.error('No authenticated user found');
      return false;
    }

    // Check if user has already voted on this voting
    const { data: existingVotes, error: checkError } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('voting', voting);

    if (checkError) {
      console.error('Error checking existing votes:', checkError.message);
      return false;
    }

    // If user has already voted on this voting, don't allow another vote
    if (existingVotes && existingVotes.length > 0) {
      console.log('User has already voted on this voting');
      return { alreadyVoted: true };
    }

    // Save vote to the votes table
    const { data, error } = await supabase
      .from('votes')
      .insert([
        {
          user_id: userData.user.id,
          voting: voting,
          choice: choice,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error saving vote:', error.message);
      return false;
    }

    console.log('Vote saved successfully');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error saving vote:', error.message);
    return false;
  }
}

// Function to handle anonymous sign-in
async function signInAnonymously() {
  try {
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error('Error during anonymous sign-in:', error.message);
      return null;
    }

    console.log('Anonymous user signed in successfully');
    return data;
  } catch (error) {
    console.error('Unexpected error during anonymous sign-in:', error.message);
    return null;
  }
}

// Function to get the current user
function getCurrentUser() {
  return supabase.auth.getUser();
}

// Function to check if user is authenticated
function isAuthenticated() {
  return supabase.auth.getSession().then(({ data }) => {
    return !!data.session;
  });
}

// Function to sign out
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error during sign out:', error.message);
    return false;
  }
  return true;
}

// Function to update footer with user information
function updateFooterWithUserInfo(user) {
  const footer = document.querySelector('footer');
  if (footer && user) {
    // Remove any existing user-info elements
    const existingUserInfo = footer.querySelector('.user-info');
    if (existingUserInfo) {
      footer.removeChild(existingUserInfo);
    }

    // Create and add the new user-info element
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `User ID: ${user.id} | Display Name: ${user.email || 'Anonymous'}`;
    userInfo.style.fontSize = '0.8rem';
    userInfo.style.marginTop = '5px';
    footer.appendChild(userInfo);
  }
}

// Function to check if user has already voted on a specific voting
async function hasUserVoted(voting) {
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      console.error('No authenticated user found');
      return false;
    }

    // Check if user has already voted on this voting
    const { data: existingVotes, error } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('voting', voting);

    if (error) {
      console.error('Error checking existing votes:', error.message);
      return false;
    }

    // Return true if user has already voted
    return existingVotes && existingVotes.length > 0;
  } catch (error) {
    console.error('Unexpected error checking votes:', error.message);
    return false;
  }
}

// Function to setup vote buttons
function setupVoteButtons(pageName, leftBtn, rightBtn, messageDiv, leftText, rightText) {
  if (!leftBtn || !rightBtn || !messageDiv) {
    console.error('Required elements not found');
    return;
  }

  // Check if user has already voted when page loads
  hasUserVoted(pageName).then(alreadyVoted => {
    if (alreadyVoted) {
      messageDiv.textContent = 'Você já votou nesta questão.';
      leftBtn.disabled = true;
      rightBtn.disabled = true;
    }
  });

  leftBtn.addEventListener('click', async () => {
    const result = await saveVote(pageName, 'left');
    if (result && result.success) {
      messageDiv.textContent = `Voto registrado: ${leftText}`;
      // Disable both buttons after successful vote
      leftBtn.disabled = true;
      rightBtn.disabled = true;
      // Redirect or perform next action after vote
      // window.location.href = 'next-page.html';
    } else if (result && result.alreadyVoted) {
      messageDiv.textContent = 'Você já votou nesta questão.';
      // Disable both buttons if already voted
      leftBtn.disabled = true;
      rightBtn.disabled = true;
    } else {
      messageDiv.textContent = 'Erro ao registrar voto. Tente novamente.';
    }
  });

  rightBtn.addEventListener('click', async () => {
    const result = await saveVote(pageName, 'right');
    if (result && result.success) {
      messageDiv.textContent = `Voto registrado: ${rightText}`;
      // Disable both buttons after successful vote
      leftBtn.disabled = true;
      rightBtn.disabled = true;
      // Redirect or perform next action after vote
      // window.location.href = 'next-page.html';
    } else if (result && result.alreadyVoted) {
      messageDiv.textContent = 'Você já votou nesta questão.';
      // Disable both buttons if already voted
      leftBtn.disabled = true;
      rightBtn.disabled = true;
    } else {
      messageDiv.textContent = 'Erro ao registrar voto. Tente novamente.';
    }
  });
}

// Initialize anonymous authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is already authenticated
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    // If no session exists, sign in anonymously
    const userData = await signInAnonymously();
    if (userData && userData.user) {
      updateFooterWithUserInfo(userData.user);
    }
  } else {
    console.log('User already has an active session');
    const { data: userData } = await supabase.auth.getUser();
    if (userData && userData.user) {
      updateFooterWithUserInfo(userData.user);
    }
  }
});
