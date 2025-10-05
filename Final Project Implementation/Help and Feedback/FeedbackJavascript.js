function initializeFeedbackSystem() {
    const feedbackForm = document.querySelector('.Feed2 form');
    const feedbackTextarea = document.querySelector('.Feed2 textarea');
    const submitButton = document.querySelector('.Feed2 input[type="button"]');
    
    if (!feedbackForm || !feedbackTextarea || !submitButton) {
        console.error('Feedback form elements not found');
        return;
    }
    
    feedbackTextarea.id = 'FeedbackTextarea';
    submitButton.addEventListener('click', function(event) {
        event.preventDefault();
        submitFeedback();
    });
    
    feedbackTextarea.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            submitFeedback();
        }
    });
}

function submitFeedback() {
    const feedbackTextarea = document.querySelector('.Feed2 textarea');
    const submitButton = document.querySelector('.Feed2 input[type="button"]');
    
    if (!feedbackTextarea) {
        alert('Feedback textarea not found');
        return;
    }
    
    const feedbackText = feedbackTextarea.value.trim();
    
    if (!feedbackText) {
        alert('Please enter your feedback before submitting.');
        feedbackTextarea.focus();
        return;
    }
    
    if (feedbackText.length < 5) {
        alert('Feedback must be at least 5 characters long.');
        feedbackTextarea.focus();
        return;
    }
    
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.value = 'Submitting...';
    }
    
    const formData = new FormData();
    formData.append('feedback_text', feedbackText);
    
    fetch('StoringTheFeedback.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert(data.message);
            
            feedbackTextarea.value = '';
            showFeedbackMessage(data.message, 'success');
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error submitting feedback:', error);
        alert('Error submitting feedback: ' + error.message);
        
        showFeedbackMessage('Error: ' + error.message, 'error');
    })
    .finally(() => {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.value = 'Submit';
        }
    });
}

function showFeedbackMessage(message, type) {
    const existingMessage = document.querySelector('.feedback-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `feedback-message ${type}`;
    messageElement.textContent = message;
    messageElement.style.padding = '10px';
    messageElement.style.margin = '10px 0';
    messageElement.style.borderRadius = '5px';
    messageElement.style.textAlign = 'center';
    messageElement.style.fontWeight = 'bold';
    
    if (type === 'success') {
        messageElement.style.backgroundColor = '#d4edda';
        messageElement.style.color = '#155724';
        messageElement.style.border = '1px solid #c3e6cb';
    } else {
        messageElement.style.backgroundColor = '#f8d7da';
        messageElement.style.color = '#721c24';
        messageElement.style.border = '1px solid #f5c6cb';
    }
    
    const feedbackForm = document.querySelector('.Feed2 form');
    if (feedbackForm) {
        feedbackForm.insertBefore(messageElement, feedbackForm.firstChild);
        
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }
}

function loadPreviousFeedback() {
    fetch('get_feedback.php')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.feedback.length > 0) {
                console.log('Previous feedback loaded:', data.feedback);
            }
        })
        .catch(error => {
            console.error('Error loading previous feedback:', error);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    initializeFeedbackSystem();
});