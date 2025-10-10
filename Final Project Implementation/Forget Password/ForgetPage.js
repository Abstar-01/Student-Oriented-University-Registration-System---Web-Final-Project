// copy the damn code man
let notifications = document.querySelector('.notifications');
// console.log(notifications);

// let successbtn = document.querySelector("#success");
// let failurebtn = document.querySelector("#failure");
// let infobtn = document.querySelector("#info");

// create functions that each display a success, error, or information notification
function successToast(message){
  let icon = "fa-solid fa-circle-check";
  let type = "success";
  let title = "Success";

  createToast(type, icon, title, message);
}
function failureToast(message){
  let icon = "fa-solid fa-circle-xmark";
  let type = "failure";
  let title = "Failure";

  createToast(type, icon, title, message);
}
function infoToast(message){
  let icon = "fa-solid fa-circle-info";
  let type = "info";
  let title = "Info";

  createToast(type, icon, title, message);
}

function createToast(type, icon, title, message){
  let toast = document.createElement('div');
  toast.innerHTML = `
    <div class="toast ${type}">
      <i class="${icon}"></i>
      <div class="content">
        <div class="title">${title}</div>
        <span>${message}</span>
      </div>
    </div>`;
    notifications.appendChild(toast);
    setTimeout(()=>{
      console.log(toast.firstChild.nextSibling.style.animation = "hide 0.2s ease-in 1 forwards");
      setTimeout(()=>{
        notifications.removeChild(toast)
      }, 400)
    },3000)
}

// successbtn.addEventListener('click', () => successToast("Hello my niggas"));
// failurebtn.addEventListener('click', () => failureToast("Hello my niggas"));
// infobtn.addEventListener('click', () => infoToast("Hello my niggas"))

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

let timerInterval;
let otpAttempts = 0;
const MAX_OTP_ATTEMPTS = 3;
let currentEmail = '';

