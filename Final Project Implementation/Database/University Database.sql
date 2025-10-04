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
-- Update Shewit to 2nd year

INSERT INTO Student(StudentID, FirstName, MiddleName, LastName, DOB, Gender, Batch, Program, PhoneNumber, AcademicYear, Email) VALUES 
('BZ1111','Tebarek', 'Awedenegest', 'Moges', '2000-04-16', 'Male', 'DRB2302A', 'Computer Science', '+251978490567', 3, 'abelbgworkmail@gmail.com'),
('AK8225','Abel', 'Belayneh', 'Girma', '2003-12-11', 'Male', 'DRB2302A', 'Computer Science', '+251978490566', 3, 'abgirma03@gmail.com');

INSERT INTO Student(StudentID, FirstName, MiddleName, LastName, DOB, Gender, Batch, Program, PhoneNumber, AcademicYear, Email) VALUES
('TS9143','Tigist','Sisay','Abebe','2004-05-23','Female','DRB2402','Computer Science','+251911234567',2,'tigistsisay@gmail.com'),
('MK7732','Mikiyas','Kebede','Tadesse','2002-09-15','Male','DRBSE2302','Software Engineering','+251922334455',3,'mikiyaskt@gmail.com'),
('SH6351','Shewit','Hailu','Bekele','2003-01-07','Female','DRB2401','Computer Science','+251933445566',2,'shewithailu@gmail.com'),
('DA8471','Daniel','Alemu','Mengistu','2001-11-19','Male','DRBSE2202','Software Engineering','+251944556677',4,'danielalemu@gmail.com'),
('RN5024','Rahel','Negash','Worku','2004-03-29','Female','DRB2402','Computer Sciecne','+251955667788',2,'rahelnegash@gmail.com'),
('KB1189','Kalkidan','Birhanu','Tesfaye','2003-07-13','Female','DRB2302','Computer Science','+251966778899',3,'kalkidanbt@gmail.com'),
('YM7310','Yonas','Mulugeta','Gebre','2002-04-21','Male','DRBSE2201','Software Engineering','+251977889900',4,'yonasmulugeta@gmail.com'),
('SL2246','Selam','Lulseged','Haile','2003-10-05','Female','DRBSE2401','Software Engineering','+251988990011',2,'selamlh@gmail.com'),
('HB9920','Henok','Bekele','Fikremariam','2001-06-30','Male','DRB2202','Computer Science','+251999001122',4,'henokbf@gmail.com');

CREATE TABLE Login(
	StudentID VARCHAR(10) UNIQUE,
    Username VARCHAR(20) PRIMARY KEY,
    Password VARCHAR(15),
    LogStatus VARCHAR(10) DEFAULT('LoggedOut'),
	FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
);

Select * From Login;

SELECT * FROM Course;

CREATE TABLE Course(
	CourseCode VARCHAR(10) PRIMARY KEY,
    CoursName VARCHAR(100),
    CreditHours INT,
    CourseDescription TEXT,
    CourseFee FLOAT
);

CREATE TABLE CourseOffered(
    Batch VARCHAR(10) PRIMARY KEY,
    CourseList VARCHAR(255)
);

Select * From CourseOffered;

CREATE TABLE CourseTaken(
	StudentID VARCHAR(10),
    CourseCode VARCHAR(10),
    Grade FLOAT,
    FOREIGN KEY (CourseCode) REFERENCES Course(CourseCode),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
);


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

Call GetCourseListByBatch('DRB2302');

-- ------------------------------------------------
-- Course Being Offered Stored Procedure 
DELIMITER $$
CREATE PROCEDURE GetCourseListByBatch(
IN batchId VARCHAR(10)
)
BEGIN
    DECLARE course_list TEXT;

    SELECT CourseList INTO course_list
    FROM CourseOffered
    WHERE Batch = batchId;

    -- Split the comma-separated list into rows
    SELECT TRIM(course) AS course_name
    FROM JSON_TABLE(
        CONCAT('["', REPLACE(course_list, ',', '","'), '"]'),
        "$[*]" COLUMNS (course VARCHAR(100) PATH "$")
    ) AS t;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS GetCourseListByBatch;







--   _______________________________	
--  |   Data Insertion Setion for   |
--   -------------------------------


SELECT * FROM CourseTaken;

