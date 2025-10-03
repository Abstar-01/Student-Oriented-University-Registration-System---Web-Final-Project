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

INSERT INTO Student(StudentID, FirstName, MiddleName, LastName, DOB, Gender, Batch, Program, PhoneNumber, AcademicYear, Email) VALUES
('TS9143','Tigist','Sisay','Abebe','2004-05-23','Female','DRB2402','Computer Science','+251911234567',2,'tigistsisay@gmail.com'),
('MK7732','Mikiyas','Kebede','Tadesse','2002-09-15','Male','DRBSE2302','Software Engineering','+251922334455',3,'mikiyaskt@gmail.com'),
('SH6351','Shewit','Hailu','Bekele','2003-01-07','Female','DRB2501','Computer Science','+251933445566',1,'shewithailu@gmail.com'),
('DA8471','Daniel','Alemu','Mengistu','2001-11-19','Male','DRBSE2202','Software Engineering','+251944556677',4,'danielalemu@gmail.com'),
('RN5024','Rahel','Negash','Worku','2004-03-29','Female','DRB2402','Computer Sciecne','+251955667788',2,'rahelnegash@gmail.com'),
('KB1189','Kalkidan','Birhanu','Tesfaye','2003-07-13','Female','DRB2302','Computer Science','+251966778899',3,'kalkidanbt@gmail.com'),
('YM7310','Yonas','Mulugeta','Gebre','2002-04-21','Male','DRBSE2201','Software Engineering','+251977889900',4,'yonasmulugeta@gmail.com'),
('SL2246','Selam','Lulseged','Haile','2003-10-05','Female','DRBSSE2401','Software Engineering','+251988990011',2,'selamlh@gmail.com'),
('HB9920','Henok','Bekele','Fikremariam','2001-06-30','Male','DRB2202','Computer Science','+251999001122',4,'henokbf@gmail.com');


UPDATE Student
SET Batch = 'DRB2302'
WHERE StudentId = 'BZ1111';


CREATE TABLE Login(
	StudentID VARCHAR(10) UNIQUE,
    Username VARCHAR(20) PRIMARY KEY,
    Password VARCHAR(15),
    LogStatus VARCHAR(10) DEFAULT('LoggedOut'),
	FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
);

Select * From Login;

INSERT INTO Login(StudentID, Username, Password) VALUES
('TS9143', 'tigista', 'Tigist#99'),
('MK7732', 'mikiyast', 'Miki7732!'),
('SH6351', 'shewitb', 'Shewit123'),
('DA8471', 'danielm', 'Dan_2025'),
('RN5024', 'rahelw', 'Rahel*88'),
('KB1189', 'kalkidant', 'Kalki1189'),
('YM7310', 'yonasg', 'Yonas7310!'),
('SL2246', 'selamh', 'Selam22@'),
('HB9920', 'henokf', 'Henok_99');


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

INSERT INTO CourseOffered(Batch, CourseList) Values
('DRB2302','CS323 CS302 CC112 CC313');

UPDATE CourseOffered
SET CourseList = 'CS323,CS302,CC112,CC313'
WHERE Batch = 'DRB2302';

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

-- Abel Girma (AK8225) – 3rd Year, Computer Science
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('AK8225', 'CS211', 20.0),   -- 4.0 × 5
('AK8225', 'CS221', 15.0),   -- 3.0 × 5
('AK8225', 'CS222', 17.5),   -- 3.5 × 5
('AK8225', 'CS223', 16.0),   -- 3.2 × 5
('AK8225', 'CS224', 20.0),   -- 4.0 × 5
('AK8225', 'CS321', 15.0),   -- 3.0 × 5
('AK8225', 'CS341', 17.5),   -- 3.5 × 5
('AK8225', 'CS342', 16.0),   -- 3.2 × 5
('AK8225', 'CS343', 20.0);   -- 4.0 × 5


