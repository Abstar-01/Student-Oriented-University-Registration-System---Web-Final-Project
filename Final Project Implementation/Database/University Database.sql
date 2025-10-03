CREATE DATABASE UniversityDatabse
USE UniversityDatabse

CREATE TABLE Student (
    StudentID VARCHAR(10) PRIMARY KEY,
    FirstName VARCHAR(40),
    MiddleName VARCHAR(40),
    LastName VARCHAR(40),
    DOB DATE,
    Gender VARCHAR(10),
    Batch VARCHAR(10),
    Program VARCHAR(20),
    PhoneNumber VARCHAR(15),
    AcademicYear INT,
    Email VARCHAR(40) UNIQUE
);

UPDATE Student
SET Email = 'abgirma03@gmail.com'
WHERE StudentID = 'AK8225';

select * from Student;

INSERT INTO Student(StudentID, FirstName, MiddleName, LastName, DOB, Gender, Batch, Program, PhoneNumber, AcademicYear, Email) VALUES 
('BZ1111','Tebarek', 'Awedenegest', 'Moges', '2000-04-16', 'Male', 'DRB2302A', 'Computer Science', '+251978490567', 3, 'abelbgworkmail@gmail.com'),
('AK8225','Abel', 'Belayneh', 'Girma', '2003-12-11', 'Male', 'DRB2302A', 'Computer Science', '+251978490566', 3, 'abgirma03@gmail.com');

CREATE TABLE Login(
	StudentID VARCHAR(10) UNIQUE,
    Username VARCHAR(20) PRIMARY KEY,
    Password VARCHAR(15),
    LogStatus VARCHAR(10) DEFAULT('LoggedOut'),
	FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
);

Select * From Login;

INSERT INTO Login(StudentID,Username,Password) VALUES
('BZ1111', 'YOU', '5544');

SELECT * FROM Course WHERE CourseCode = 'CS324';

CREATE TABLE Course(
	CourseCode VARCHAR(10) PRIMARY KEY,
    CoursName VARCHAR(100),
    CreditHours INT,
    CourseDescription TEXT,
    CourseFee FLOAT
);

CREATE TABLE Courseoffered(
	CourseList VARCHAR(50),
    Batch VARCHAR(10),
    ExpireyDate Date
);

INSERT INTO Courseoffered() Values
('','', NOW() + INTERVAL 5 MINUTE);


CREATE TABLE CourseTaken(
	StudentID VARCHAR(10),
    CourseCode VARCHAR(10),
    Grade FLOAT,
    FOREIGN KEY (CourseCode) REFERENCES Course(CourseCode),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
);

INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('AK8225', 'CS211', 20.0),  -- 4.0 × 5
('AK8225', 'CS221', 17.5),  -- 3.5 × 5
('AK8225', 'CS222', 20.0),  -- 4.0 × 5
('AK8225', 'CS224', 17.5),  -- 3.5 × 5
('AK8225', 'CS223', 15.0),  -- 3.0 × 5
('AK8225', 'CS262', 10.5),  -- 3.5 × 3
('AK8225', 'CS301', 16.0),  -- 4.0 × 4
('AK8225', 'CS321', 20.0),  -- 4.0 × 5
('AK8225', 'CS341', 20.0),  -- 4.0 × 5
('AK8225', 'CS342', 17.5),  -- 3.5 × 5
('AK8225', 'CS343', 20.0);  -- 4.0 × 5



CREATE TABLE Feedback (
    FeedbackID INT PRIMARY KEY AUTO_INCREMENT,
    StudentID VARCHAR(10),
    TextDescription TEXT,
    DateAndTime DATETIME,
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
);

CREATE TABLE Registration(
	RegistrationID INT PRIMARY KEY,
    StudentID VARCHAR(10),
    CourseCode VARCHAR(10),
    RegistrationDate DATE,
    TransactionNumber FLOAT,
    TotalAmountOfCourse INT,
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID),
    FOREIGN KEY (CourseCode) REFERENCES Course(CourseCode)
);

CREATE TABLE OTP(
	OTPCode VARCHAR(4) PRIMARY KEY,
    EDT DATE,
    status VARCHAR(15)
);

select * from OTP;


/*
	 ///////////////////////////////////////
	///////////Stored Procedures///////////
   ///////////////////////////////////////
*/

DELIMITER $$
CREATE PROCEDURE VerifyEmail(
    IN inputtedEmail VARCHAR(40)
)
BEGIN
    IF EXISTS (SELECT 1 FROM Student WHERE Email = inputtedEmail) THEN
        SELECT 'success' AS status;
    ELSE
        SELECT 'failure' AS status;
    END IF;