-- Abel Girma (AK8225) – 3rd Year, Computer Science (GPA = 3.39)
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('AK8225', 'CS211', 20.0),   -- A (4.0) × 5 credits
('AK8225', 'CS221', 15.0),   -- B (3.0) × 5 credits
('AK8225', 'CS222', 17.5),   -- B+ (3.5) × 5 credits
('AK8225', 'CS223', 15.0),   -- B (3.0) × 5 credits
('AK8225', 'CS224', 20.0),   -- A (4.0) × 5 credits
('AK8225', 'CS321', 15.0),   -- B (3.0) × 5 credits
('AK8225', 'CS341', 17.5),   -- B+ (3.5) × 5 credits
('AK8225', 'CS342', 15.0),   -- B (3.0) × 5 credits
('AK8225', 'CS343', 20.0);   -- A (4.0) × 5 credits


-- ---------------------------------------------------------------------------------------
-- Shewit Hailu (SH6351) – 2nd Year Computer Science (Low Performer: CGPA 2.21)
-- 1st Year Courses (4 credit courses)
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('SH6351', 'CC150', 10.0),   -- C+ (2.5) × 4 credits
('SH6351', 'CC151', 8.0),    -- C (2.0) × 4 credits
('SH6351', 'CC130', 8.0),    -- C (2.0) × 4 credits
('SH6351', 'CC140', 8.0),    -- C (2.0) × 4 credits
('SH6351', 'CC112', 10.0),   -- C+ (2.5) × 4 credits
('SH6351', 'CC113', 8.0),    -- C (2.0) × 4 credits
('SH6351', 'CC114', 8.0),    -- C (2.0) × 4 credits
('SH6351', 'CC121', 8.0);    -- C (2.0) × 4 credits

-- 2nd Year Courses
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('SH6351', 'CC214', 8.0),    -- C (2.0) × 4 credits
('SH6351', 'CC215', 10.0),   -- C+ (2.5) × 4 credits
('SH6351', 'CC216', 8.0),    -- C (2.0) × 4 credits
('SH6351', 'CC234', 10.0),   -- C+ (2.5) × 4 credits
('SH6351', 'CS211', 10.0),   -- C+ (2.5) × 5 credits
('SH6351', 'CS221', 12.0),   -- B (3.0) × 5 credits
('SH6351', 'CS222', 10.0),   -- C+ (2.5) × 5 credits
('SH6351', 'CS223', 10.0);   -- C+ (2.5) × 5 credits

-- Elective Course
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('SH6351', 'CS213', 10.0);   -- C+ (2.5) × 4 credits

-- -----------------------------------------------------------------------------------------
-- Tigist Sisay (TS9143) – 2nd Year Computer Science (Below Average: CGPA 2.56)
-- 1st Year Courses (4 credit courses)
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('TS9143', 'CC150', 10.0),   -- C+ (2.5) × 4 credits
('TS9143', 'CC151', 10.0),   -- C+ (2.5) × 4 credits
('TS9143', 'CC130', 8.0),    -- C (2.0) × 4 credits
('TS9143', 'CC140', 8.0),    -- C (2.0) × 4 credits
('TS9143', 'CC112', 12.0),   -- B (3.0) × 4 credits
('TS9143', 'CC113', 10.0),   -- C+ (2.5) × 4 credits
('TS9143', 'CC114', 10.0),   -- C+ (2.5) × 4 credits
('TS9143', 'CC121', 10.0);   -- C+ (2.5) × 4 credits

-- 2nd Year Courses
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('TS9143', 'CC214', 10.0),   -- C+ (2.5) × 4 credits
('TS9143', 'CC215', 10.0),   -- C+ (2.5) × 4 credits
('TS9143', 'CC216', 10.0),   -- C+ (2.5) × 4 credits
('TS9143', 'CC234', 12.0),   -- B (3.0) × 4 credits
('TS9143', 'CS211', 12.5),   -- B (2.5) × 5 credits
('TS9143', 'CS221', 15.0),   -- B (3.0) × 5 credits
('TS9143', 'CS222', 12.5),   -- B (2.5) × 5 credits
('TS9143', 'CS223', 12.5);   -- B (2.5) × 5 credits

-- Elective Course
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('TS9143', 'CS213', 12.0);   -- B (3.0) × 4 credits

