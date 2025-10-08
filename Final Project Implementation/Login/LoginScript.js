document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');

    if (!form) {
        console.error('Form with id="loginForm" not found!');
        return;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // prevent default form submission

        const formData = new FormData(form);

        // Fetch the PHP script
        fetch('../Login/login.php', { 
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show alert for testing
                alert(`Login successful!`);
                // Optional: redirect to home page
                window.location.href = 'http://localhost:8000/Home%20Page/Home.html';
            } else {
                alert(data.message || 'Login failed');
            }
        })
        .catch(err => {
            console.error('Fetch error:', err);
            console.log(err);
            alert('Network or server error');
        });
    });
});