document.addEventListener("DOMContentLoaded", function () {
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
        startTimer(90);
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
        infoToast("Please enter a valid email address.");
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
                failureToast(data.message || 'Email verification failed.');
            }
        })
        .catch(error => {
            sendButton.textContent = originalText;
            sendButton.disabled = false;
            failureToast('An error occurred. Please try again.');
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
        failureToast(validation.message);
        return;
    }

    // Check attempt limits
    if (otpAttempts >= MAX_OTP_ATTEMPTS) {
        infoToast(`Too many failed attempts. Please request a new OTP.`);
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

document.addEventListener("DOMContentLoaded", function () {
    const otpInputs = document.querySelectorAll(".otp-input");
    const submitButton = document.querySelector(".SubmitButton");
    const resendLink = document.querySelector(".ResendOTP");

    // Optional message boxes (if not in HTML)
    let errorBox = document.getElementById("otp-error");
    let successBox = document.getElementById("otp-success");
    if (!errorBox || !successBox) {
        const messageContainer = document.createElement("div");
        errorBox = document.createElement("p");
        successBox = document.createElement("p");
        messageContainer.appendChild(errorBox);
        messageContainer.appendChild(successBox);
        document.querySelector(".OTPForm").appendChild(messageContainer);
    }

    // Auto-move focus when typing
    otpInputs.forEach((input, index) => {
        input.addEventListener("input", () => {
            if (input.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && input.value === "" && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });

    // Handle Submit click
    submitButton.addEventListener("click", async function () {
        const otp1 = document.getElementById("otp1").value.trim();
        const otp2 = document.getElementById("otp2").value.trim();
        const otp3 = document.getElementById("otp3").value.trim();
        const otp4 = document.getElementById("otp4").value.trim();

        const otp = otp1 + otp2 + otp3 + otp4;

        errorBox.textContent = "";
        successBox.textContent = "";

        if (otp.length !== 4 || !/^\d{4}$/.test(otp)) {
            infoToast("Please enter a valid 4-digit OTP.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("otp1", otp1);
            formData.append("otp2", otp2);
            formData.append("otp3", otp3);
            formData.append("otp4", otp4);

            const response = await fetch("OTPVerification.php", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server returned status ${response.status}`);
            }

            const result = await response.json();

            if (result.status === "success") {
                successToast(result.message);
                showPanel('RestPanel');
            } else if (result.status === "failure") {
                failureToast(result.message);
            } else {
                failureToast(result.message || "An unexpected error occurred.");
            }
        } catch (err) {
            failureToast("Network or server error: " + err.message);
        }
    });

    // Handle Resend OTP click
    resendLink.addEventListener("click", function (e) {
        e.preventDefault();
        infoToast("Resending OTP... (implement resend logic)");
    });
});


  //////////////////////////////////////////////////////////////////////////
 ///////////////          Resend Functionality           //////////////////
//////////////////////////////////////////////////////////////////////////

function handleResendOTP(e) {
    e.preventDefault();
    
    const resendLink = e.target;
    const originalText = resendLink.textContent;
    
    // Disable resend link temporarily to prevent spam
    resendLink.style.pointerEvents = 'none';
    resendLink.textContent = "Sending...";
    resendLink.style.opacity = "0.6";
    
    fetch('ResendOTP.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
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
        // Re-enable resend link
        resendLink.style.pointerEvents = 'auto';
        resendLink.textContent = originalText;
        resendLink.style.opacity = "1";
        
        if (data.status === 'success') {
            // Reset timer and OTP fields
            resetOTPFields();
            startTimer(90);
            enableOTPSubmission();
            successToast(data.message || "New OTP has been sent to your email.");
        } else {
            failureToast(data.message || "Failed to resend OTP. Please try again.");
        }
    })
    .catch(error => {
        // Re-enable resend link on error
        resendLink.style.pointerEvents = 'auto';
        resendLink.textContent = originalText;
        resendLink.style.opacity = "1";
        
        failureToast('An error occurred while resending OTP. Please try again.');
        console.error('Resend OTP error:', error);
    });
}

// Add this to your initializeOTPPanel function:
function initializeOTPPanel() {
    const submitButton = document.querySelector('#OTP_Panel .SubmitButton');
    const resendLink = document.querySelector('.ResendOTP');
    
    if (submitButton) {
        submitButton.addEventListener('click', handleOTPSubmission);
    }
    
    if (resendLink) {
        resendLink.addEventListener('click', handleResendOTP);
    }
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
        failureToast("Password fields cannot be empty.");
        return false;
    }

    if (password.length < 6) {
        failureToast("Password must be at least 6 characters long.");
        return false;
    }

    if (password !== confirmPassword) {
        failureToast("Passwords do not match.");
        return false;
    }

    return true;
}

function resetPasswordOnServer(password) {
    const submitButton = document.querySelector('#RestPanel .Submit');
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
                successToast("Password reset successfully! Redirecting to login...");
                setTimeout(() => {
                    window.location.href = "http://localhost:8000/Login/LoginPage.html";
                }, 1000);
            } else {
                failureToast("Error: " + data.message);
            }
        })
        .catch(error => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            failureToast("An unexpected error occurred. Please try again.");
            console.error("Password reset error:", error);
        });
}

function initializeOTPInputs() {
    document.querySelectorAll('.otp-input').forEach((input, index, inputs) => {
        input.addEventListener('input', function (e) {
            // Only allow numbers and limit to one character
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 1);

            // Auto-focus next input
            if (this.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', function (e) {
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

        input.addEventListener('paste', function (e) {
            e.preventDefault();
            infoToast("Please type the OTP digits manually.");
        });
    });
}

function handlePasswordReset() {
    const form = document.querySelector(".EmailInputForm");
    const submitButton = document.querySelector(".Submit");
    
    // Try to find error/success message elements, or create them if they don't exist
    let errorBox = document.querySelector(".error-message");
    let successBox = document.querySelector(".success-message");
    
    // If error/success boxes don't exist, create them
    if (!errorBox) {
        errorBox = document.createElement("div");
        errorBox.className = "error-message";
        errorBox.style.color = "red";
        errorBox.style.margin = "10px 0";
        if (form) {
            form.parentNode.insertBefore(errorBox, form);
        }
    }
    
    if (!successBox) {
        successBox = document.createElement("div");
        successBox.className = "success-message";
        successBox.style.color = "green";
        successBox.style.margin = "10px 0";
        if (form) {
            form.parentNode.insertBefore(successBox, form);
        }
    }

    // Get fresh values on each click
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm_password");
    
    if (!passwordInput || !confirmPasswordInput) {
        console.error("Password inputs not found");
        errorBox.textContent = "Password inputs not found.";
        return;
    }
    
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    console.log("Password:", password); // Debug log
    console.log("Confirm Password:", confirmPassword); // Debug log

    // Clear previous messages
    errorBox.textContent = "";
    successBox.textContent = "";

    // Validation - if any validation fails, return early
    if (!password || !confirmPassword) {
        infoToast("Please fill in both fields.");
        return;
    }

    if (password !== confirmPassword) {
        failureToast("Passwords do not match.");
        return;
    }

    // Additional validation to match PHP requirements
    if (password.length < 6) {
        failureToast("Password must be at least 6 characters long.");
        return;
    }

    // Check if password contains both letters and numbers
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasLetter || !hasNumber) {
        failureToast("Password must contain both letters and numbers.");
        return;
    }

    // If we pass all validations, proceed with the API call
    const formData = new FormData();
    formData.append("password", password);
    formData.append("confirm_password", confirmPassword);

    console.log("All validations passed, preparing API call...");

    // Use async function and call it immediately
    (async function() {
        console.log("I have Entered this Section of the code");
        try {
            console.log("Sending request to server..."); // Debug log
            const response = await fetch("RestPassword.php", { 
                method: "POST", 
                body: formData 
            });
            const result = await response.json();
            console.log("Server response:", result); // Debug log

            if (result.status === "success") {
                successBox.textContent = result.message;
                if (form) form.reset();

                setTimeout(() => {
                    window.location.href = "http://localhost:8000/Login/LoginPage.html";
                }, 1000);
            } else {
                errorBox.textContent = result.message;
            }
        } catch (err) {
            console.error("Fetch error:", err); // Debug log
            errorBox.textContent = "Network or server error: " + err.message;
        }
    })();
}

// Add click event listener to the button
document.querySelector(".Submit").addEventListener("click", function(e) {
    e.preventDefault();
    console.log("Button clicked"); // Debug log
    handlePasswordReset();
});