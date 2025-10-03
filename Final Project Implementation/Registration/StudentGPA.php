<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['gpa'])) {
    echo json_encode([
        'success' => false,
        'message' => 'GPA not found in session'
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'gpa' => $_SESSION['gpa']
]);
?>