-- -----------------------------------------------------------------------------------------
-- Tigist Sisay (TS9143) – 2nd Year Computer Science (Below Average: CGPA 2.31)
-- 1st Year Courses
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('TS9143', 'CC150', 13.0),   -- 2.6 × 5
('TS9143', 'CC151', 11.5),   -- 2.3 × 5
('TS9143', 'CC130', 10.0),   -- 2.0 × 5
('TS9143', 'CC140', 9.0),    -- 1.8 × 5
('TS9143', 'CC112', 14.0),   -- 2.8 × 5
('TS9143', 'CC113', 12.0),   -- 2.4 × 5
('TS9143', 'CC114', 13.5),   -- 2.7 × 5
('TS9143', 'CC121', 11.0);   -- 2.2 × 5

-- 2nd Year Courses (Current Year - Some in progress)
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('TS9143', 'CC214', 12.0),   -- 2.4 × 5
('TS9143', 'CC215', 13.5),   -- 2.7 × 5
('TS9143', 'CC216', 11.0),   -- 2.2 × 5
('TS9143', 'CC234', 14.5),   -- 2.9 × 5
('TS9143', 'CS211', 12.5),   -- 2.5 × 5
('TS9143', 'CS221', 15.0),   -- 3.0 × 5
('TS9143', 'CS222', 10.5),   -- 2.1 × 5
('TS9143', 'CS223', 13.0);   -- 2.6 × 5

-- Elective Courses
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('TS9143', 'CS213', 14.0);   -- 2.8 × 4

-- -------------------------------------------------------------------------------------

-- Kalkidan Birhanu (KB1189) – 3rd Year Computer Science (Average Performer: CGPA 2.82)
-- 1st Year Courses
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('KB1189', 'CC150', 15.0),   -- 3.0 × 5
('KB1189', 'CC151', 14.0),   -- 2.8 × 5
('KB1189', 'CC130', 12.5),   -- 2.5 × 5
('KB1189', 'CC140', 13.0),   -- 2.6 × 5
('KB1189', 'CC112', 16.0),   -- 3.2 × 5
('KB1189', 'CC113', 14.5),   -- 2.9 × 5
('KB1189', 'CC114', 15.5),   -- 3.1 × 5
('KB1189', 'CC121', 13.5);   -- 2.7 × 5

-- 2nd Year Courses
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('KB1189', 'CC214', 14.0),   -- 2.8 × 5
('KB1189', 'CC215', 15.5),   -- 3.1 × 5
('KB1189', 'CC216', 13.0),   -- 2.6 × 5
('KB1189', 'CC234', 16.5),   -- 3.3 × 5
('KB1189', 'CS211', 14.5),   -- 2.9 × 5
('KB1189', 'CS221', 17.0),   -- 3.4 × 5
('KB1189', 'CS222', 13.5),   -- 2.7 × 5
('KB1189', 'CS223', 15.0),   -- 3.0 × 5
('KB1189', 'CS262', 12.0);   -- 2.4 × 3

-- 3rd Year Courses (Current Year - Some in progress)
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('KB1189', 'CC313', 15.0),   -- 3.0 × 5
('KB1189', 'CC399', 16.0),   -- 3.2 × 5
('KB1189', 'CS224', 14.0),   -- 2.8 × 5
('KB1189', 'CS301', 12.5),   -- 2.5 × 5
('KB1189', 'CS302', 13.0),   -- 2.6 × 5
('KB1189', 'CS321', 15.5),   -- 3.1 × 5
('KB1189', 'CS322', 17.5),   -- 3.5 × 5
('KB1189', 'CS341', 14.5);   -- 2.9 × 5

-- Elective Courses
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('KB1189', 'CS213', 16.0),   -- 3.2 × 4
('KB1189', 'CS485', 17.0);   -- 3.4 × 4

-- ----------------------------------------------------------------------------

