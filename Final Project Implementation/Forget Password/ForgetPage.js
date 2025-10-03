let timerInterval;
let otpAttempts = 0;
const MAX_OTP_ATTEMPTS = 3;
let currentEmail = '';

document.addEventListener("DOMContentLoaded", function() {
    initializeApplication();
});

function initializeApplication() {
    showPanel('EmailPanel');
    initializeEmailPanel();
    initializeOTPPanel();
    initializeRestPanel();
    initializeOTPInputs();
}

function startTimer(seconds) {
    clearInterval(timerInterval);
    const timerDisplay = document.querySelector(".OTP_Timer");
    let timeLeft = seconds;
    timerDisplay.textContent = timeLeft + "s";

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft + "s";
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerDisplay.textContent = "Expired";
            disableOTPSubmission();
        }
    }, 1000);
}

function disableOTPSubmission() {
    const submitButton = document.querySelector('#OTP_Panel .SubmitButton');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.style.opacity = "0.6";
        submitButton.style.cursor = "not-allowed";
    }
}

function enableOTPSubmission() {
    const submitButton = document.querySelector('#OTP_Panel .SubmitButton');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.style.opacity = "1";
        submitButton.style.cursor = "pointer";
    }
}

function showPanel(panelId) {
    // Hide all panels
    document.querySelectorAll('.panel').forEach(panel => {
        panel.style.display = 'none';
    });
    
    // Show target panel
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
        targetPanel.style.display = 'block';
    }

    // Panel-specific initialization
    if (panelId === 'OTP_Panel') {
        resetOTPFields();
        startTimer(60);
        enableOTPSubmission();
    } else if (panelId === 'EmailPanel') {
        otpAttempts = 0; // Reset attempts when returning to email
    }
}

function resetOTPFields() {
    document.querySelectorAll('#OTP_Panel .otp-input').forEach(input => {
        input.value = '';
    });
    const firstInput = document.querySelector('#OTP_Panel .otp-input');
    if (firstInput) firstInput.focus();
}

function initializeEmailPanel() {
    const sendButton = document.querySelector('#EmailPanel .SendButton');
    const emailInput = document.querySelector('#EmailPanel .EmailButton');

    if (sendButton && emailInput) {
        sendButton.addEventListener('click', handleEmailSubmission);
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleEmailSubmission();
        });
    }
}

function handleEmailSubmission() {
    const emailInput = document.querySelector('#EmailPanel .EmailButton');
    const emailValue = emailInput.value.trim();

    if (!validateEmail(emailValue)) {
        alert("Please enter a valid email address.");
        emailInput.focus();
        return;
    }

    currentEmail = emailValue;
    verifyEmailWithServer(emailValue);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function verifyEmailWithServer(email) {
    const sendButton = document.querySelector('#EmailPanel .SendButton');
    const originalText = sendButton.textContent;
    
    sendButton.textContent = "Sending...";
    sendButton.disabled = true;

    fetch('EmailVerification.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${encodeURIComponent(email)}`
    })
    .then(async response => {
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new Error(`Unexpected response format`);
        }
        return response.json();
    })
    .then(data => {
        sendButton.textContent = originalText;
        sendButton.disabled = false;

        if (data.status === 'success') {
            showPanel('OTP_Panel');
        } else {
            alert(data.message || 'Email verification failed.');
        }
    })
    .catch(error => {
        sendButton.textContent = originalText;
        sendButton.disabled = false;
        alert('An error occurred. Please try again.');
        console.error('Email verification error:', error);
    });
}

function initializeOTPPanel() {
    const submitButton = document.querySelector('#OTP_Panel .SubmitButton');
    if (submitButton) {
        submitButton.addEventListener('click', handleOTPSubmission);
    }
}

function handleOTPSubmission() {
    // Validate OTP inputs first
    const validation = validateOTPInputs();
    if (!validation.isValid) {
        alert(validation.message);
        return;
    }

    // Check attempt limits
    if (otpAttempts >= MAX_OTP_ATTEMPTS) {
        alert(`Too many failed attempts. Please request a new OTP.`);
        disableOTPSubmission();
        return;
    }

    verifyOTPWithServer(validation.otpValue);
}

