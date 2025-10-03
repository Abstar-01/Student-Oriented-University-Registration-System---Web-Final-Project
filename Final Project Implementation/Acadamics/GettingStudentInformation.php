<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
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
    // Fetch student info
    $query = "
        SELECT 
            CONCAT(FirstName, ' ', MiddleName, ' ', LastName) AS FullName,
            StudentID,
            Batch,
            PhoneNumber,
            Program,
            AcademicYear
        FROM Student
        WHERE StudentID = ?
    ";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $studentid);
    $stmt->execute();
    $result = $stmt->get_result();
    $studentInfo = $result->fetch_assoc();
    $stmt->close();

    // Fetch CGPA using stored procedure
    $cgpa = null;
    $stmt2 = $conn->prepare("CALL CalculateGPA(?)");
    $stmt2->bind_param("s", $studentid);
    $stmt2->execute();
    $result2 = $stmt2->get_result();
    if ($result2) {
        $row = $result2->fetch_assoc();
        $cgpa = round($row['CGPA'], 2); // round to 2 decimal places
        
        // STORE GPA IN SESSION
        $_SESSION['gpa'] = $cgpa;
    }
    $stmt2->close();
    
    if ($studentInfo) {
        // Add CGPA to the student data array
        $studentInfo['GPA'] = $cgpa ?? "N/A";

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