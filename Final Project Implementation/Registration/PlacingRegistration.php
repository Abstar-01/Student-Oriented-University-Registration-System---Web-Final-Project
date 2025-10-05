<?php
header('Content-Type: application/json');
include '../DatabaseConnection.php';

$response = ["success" => false, "message" => "Unknown error"];

try {
    // Collect data
    $transactionID = $_POST['transaction_id'] ?? '';
    $transactionAmount = $_POST['transaction_amount'] ?? 0;
    $bankName = $_POST['bank_name'] ?? '';
    $selectedCourses = $_POST['selected_courses'] ?? [];

    // Basic validation
    if (empty($transactionID) || empty($bankName) || empty($selectedCourses)) {
        throw new Exception("All fields are required");
    }

    // Prepare statement (assuming table: Registration)
    $stmt = $conn->prepare("INSERT INTO Registration (TransactionID, TransactionAmount, BankName, CourseCode, RegistrationDate) VALUES (?, ?, ?, ?, NOW())");

    if (!$stmt) {
        throw new Exception("Database error: " . $conn->error);
    }

    $successCount = 0;
    foreach ($selectedCourses as $courseCode) {
        // Bind parameters for each course
        // 4 parameters → "sdss" = string, double, string, string
        $stmt->bind_param("sdss", $transactionID, $transactionAmount, $bankName, $courseCode);
        
        if ($stmt->execute()) {
            $successCount++;
        }
    }

    if ($successCount > 0) {
        $response["success"] = true;
        $response["message"] = "Courses registered successfully";
        $response["courses_registered"] = implode(", ", $selectedCourses);
        $response["total_courses"] = $successCount;
    } else {
        throw new Exception("No course was registered");
    }

} catch (Exception $e) {
    $response["success"] = false;
    $response["message"] = "Database error: " . $e->getMessage();
}

echo json_encode($response);
?>
