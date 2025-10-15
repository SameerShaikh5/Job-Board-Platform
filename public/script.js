// --- Global State Simulation ---
// Change this variable to TRUE to simulate a logged-in user!
let isLoggedIn = false; 

document.addEventListener('DOMContentLoaded', () => {
    // --- Navbar Elements ---
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    // Desktop elements
    const desktopLogin = document.getElementById('desktop-login');
    const desktopLogout = document.getElementById('desktop-logout');

    // Mobile elements
    const mobileLogin = document.getElementById('mobile-login');
    const mobileSignup = document.getElementById('mobile-signup');
    const mobileLogout = document.getElementById('mobile-logout');

    // --- State Update Function ---
    function updateLoginStatus() {
        if (isLoggedIn) {
            // Logged In: Show Logout, Hide Login/Signup links
            if (desktopLogin) desktopLogin.classList.add('hidden');
            if (desktopLogout) desktopLogout.classList.remove('hidden');

            if (mobileLogin) mobileLogin.classList.add('hidden');
            if (mobileSignup) mobileSignup.classList.add('hidden');
            if (mobileLogout) mobileLogout.classList.remove('hidden');
        } else {
            // Logged Out: Show Login/Signup, Hide Logout
            if (desktopLogin) desktopLogin.classList.remove('hidden');
            if (desktopLogout) desktopLogout.classList.add('hidden');

            if (mobileLogin) mobileLogin.classList.remove('hidden');
            if (mobileSignup) mobileSignup.classList.remove('hidden');
            if (mobileLogout) mobileLogout.classList.add('hidden');
        }
    }

    // Initial state setup
    updateLoginStatus();

    // --- Event Listeners ---

    // 1. Hamburger Menu Toggle
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 2. Logout Handlers (Desktop and Mobile)
    const handleLogout = () => {
        isLoggedIn = false;
        updateLoginStatus();
        mobileMenu.classList.add('hidden'); // Close mobile menu
        alert('You have been logged out.');
        // window.location.href = 'login.html'; // Redirect to login page
    };

    if (desktopLogout) desktopLogout.addEventListener('click', handleLogout);
    if (mobileLogout) mobileLogout.addEventListener('click', handleLogout);
    

    // 3. Filter Toggling Logic
    window.toggleFilter = function(header) {
        const body = header.nextElementSibling;
        const icon = header.querySelector('i');
    
        body.classList.toggle('active');
    
        // Dynamically adjust height for smooth transition
        if (body.classList.contains('active')) {
            // Set height based on scrollHeight only if it's currently 0 or near 0
            if (body.style.maxHeight === '0px' || body.style.maxHeight === '') {
                 body.style.maxHeight = body.scrollHeight + "px";
            }
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        } else {
            body.style.maxHeight = "0"; 
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    }
});