-- -------------------------------------------------------------------------------------

-- Kalkidan Birhanu (KB1189) – 3rd Year Computer Science (Average Performer: CGPA 2.97)
-- 1st Year Courses (4 credit courses)
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('KB1189', 'CC150', 12.0),   -- B (3.0) × 4 credits
('KB1189', 'CC151', 12.0),   -- B (3.0) × 4 credits
('KB1189', 'CC130', 10.0),   -- C+ (2.5) × 4 credits
('KB1189', 'CC140', 10.0),   -- C+ (2.5) × 4 credits
('KB1189', 'CC112', 14.0),   -- B+ (3.5) × 4 credits
('KB1189', 'CC113', 12.0),   -- B (3.0) × 4 credits
('KB1189', 'CC114', 12.0),   -- B (3.0) × 4 credits
('KB1189', 'CC121', 10.0);   -- C+ (2.5) × 4 credits

-- 2nd Year Courses
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('KB1189', 'CC214', 12.0),   -- B (3.0) × 4 credits
('KB1189', 'CC215', 12.0),   -- B (3.0) × 4 credits
('KB1189', 'CC216', 10.0),   -- C+ (2.5) × 4 credits
('KB1189', 'CC234', 14.0),   -- B+ (3.5) × 4 credits
('KB1189', 'CS211', 15.0),   -- B (3.0) × 5 credits
('KB1189', 'CS221', 17.5),   -- B+ (3.5) × 5 credits
('KB1189', 'CS222', 12.5),   -- B (2.5) × 5 credits
('KB1189', 'CS223', 15.0),   -- B (3.0) × 5 credits
('KB1189', 'CS262', 7.5);    -- C+ (2.5) × 3 credits

-- 3rd Year Courses
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('KB1189', 'CC313', 12.0),   -- B (3.0) × 4 credits
('KB1189', 'CC399', 14.0),   -- B+ (3.5) × 4 credits
('KB1189', 'CS224', 15.0),   -- B (3.0) × 5 credits
('KB1189', 'CS301', 12.5),   -- B (2.5) × 5 credits
('KB1189', 'CS302', 12.5),   -- B (2.5) × 5 credits
('KB1189', 'CS321', 17.5),   -- B+ (3.5) × 5 credits
('KB1189', 'CS322', 17.5),   -- B+ (3.5) × 5 credits
('KB1189', 'CS341', 15.0);   -- B (3.0) × 5 credits

-- Elective Courses
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('KB1189', 'CS213', 14.0),   -- B+ (3.5) × 4 credits
('KB1189', 'CS485', 14.0);   -- B+ (3.5) × 4 credits

-- ----------------------------------------------------------------------------

-- Henok Bekele (HB9920) – 4th Year Computer Science (High Performer: GPA = 3.79)
-- 1st Year Courses (4 credit courses)
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('HB9920', 'CC150', 16.0),   -- A (4.0) × 4 credits
('HB9920', 'CC151', 16.0),   -- A (4.0) × 4 credits
('HB9920', 'CC130', 14.0),   -- B+ (3.5) × 4 credits
('HB9920', 'CC140', 14.0),   -- B+ (3.5) × 4 credits
('HB9920', 'CC112', 16.0),   -- A (4.0) × 4 credits
('HB9920', 'CC113', 14.0),   -- B+ (3.5) × 4 credits
('HB9920', 'CC114', 14.0),   -- B+ (3.5) × 4 credits
('HB9920', 'CC121', 14.0);   -- B+ (3.5) × 4 credits

-- 2nd Year Courses
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('HB9920', 'CC214', 14.0),   -- B+ (3.5) × 4 credits
('HB9920', 'CC215', 14.0),   -- B+ (3.5) × 4 credits
('HB9920', 'CC216', 14.0),   -- B+ (3.5) × 4 credits
('HB9920', 'CC234', 16.0),   -- A (4.0) × 4 credits
('HB9920', 'CS211', 20.0),   -- A (4.0) × 5 credits
('HB9920', 'CS221', 20.0),   -- A (4.0) × 5 credits
('HB9920', 'CS222', 17.5),   -- B+ (3.5) × 5 credits
('HB9920', 'CS223', 20.0),   -- A (4.0) × 5 credits
('HB9920', 'CS262', 10.5);   -- B+ (3.5) × 3 credits