-- Henok Bekele (HB9920) – 4th Year Computer Science Student
-- 1st Year Courses (Freshman)
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('HB9920', 'CC150', 18.0),   -- 3.6 × 5
('HB9920', 'CC151', 17.5),   -- 3.5 × 5
('HB9920', 'CC130', 16.5),   -- 3.3 × 5
('HB9920', 'CC140', 15.0),   -- 3.0 × 5
('HB9920', 'CC112', 17.0),   -- 3.4 × 5
('HB9920', 'CC113', 16.0),   -- 3.2 × 5
('HB9920', 'CC114', 15.5),   -- 3.1 × 5
('HB9920', 'CC121', 14.5);   -- 2.9 × 5

-- 2nd Year Courses (Sophomore)
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('HB9920', 'CC214', 16.5),   -- 3.3 × 5
('HB9920', 'CC215', 17.0),   -- 3.4 × 5
('HB9920', 'CC216', 15.5),   -- 3.1 × 5
('HB9920', 'CC234', 18.0),   -- 3.6 × 5
('HB9920', 'CS211', 17.5),   -- 3.5 × 5
('HB9920', 'CS221', 18.5),   -- 3.7 × 5
('HB9920', 'CS222', 16.0),   -- 3.2 × 5
('HB9920', 'CS223', 19.0),   -- 3.8 × 5
('HB9920', 'CS262', 17.0);   -- 3.4 × 3

-- 3rd Year Courses (Junior)
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('HB9920', 'CC313', 16.5),   -- 3.3 × 5
('HB9920', 'CC399', 17.5),   -- 3.5 × 5
('HB9920', 'CS224', 18.0),   -- 3.6 × 5
('HB9920', 'CS301', 16.0),   -- 3.2 × 5
('HB9920', 'CS302', 15.5),   -- 3.1 × 5
('HB9920', 'CS321', 19.5),   -- 3.9 × 5
('HB9920', 'CS322', 18.5),   -- 3.7 × 5
('HB9920', 'CS341', 17.0),   -- 3.4 × 5
('HB9920', 'CS363', 16.5),   -- 3.3 × 5
('HB9920', 'CS465', 18.0);   -- 3.6 × 5

-- 4th Year Courses (Senior - Current Year)
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('HB9920', 'CS323', 17.5),   -- 3.5 × 5
('HB9920', 'CS342', 18.0),   -- 3.6 × 5
('HB9920', 'CS343', 16.5),   -- 3.3 × 5
('HB9920', 'CS415', 19.0),   -- 3.8 × 5
('HB9920', 'CS446', 17.0),   -- 3.4 × 5
('HB9920', 'CS466', 18.5),   -- 3.7 × 5
('HB9920', 'CS467', 16.0),   -- 3.2 × 5
('HB9920', 'CS468', 17.5),   -- 3.5 × 5
('HB9920', 'CS469', 20.0);   -- 4.0 × 7 (Excellent performance in capstone)

-- Elective Courses (Taken across 3rd and 4th years)
INSERT INTO CourseTaken (StudentID, CourseCode, Grade) VALUES
('HB9920', 'CS213', 17.0),   -- 3.4 × 4
('HB9920', 'CS362', 16.5),   -- 3.3 × 5
('HB9920', 'CS488', 18.5),   -- 3.7 × 4
('HB9920', 'CS495', 17.5),   -- 3.5 × 4
('HB9920', 'CS485', 19.0);   -- 3.8 × 4

-- -----------------------------------------------------------------------------



-- Data Insertion for couse offered
-- For Henok Bekele (HB9920) - 4th Year Computer Science
INSERT INTO CourseOffered(Batch, CourseList) VALUES
('DRB2202','CS469 CC399');

-- For Kalkidan Birhanu (KB1189) - 3rd Year Computer Science
INSERT INTO CourseOffered(Batch, CourseList) VALUES
('DRB2302','CS363 CS465 CS343 CS446');

-- For Tigist Sisay (TS9143) - 2nd Year Computer Science
INSERT INTO CourseOffered(Batch, CourseList) VALUES
('DRB2402','CS224 CS262 CC234 CC216 CC215');