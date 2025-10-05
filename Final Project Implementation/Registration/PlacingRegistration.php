<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include '../DatabaseConnection.php';

if (!isset($_SESSION['studentid'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get POST data
$transactionID = $_POST['transaction_id'] ?? '';
$transactionAmount = floatval($_POST['transaction_amount'] ?? 0);
$bankName = $_POST['bank_name'] ?? '';
$selectedCourses = $_POST['selected_courses'] ?? [];

// Validation
if (empty($transactionID) || empty($bankName) || empty($selectedCourses) || $transactionAmount <= 0) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

$studentid = $_SESSION['studentid'];

try {
    $conn->begin_transaction();
    $successCount = 0;
    
    // Convert courses to comma-separated string and count total courses
    $courseCodesString = implode(',', $selectedCourses);
    $totalCourses = count($selectedCourses);
    
    // Insert one record with all course codes appended together
    $query = "INSERT INTO Registration (StudentID, Courses, RegistrationDate, TransactionID, TransactionAmount, BankName, TotalAmountOfCourse) 
             VALUES (?, ?, CURDATE(), ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sssdss", $studentid, $courseCodesString, $transactionID, $transactionAmount, $bankName, $totalCourses);
    
    if ($stmt->execute()) {
        $successCount++;
    }
    $stmt->close();
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => "Successfully registered $totalCourses course(s)",
        'courses_registered' => $courseCodesString,
        'total_courses' => $totalCourses,
        'registration_id' => $conn->insert_id
    ]);
    
} catch (Throwable $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>