END $$
DELIMITER;

-- Generating the OTP Code
DELIMITER $$
CREATE PROCEDURE Generate_OTP()
BEGIN
    DECLARE OTP_Code VARCHAR(4);
    DECLARE exists_count INT DEFAULT 1;

    WHILE exists_count > 0 DO
        SET OTP_Code = LPAD(FLOOR(RAND() * 10000), 4, '0');
        SELECT COUNT(*) INTO exists_count FROM OTP WHERE OTPCode = OTP_Code;
    END WHILE;

    INSERT INTO OTP (OTPCode, EDT, status)
    VALUES (OTP_Code, NOW() + INTERVAL 1 MINUTE, 'Not Expired');
    SELECT OTP_Code AS OTP;
END $$
DELIMITER ;


 -- Automatic OTP Timer Expirey
	SET GLOBAL event_scheduler = ON;
	SHOW VARIABLES LIKE 'event_scheduler';
	CREATE EVENT IF NOT EXISTS expire_otp_event
	ON SCHEDULE EVERY 1 MINUTE
	DO
		UPDATE OTP
		SET status = 'Expired'
		WHERE EDT <= NOW()
		AND status <> 'Expired';


-- Verify OTP Code Stored Procedure
DELIMITER $$
CREATE PROCEDURE OTP_Verification(
	IN OTPcode varchar(4)
)
BEGIN
	IF EXISTS (SELECT 1 FROM OTP WHERE OTPCode = OTPcode  AND  status='Not Expired') THEN
		SELECT 'Verified' AS Message;
    ELSE
		SELECT 'Not Verified ' AS Message;
	END IF;
END $$
DELIMITER;

DROP PROCEDURE OTP_Verification
      
-- Login Status Procedure
DELIMITER $$
CREATE PROCEDURE LoginStats(
    IN User_Name VARCHAR(10),
    IN Pass VARCHAR(10)
)
BEGIN
    DECLARE Uname VARCHAR(10);
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET Uname = NULL;

    SELECT Username INTO Uname FROM Login
    WHERE UserName = User_Name AND password = Pass LIMIT 1;

    IF Uname IS NOT NULL THEN
		UPDATE Login SET LogStatus = "Loggedin" WHERE Username = User_Name;
        SELECT User_Name AS Username, 'loggedin' AS status;
    ELSE
        SELECT NULL AS Username, 'loggedout' AS status;
    END IF;
END $$
DELIMITER ;


CALL CalculateGPA('AK8225');

-- Calculating Comulatative GPA
DELIMITER $$
CREATE PROCEDURE CalculateGPA(
    IN Student_ID VARCHAR(10)
)
BEGIN
    DECLARE TotalCreditHours INT;
    DECLARE TotalGradePoints FLOAT;

    IF EXISTS(SELECT 1 FROM CourseTaken WHERE StudentID = Student_ID) THEN
		-- Calculate total credit hours for the student
		SELECT SUM(C.CreditHours) INTO TotalCreditHours
		FROM Course AS C
		JOIN CourseTaken AS CT ON C.CourseCode = CT.CourseCode
		WHERE CT.StudentID = Student_ID;

		-- Calculate total weighted grade points (Grade * CreditHour)
		SELECT SUM(CT.Grade) INTO TotalGradePoints
		FROM CourseTaken AS CT
		JOIN Course AS C ON CT.CourseCode = C.CourseCode
		WHERE CT.StudentID = Student_ID;

		-- Return cumulative GPA
		SELECT TotalGradePoints / TotalCreditHours AS CGPA;
    ELSE
		SELECT '0.00' AS CGPA;
	END IF;
END$$
DELIMITER ;


-- ------------------------------------------------
-- Course Being Offered Stored Procedure 
DELIMITER $$
CREATE PROCEDURE GetCourseListForBatch(
    IN Batch_ID VARCHAR(10)
)
BEGIN
    DECLARE courseList VARCHAR(500);

    SELECT CourseList 
    INTO courseList
    FROM CourseOffered
    WHERE Batch = Batch_ID
      AND ExpireyDate >= CURDATE()
    LIMIT 1;

    IF courseList IS NULL OR courseList = '' THEN
        SELECT 'Courses Not Being Offered' AS Message;
    ELSE
        SELECT courseList AS CourseList;
    END IF;
END$$
DELIMITER ;


