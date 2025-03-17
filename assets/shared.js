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
    return true;
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
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `User ID: ${user.id} | Display Name: ${user.email || 'Anonymous'}`;
    userInfo.style.fontSize = '0.8rem';
    userInfo.style.marginTop = '5px';
    footer.appendChild(userInfo);
  }
}

// Function to setup vote buttons
function setupVoteButtons(pageName, leftBtn, rightBtn, messageDiv, leftText, rightText) {
  if (!leftBtn || !rightBtn || !messageDiv) {
    console.error('Required elements not found');
    return;
  }

  leftBtn.addEventListener('click', async () => {
    const result = await saveVote(pageName, 'left');
    if (result) {
      messageDiv.textContent = `Voto registrado: ${leftText}`;
      // Redirect or perform next action after vote
      // window.location.href = 'next-page.html';
    } else {
      messageDiv.textContent = 'Erro ao registrar voto. Tente novamente.';
    }
  });

  rightBtn.addEventListener('click', async () => {
    const result = await saveVote(pageName, 'right');
    if (result) {
      messageDiv.textContent = `Voto registrado: ${rightText}`;
      // Redirect or perform next action after vote
      // window.location.href = 'next-page.html';
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