-- 3rd Year Courses
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('HB9920', 'CC313', 16.0),   -- A (4.0) × 4 credits
('HB9920', 'CC399', 16.0),   -- A (4.0) × 4 credits
('HB9920', 'CS224', 20.0),   -- A (4.0) × 5 credits
('HB9920', 'CS301', 17.5),   -- B+ (3.5) × 5 credits
('HB9920', 'CS302', 17.5),   -- B+ (3.5) × 5 credits
('HB9920', 'CS321', 20.0),   -- A (4.0) × 5 credits
('HB9920', 'CS322', 20.0),   -- A (4.0) × 5 credits
('HB9920', 'CS341', 20.0),   -- A (4.0) × 5 credits
('HB9920', 'CS363', 17.5),   -- B+ (3.5) × 5 credits
('HB9920', 'CS465', 20.0);   -- A (4.0) × 5 credits

-- 4th Year Courses
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('HB9920', 'CS323', 20.0),   -- A (4.0) × 5 credits
('HB9920', 'CS342', 20.0),   -- A (4.0) × 5 credits
('HB9920', 'CS343', 17.5),   -- B+ (3.5) × 5 credits
('HB9920', 'CS415', 20.0),   -- A (4.0) × 5 credits
('HB9920', 'CS446', 20.0),   -- A (4.0) × 5 credits
('HB9920', 'CS466', 20.0),   -- A (4.0) × 5 credits
('HB9920', 'CS467', 17.5),   -- B+ (3.5) × 5 credits
('HB9920', 'CS468', 20.0),   -- A (4.0) × 5 credits
('HB9920', 'CS469', 28.0);   -- A (4.0) × 7 credits

-- Elective Courses
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('HB9920', 'CS213', 16.0),   -- A (4.0) × 4 credits
('HB9920', 'CS362', 17.5),   -- B+ (3.5) × 5 credits
('HB9920', 'CS488', 16.0),   -- A (4.0) × 4 credits
('HB9920', 'CS495', 16.0),   -- A (4.0) × 4 credits
('HB9920', 'CS485', 16.0);   -- A (4.0) × 4 credits

-- -----------------------------------------------------------------------------



-- Data Insertion for course offered
-- For Henok Bekele (HB9920) - 4th Year Computer Science
INSERT INTO CourseOffered(Batch, CourseList) VALUES
('DRB2202','CS469,CC399');

-- For Kalkidan Birhanu (KB1189) - 3rd Year Computer Science  
INSERT INTO CourseOffered(Batch, CourseList) VALUES
('DRB2302','CS363,CS465,CS343,CS446');

-- For Tigist Sisay (TS9143) - 2nd Year Computer Science
INSERT INTO CourseOffered(Batch, CourseList) VALUES
('DRB2402','CS224,CS262,CC234,CC216');

-- For Shewit Hailu (SH6351) - 2nd Year Computer Science (Different batch)
INSERT INTO CourseOffered(Batch, CourseList) VALUES
('DRB2501','CS224,CS262,CC313,CC399');

-- For Rahel Negash (RN5024) - 2nd Year Computer Science
INSERT INTO CourseOffered(Batch, CourseList) VALUES
('DRB2401','CS224,CS262,CC234,CC216');

-- /// Software Engineers Course must first be added 
-- ///However substitue Computer Sciecne course have bee included

-- For Mikiyas Kebede (MK7732) - 3rd Year Software Engineering
INSERT INTO CourseOffered(Batch, CourseList) VALUES
('DRBSE2302','CS363,CS465,CS343,CS446');

-- For Daniel Alemu (DA8471) - 4th Year Software Engineering
INSERT INTO CourseOffered(Batch, CourseList) VALUES
('DRBSE2202','CS469,CC399,CS495,CS490');

-- For Yonas Mulugeta (YM7310) - 4th Year Software Engineering
INSERT INTO CourseOffered(Batch, CourseList) VALUES
('DRBSE2201','CS469 CC399 CS488 CS495');

-- For Selam Lulseged (SL2246) - 2nd Year Software Engineering
INSERT INTO CourseOffered(Batch, CourseList) VALUES
('DRBSE2401','CS224,CS262,CC234,CC313,CC215');

