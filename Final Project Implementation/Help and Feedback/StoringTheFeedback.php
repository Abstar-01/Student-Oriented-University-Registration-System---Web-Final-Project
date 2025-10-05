<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include '../DatabaseConnection.php';

if (!isset($_SESSION['studentid'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Not logged in or session expired'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
    exit;
}

$feedbackText = $_POST['feedback_text'] ?? '';

if (empty($feedbackText)) {
    echo json_encode([
        'success' => false,
        'message' => 'Feedback text cannot be empty'
    ]);
    exit;
}

$feedbackText = trim($feedbackText);
if (strlen($feedbackText) < 5) {
    echo json_encode([
        'success' => false,
        'message' => 'Feedback must be at least 5 characters long'
    ]);
    exit;
}

$studentid = $_SESSION['studentid'];

try {
    $query = "INSERT INTO Feedback (StudentID, TextDescription, DateAndTime) VALUES (?, ?, NOW())";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $studentid, $feedbackText);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Feedback submitted successfully! Thank you for your feedback.'
        ]);
    } else {
        throw new Exception('Failed to insert feedback: ' . $stmt->error);
    }
    
    $stmt->close();
    
} catch (Throwable $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>