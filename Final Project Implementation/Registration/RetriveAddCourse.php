<?php
session_start();
include '../DatabaseConnection.php';

header('Content-Type: application/json');

if (!isset($_SESSION['studentid'])) {
    echo json_encode(['success' => false, 'message' => 'Student not logged in']);
    exit;
}

$studentID = $_SESSION['studentid'];

try {
    // Call the updated stored procedure
    $stmt = $conn->prepare("CALL GetAvailableCoursesForStudent2(?)");
    $stmt->bind_param("s", $studentID);
    $stmt->execute();
    $result = $stmt->get_result();

    $courses = [];
    while ($row = $result->fetch_assoc()) {
        $courses[] = [
            'CourseCode' => $row['CourseCode'],
            'CourseTitle' => $row['CoursName'], // Note: Your procedure returns 'CoursName' not 'CourseTitle'
            'CreditHours' => $row['CreditHours'],
            'CourseFee' => $row['CourseFee']
        ];
    }

    $stmt->close();
    
    // Free result sets if any
    while ($conn->more_results()) {
        $conn->next_result();
        if ($result = $conn->store_result()) {
            $result->free();
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $courses,
        'message' => 'Courses retrieved successfully'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving courses: ' . $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>