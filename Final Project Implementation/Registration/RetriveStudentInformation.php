<?php
session_start();
header('Content-Type: application/json;');//charset=utf-8
include '../DatabaseConnection.php';

if (!isset($_SESSION['studentid'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Not logged in or session expired'
    ]);
    exit;
}

$studentid = $_SESSION['studentid'];

try {
    $query = "
        SELECT 
            CONCAT(FirstName, ' ', MiddleName, ' ', LastName) AS FullName,
            StudentID,
            Batch,
            PhoneNumber,
            Program,
            AcademicYear,
            Email
        FROM Student
        WHERE StudentID = ?
    ";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $studentid);
    $stmt->execute();
    $result = $stmt->get_result();
    $studentInfo = $result->fetch_assoc();
    $stmt->close();
    
    if ($studentInfo) {
        echo json_encode([
            'success' => true,
            'data' => $studentInfo
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Student not found'
        ]);
    }

} catch (Throwable $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>