-- ----------------------------------------------------------------------------------------------
-- 
--   ____________________________________
--  |   Prerequisites Information Input  |
--   ------------------------------------


--    //////////////////////////////////////////
--   ///// Common Courses Prerequisites  //////
--  //////////////////////////////////////////

-- English sequence, Communication English II requires Communication English I
UPDATE Course SET Prerequisite = 'CC150' WHERE CourseCode = 'CC151';

-- Common course progression (typically taken after first year)
UPDATE Course SET Prerequisite = 'CC130' WHERE CourseCode = 'CC234'; -- Statistics requires Math

-- --------------------------------------------------------------------------------------------------------

--    ///////////////////////////////////////////
--   /////   Major Courses Prerequisites   /////
--  ///////////////////////////////////////////

-- Programming sequence
UPDATE Course SET Prerequisite = 'CS221' WHERE CourseCode = 'CS222';
UPDATE Course SET Prerequisite = 'CS222' WHERE CourseCode = 'CS223';
UPDATE Course SET Prerequisite = 'CS223' WHERE CourseCode = 'CS224';

-- Web development sequence
UPDATE Course SET Prerequisite = 'CS322' WHERE CourseCode = 'CS323';

-- Database sequence
UPDATE Course SET Prerequisite = 'CS341' WHERE CourseCode = 'CS342';

-- Core CS courses with programming prerequisites
UPDATE Course SET Prerequisite = 'CS222' WHERE CourseCode = 'CS321'; -- Data Structures requires Programming II
UPDATE Course SET Prerequisite = 'CS224' WHERE CourseCode = 'CS446'; -- OO Software Engineering requires OOP

-- Systems courses
UPDATE Course SET Prerequisite = 'CS262' WHERE CourseCode = 'CS362'; -- Unix Admin requires Intro to UNIX
UPDATE Course SET Prerequisite = 'CS301' WHERE CourseCode = 'CS302'; -- Computer Org requires Logic Design
UPDATE Course SET Prerequisite = 'CS302' WHERE CourseCode = 'CS363'; -- OS requires Computer Organization

-- Networking sequence
UPDATE Course SET Prerequisite = 'CS465' WHERE CourseCode = 'CS466';

-- Security course
UPDATE Course SET Prerequisite = 'CS465' WHERE CourseCode = 'CS468'; -- Security requires Networks

-- Capstone project
UPDATE Course SET Prerequisite = 'CS446' WHERE CourseCode = 'CS469'; -- Senior Project requires Software Engineering

-- ---------------------------------------------------------------------------------------------------------

--    //////////////////////////////////////////////
--   /////   Elective Courses Prerequisites   /////
--  //////////////////////////////////////////////

-- Advanced electives requiring programming foundation
UPDATE Course SET Prerequisite = 'CS224' WHERE CourseCode = 'CS485'; -- Mobile Apps requires OOP
UPDATE Course SET Prerequisite = 'CS321' WHERE CourseCode = 'CS488'; -- AI requires Data Structures
UPDATE Course SET Prerequisite = 'CS321' WHERE CourseCode = 'CS447'; -- Data Mining requires Data Structures
UPDATE Course SET Prerequisite = 'CS321' WHERE CourseCode = 'CS496'; -- Computer Vision requires Data Structures
UPDATE Course SET Prerequisite = 'CS341' WHERE CourseCode = 'CS490'; -- Enterprise Systems requires DBMS

-- Advanced systems electives
UPDATE Course SET Prerequisite = 'CS363' WHERE CourseCode = 'CS463'; -- Distributed Systems requires OS
UPDATE Course SET Prerequisite = 'CS363' WHERE CourseCode = 'CS484'; -- Parallel Processing requires OS

-- Compiler design (advanced course)
UPDATE Course SET Prerequisite = 'CS302' WHERE CourseCode = 'CS427'; -- Compiler Design requires Computer Org

-- Project management (typically later years)
UPDATE Course SET Prerequisite = 'CS343' WHERE CourseCode = 'CS495'; -- IT Project Management requires System Analysis

-- GIS sequence
UPDATE Course SET Prerequisite = 'CS497' WHERE CourseCode = 'CS498';

-- Research methods (typically for final year)
UPDATE Course SET Prerequisite = 'CC234' WHERE CourseCode = 'CS481'; -- Research Methods requires Statistics