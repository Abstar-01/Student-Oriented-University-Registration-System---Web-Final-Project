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
    // Call stored procedure GetCourseListByBatch
    $stmt = $conn->prepare("CALL GetCourseListByBatch(?)");
    $stmt->bind_param("s", $batch);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $courseCodes = [];
    
    // Fetch all course codes from the result set
    while ($row = $result->fetch_assoc()) {
        if (isset($row['course_name']) && !empty(trim($row['course_name']))) {
            $courseCodes[] = trim($row['course_name']);
        }
    }
    
    $stmt->close();
    
    // If no courses found
    if (empty($courseCodes)) {
        echo json_encode([
            'success' => false,
            'message' => 'Courses Not Being Offered'
        ]);
        exit;
    }

    // Get course details for each course code
    $courses = [];
    
    if (!empty($courseCodes)) {
        // Create placeholders for the IN clause
        $placeholders = str_repeat('?,', count($courseCodes) - 1) . '?';
        $query = "SELECT CourseCode, CoursName AS CourseTitle, CreditHours, CourseFee 
                  FROM Course 
                  WHERE CourseCode IN ($placeholders)";
        
        $stmt = $conn->prepare($query);
        
        // Bind parameters dynamically
        $types = str_repeat('s', count($courseCodes));
        $stmt->bind_param($types, ...$courseCodes);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($course = $result->fetch_assoc()) {
            $courses[] = $course;
        }
        $stmt->close();
    }

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