<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include '../DatabaseConnection.php';

// Ensure batch exists in session
if (!isset($_SESSION['batch'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Batch not found in session'
    ]);
    exit;
}

$batch = $_SESSION['batch'];

try {
    // Call stored procedure
    $stmt = $conn->prepare("CALL GetCourseListForBatch(?)");
    $stmt->bind_param("s", $batch);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();

    // If no course offering
    if (!$row || (isset($row['Message']) && $row['Message'] === 'Courses Not Being Offered')) {
        echo json_encode([
            'success' => false,
            'message' => 'Courses Not Being Offered'
        ]);
        exit;
    }

    // Process course list
    $courseCodes = explode(" ", trim($row['CourseList']));
    $courses = [];

    $query = "SELECT CourseCode, CoursName AS CourseTitle, CreditHours, CourseFee 
              FROM Course 
              WHERE CourseCode = ?";
    $stmt = $conn->prepare($query);

    foreach ($courseCodes as $code) {
        $stmt->bind_param("s", $code);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($course = $res->fetch_assoc()) {
            $courses[] = $course;
        }
    }
    $stmt->close();

    echo json_encode([
        'success' => true,
        'data' => $courses
    ]);

} catch (Throwable $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
