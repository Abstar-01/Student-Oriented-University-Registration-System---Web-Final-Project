<?php
header('Content-Type: application/json');

// Start session and include database connection
session_start();
include '../DatabaseConnection.php';

// Check if student is logged in
if (!isset($_SESSION['studentid']) || empty($_SESSION['studentid'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Student not logged in. Please login again.'
    ]);
    exit();
}

// Check database connection
if (!$conn) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed'
    ]);
    exit();
}

// Get form data with validation for data types
$studentID = $_SESSION['studentid']; // VARCHAR(10)
$courses = substr($_POST['courses'] ?? '', 0, 40); // VARCHAR(40)
$registrationDate = $_POST['registrationDate'] ?? ''; // DATE (YYYY-MM-DD)
$bankAccountNumber = substr($_POST['bankAccountNumber'] ?? '', 0, 40); // VARCHAR(40)
$transactionID = substr($_POST['transactionID'] ?? '', 0, 15); // VARCHAR(15)

// FIXED: Properly handle transaction amount as float
$transactionAmount = 0;
if (isset($_POST['transactionAmount'])) {
    $transactionAmount = filter_var($_POST['transactionAmount'], FILTER_VALIDATE_FLOAT);
    if ($transactionAmount === false) {
        // If filter_var fails, try alternative parsing
        $rawAmount = $_POST['transactionAmount'];
        // Remove any non-numeric characters except decimal point
        $cleanAmount = preg_replace('/[^\d.]/', '', $rawAmount);
        $transactionAmount = floatval($cleanAmount);
    }
}

$bankName = substr($_POST['bankName'] ?? '', 0, 100); // VARCHAR(100)
$totalAmountOfCourse = intval($_POST['totalAmountOfCourse'] ?? 0); // INT

// Validate required fields
if (empty($courses) || empty($transactionID) || empty($bankAccountNumber)) {
    echo json_encode([
        'success' => false,
        'message' => 'Required fields are missing. Please select courses, enter transaction ID, and bank account number.'
    ]);
    exit();
}

// Validate date format (YYYY-MM-DD)
if (!empty($registrationDate) && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $registrationDate)) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid date format. Please use YYYY-MM-DD format.'
    ]);
    exit();
}

// Validate numeric fields
if ($transactionAmount < 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Transaction amount cannot be negative.'
    ]);
    exit();
}

if ($totalAmountOfCourse < 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Total courses cannot be negative.'
    ]);
    exit();
}

// Debug log to check the transaction amount
error_log("Transaction Amount before DB: " . $transactionAmount);

try {
    // Prepare the stored procedure call
    $sql = "CALL InsertRegistration(?, ?, ?, ?, ?, ?, ?, ?, @verificationMessage)";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    // Bind parameters with exact data types matching stored procedure
    $stmt->bind_param(
        "sssssdss", 
        $studentID,      // VARCHAR(10)
        $courses,        // VARCHAR(40)
        $registrationDate, // DATE
        $bankAccountNumber, // VARCHAR(40)
        $transactionID,  // VARCHAR(15)
        $transactionAmount, // FLOAT - now properly handled
        $bankName,       // VARCHAR(100)
        $totalAmountOfCourse // INT
    );
    
    // Execute the stored procedure
    if ($stmt->execute()) {
        // Get the output parameter
        $result = $conn->query("SELECT @verificationMessage AS message");
        $row = $result->fetch_assoc();
        $verificationMessage = $row['message'];
        
        if ($verificationMessage === 'Registration Successful') {
            echo json_encode([
                'success' => true,
                'message' => $verificationMessage
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => $verificationMessage
            ]);
        }
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

// Close connection if needed
if ($conn) {
    $conn->close();
}
?>