function validateOTPInputs() {
    const inputs = document.querySelectorAll('#OTP_Panel .otp-input');
    let allFilled = true;
    let otpValue = '';
    
    inputs.forEach((input) => {
        const value = input.value.trim();
        if (!value) allFilled = false;
        otpValue += value;
    });

    if (!allFilled) {
        return { isValid: false, message: "Please fill in all OTP digits." };
    }

    if (!/^\d+$/.test(otpValue)) {
        return { isValid: false, message: "OTP must contain only numbers." };
    }

    if (otpValue.length !== inputs.length) {
        return { isValid: false, message: `Please enter a complete ${inputs.length}-digit OTP code.` };
    }

    return { isValid: true, otpValue: otpValue };
}

function verifyOTPWithServer(otpValue) {
    const submitButton = document.querySelector('#OTP_Panel .SubmitButton');
    const originalText = submitButton.textContent;
    
    submitButton.textContent = "Verifying...";
    submitButton.disabled = true;

    const inputs = document.querySelectorAll('#OTP_Panel .otp-input');
    let otpData = {};
    inputs.forEach((input, index) => {
        otpData[`otp${index + 1}`] = input.value;
    });

    fetch('OTPVerification.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(otpData).toString()
    })
    .then(response => {
        // First, get the raw text response
        return response.text().then(text => {
            try {
                // Try to parse as JSON
                const data = JSON.parse(text);
                return data;
            } catch (e) {
                // If JSON parsing fails, throw an error with the raw text
                console.error('Raw server response (not JSON):', text);
                throw new Error(`Server returned invalid JSON. Response: ${text.substring(0, 100)}`);
            }
        });
    })
    .then(data => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;

        if (data.status === 'success') {
            otpAttempts = 0;
            showPanel('RestPanel');
        } else {
            otpAttempts++;
            const attemptsLeft = MAX_OTP_ATTEMPTS - otpAttempts;
            
            if (attemptsLeft > 0) {
                alert(`${data.message}\n\nYou have ${attemptsLeft} attempt(s) remaining.`);
                resetOTPFields();
            } else {
                alert(`${data.message}\n\nNo attempts remaining. Please request a new OTP.`);
                disableOTPSubmission();
            }
        }
    })
    .catch(error => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        alert("OTP verification failed. Please try again.");
        console.error("OTP verification error:", error);
    });
}

function initializeRestPanel() {
    const submitButton = document.querySelector('#RestPanel .SendButton');
    const passwordInput = document.querySelector('#RestPanel .RestPassword input');
    const confirmInput = document.querySelector('#RestPanel .ConfirmPassword input');

    if (submitButton && passwordInput && confirmInput) {
        submitButton.addEventListener('click', handlePasswordReset);
        
        [passwordInput, confirmInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handlePasswordReset();
            });
        });
    }
}

function handlePasswordReset() {
    const passwordInput = document.querySelector('#RestPanel .RestPassword input');
    const confirmInput = document.querySelector('#RestPanel .ConfirmPassword input');
    
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();

    if (!validatePassword(password, confirmPassword)) {
        return;
    }

    resetPasswordOnServer(password);
}

function validatePassword(password, confirmPassword) {
    if (!password || !confirmPassword) {
        alert("Password fields cannot be empty.");
        return false;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return false;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return false;
    }

    return true;
}

function resetPasswordOnServer(password) {
    const submitButton = document.querySelector('#RestPanel .SendButton');
    const originalText = submitButton.textContent;
    
    submitButton.textContent = "Updating...";
    submitButton.disabled = true;

    const formData = new FormData();
    formData.append("password", password);

    fetch("RestPassword.php", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        return response.json();
    })
    .then(data => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;

        if (data.status === "success") {
            alert("Password reset successfully! Redirecting to login...");
            setTimeout(() => {
                window.location.href = "http://localhost:8000/Login/LoginPage.html";
            }, 1000);
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        alert("An unexpected error occurred. Please try again.");
        console.error("Password reset error:", error);
    });
}

function initializeOTPInputs() {
    document.querySelectorAll('.otp-input').forEach((input, index, inputs) => {
        input.addEventListener('input', function(e) {
            // Only allow numbers and limit to one character
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 1);
            
            // Auto-focus next input
            if (this.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', function(e) {
            // Handle backspace
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                inputs[index - 1].focus();
            }
            
            // Handle arrow keys
            if (e.key === 'ArrowLeft' && index > 0) {
                inputs[index - 1].focus();
                e.preventDefault();
            }
            
            if (e.key === 'ArrowRight' && index < inputs.length - 1) {
                inputs[index + 1].focus();
                e.preventDefault();
            }
        });
        
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            alert("Please type the OTP digits manually.");
        });
    });
}