<?php
session_start();
header('Content-Type: application/json');

include '../DatabaseConnection.php'; // Include your database connection

try {
    // Get the student ID from the session
    $studentID = isset($_SESSION['studentid']) ? $_SESSION['studentid'] : '';

    if (empty($studentID)) {
        echo json_encode(['success' => false, 'message' => 'Student ID not found in session']);
        exit;
    }

    // Check registration status
    $stmt = $conn->prepare("SELECT RegistrationStatus, RegistrationID FROM RegistrationStatus WHERE StudentID = ?");
    $stmt->execute([$studentID]);
    $statusResult = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$statusResult) {
        echo json_encode(['success' => true, 'registered' => false, 'message' => 'Not Registered']);
        exit;
    }

    $registrationStatus = $statusResult['RegistrationStatus'];
    $registrationID = $statusResult['RegistrationID'];

    if ($registrationStatus === 'Registered' && $registrationID > 0) {
        // Fetch registration and student details
        $stmt = $conn->prepare("
            SELECT r.*, s.FirstName, s.MiddleName, s.LastName, s.Program, s.Batch, s.PhoneNumber, s.AcademicYear
            FROM Registration r
            JOIN Student s ON r.StudentID = s.StudentID
            WHERE r.RegistrationID = ? AND r.StudentID = ?
        ");
        $stmt->execute([$registrationID, $studentID]);
        $registration = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($registration) {
            // Parse CSV courses and fetch complete course details
            $courseCodes = array_filter(explode(', ', trim($registration['Courses'], ', '))); // Split CSV and clean
            $coursesData = [];
            $totalAmount = 0;

            if (!empty($courseCodes)) {
                // Create placeholders for IN clause
                $placeholders = str_repeat('?,', count($courseCodes) - 1) . '?';
                
                // Fetch all course details at once
                $stmt = $conn->prepare("
                    SELECT CourseCode, CoursName, CourseFee 
                    FROM Course 
                    WHERE CourseCode IN ($placeholders)
                ");
                $stmt->execute($courseCodes);
                $courseResults = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Process course results
                foreach ($courseResults as $course) {
                    $courseFee = (float)($course['CourseFee'] ?? 0);
                    $coursesData[] = [
                        'CourseCode' => $course['CourseCode'],
                        'CourseName' => $course['CoursName'] ?? 'N/A',
                        'CourseFee' => number_format($courseFee, 2)
                    ];
                    $totalAmount += $courseFee;
                }

                // Handle courses in CSV that don't exist in Course table
                foreach ($courseCodes as $code) {
                    $found = false;
                    foreach ($courseResults as $course) {
                        if ($course['CourseCode'] === $code) {
                            $found = true;
                            break;
                        }
                    }
                    if (!$found) {
                        $coursesData[] = [
                            'CourseCode' => $code,
                            'CourseName' => 'Course Not Found',
                            'CourseFee' => '0.00'
                        ];
                    }
                }
            }

            $response = [
                'success' => true,
                'registered' => true,
                'data' => [
                    'FullName' => trim($registration['FirstName'] . ' ' . ($registration['MiddleName'] ? $registration['MiddleName'] . ' ' : '') . $registration['LastName']),
                    'StudentID' => $registration['StudentID'],
                    'Program' => $registration['Program'] ?? 'N/A',
                    'Batch' => $registration['Batch'] ?? 'N/A',
                    'PhoneNumber' => $registration['PhoneNumber'] ?? 'N/A',
                    'AcademicYear' => $registration['AcademicYear'] ?? 'N/A',
                    'RegistrationID' => $registration['RegistrationID'],
                    'TransactionID' => $registration['TransactionID'] ?? 'N/A',
                    'BankAccountNumber' => $registration['BankAccountNumber'] ?? 'N/A',
                    'BankName' => $registration['BankName'] ?? 'N/A',
                    'TransactionAmount' => number_format($registration['TransactionAmount'] ?? 0, 2),
                    'RegistrationDate' => $registration['RegistrationDate'] ?? 'N/A',
                    'Courses' => $coursesData, // Now contains complete course details
                    'TotalAmount' => number_format($totalAmount, 2)
                ]
            ];
            echo json_encode($response);
        } else {
            echo json_encode(['success' => false, 'message' => 'Registration details not found']);
        }
    } else {
        echo json_encode(['success' => true, 'registered' => false, 'message' => 'Not Registered']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
$conn = null;
?>