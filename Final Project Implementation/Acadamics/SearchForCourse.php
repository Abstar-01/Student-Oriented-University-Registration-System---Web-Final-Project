<?php
header('Content-Type: application/json');

// Include database connection
include '../DatabaseConnection.php';

// Check if connection is established
if (!$conn) {
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed',
        'data' => [],
        'count' => 0
    ]);
    exit();
}

try {
    // Get search value from POST request
    $searchValue = isset($_POST['searchValue']) ? $_POST['searchValue'] : '';

    // Call stored procedure
    $sql = "CALL SearchCourse(?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $searchValue);
    $stmt->execute();
    
    // Get result set
    $result = $stmt->get_result();
    
    // Fetch all rows
    $courses = [];
    while ($row = $result->fetch_assoc()) {
        $courses[] = $row;
    }
    
    // Close result and statement
    $result->close();
    $stmt->close();

    // Return results
    echo json_encode([
        'success' => true,
        'data' => $courses,
        'count' => count($courses),
        'message' => 'Found ' . count($courses) . ' course(s)'
    ]);

} catch(Exception $e) {
    error_log("Error in search_courses.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage(),
        'data' => [],
        'count' => 0
    ]);
}

// Close connection if needed (depends on your DatabaseConnection.php)
// $conn->close();
?>