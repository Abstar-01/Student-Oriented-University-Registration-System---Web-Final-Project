<?php
session_start();

// Turn off PHP output to browser except JSON
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
include '../DatabaseConnection.php';

// Clear any buffered output
while (ob_get_level()) ob_end_clean();

if (!isset($_SESSION['studentid'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Not logged in',
        'has_prerequisite_issues' => true
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method',
        'has_prerequisite_issues' => true
    ]);
    exit;
}

$studentid = $_SESSION['studentid'];
$selectedCourses = json_decode($_POST['selected_courses'] ?? '[]', true);

if (empty($selectedCourses)) {
    echo json_encode([
        'success' => false,
        'message' => 'No courses selected',
        'has_prerequisite_issues' => true
    ]);
    exit;
}

$results = [];
$hasPrerequisiteIssues = false;

try {
    foreach ($selectedCourses as $courseCode) {
        $courseCode = trim($courseCode);
        
        if ($courseCode === '') {
            continue;
        }

        $stmt = $conn->prepare("CALL CheckCoursePrerequisite(?, ?)");
        if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);

        $stmt->bind_param("ss", $studentid, $courseCode);
        if (!$stmt->execute()) throw new Exception("Execute failed: " . $stmt->error);

        // Consume result sets and get last SELECT output
        $data = null;
        do {
            if ($result = $stmt->get_result()) {
                $row = $result->fetch_assoc();
                if ($row) $data = $row; // last non-empty row
                $result->free();
            }
        } while ($stmt->more_results() && $stmt->next_result());
        $stmt->close();

        if ($data && isset($data['can_take_course'])) {
            $results[$courseCode] = [
                'can_take_course' => (bool)$data['can_take_course'],
                'message' => $data['message'] ?? 'No message',
                'prerequisite_course' => $data['prerequisite_course'] ?? null
            ];
            
            if (!$data['can_take_course']) {
                $hasPrerequisiteIssues = true;
            }
        } else {
            $results[$courseCode] = [
                'can_take_course' => false,
                'message' => 'Invalid response from database for this course',
                'prerequisite_course' => null
            ];
            $hasPrerequisiteIssues = true;
        }
    }

    echo json_encode([
        'success' => true,
        'has_prerequisite_issues' => $hasPrerequisiteIssues,
        'results' => $results
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage(),
        'has_prerequisite_issues' => true
    ]);
}
?>