<?php
session_start();
include '../DatabaseConnection.php';

// Check if student is logged in
if (!isset($_SESSION['studentid'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Not logged in']);
    exit();
}

$studentid = $_SESSION['studentid'];

// Get course history
$response = [];
$coursesByYearSeason = [];
$years = [];

try {
    $stmt = $conn->prepare("CALL GetCourseHistory(?)");
    $stmt->bind_param("s", $studentid);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $courseData = [
            'courseCode' => $row['CourseCode'],
            'courseName' => $row['CoursName'],
            'creditHours' => (float)$row['CreditHours'],
            'points' => (float)$row['Grade'], // This is the Points value from Grade column
            'season' => $row['Season'],
            'year' => $row['Year']
        ];
        
        $year = $row['Year'];
        $season = $row['Season'];
        
        // Group by year and season
        if (!isset($coursesByYearSeason[$year])) {
            $coursesByYearSeason[$year] = [];
        }
        if (!isset($coursesByYearSeason[$year][$season])) {
            $coursesByYearSeason[$year][$season] = [];
        }
        
        $coursesByYearSeason[$year][$season][] = $courseData;
        
        // Collect unique years
        if (!in_array($year, $years)) {
            $years[] = $year;
        }
    }
    
    // Sort years in descending order
    rsort($years);
    
    $response = [
        'success' => true,
        'studentId' => $studentid,
        'coursesByYearSeason' => $coursesByYearSeason,
        'years' => $years
    ];
    
    $stmt->close();
} catch (Exception $e) {
    $response = [
        'success' => false,
        'error' => "Error fetching course history: " . $e->getMessage()
    ];
}

$conn->close();

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>