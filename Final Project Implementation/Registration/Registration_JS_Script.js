// copy the damn code man
let notifications = document.querySelector('.notifications');
// console.log(notifications);

// let successbtn = document.querySelector("#success");
// let failurebtn = document.querySelector("#failure");
// let infobtn = document.querySelector("#info");

// create functions that each display a success, error, or information notification
function successToast(message){
  let icon = "fa-solid fa-circle-check";
  let type = "success";
  let title = "Success";

  createToast(type, icon, title, message);
}
function failureToast(message){
  let icon = "fa-solid fa-circle-xmark";
  let type = "failure";
  let title = "Failure";

  createToast(type, icon, title, message);
}
function infoToast(message){
  let icon = "fa-solid fa-circle-info";
  let type = "info";
  let title = "Info";

  createToast(type, icon, title, message);
}

function createToast(type, icon, title, message){
  let toast = document.createElement('div');
  toast.innerHTML = `
    <div class="toast ${type}">
      <i class="${icon}"></i>
      <div class="content">
        <div class="title">${title}</div>
        <span>${message}</span>
      </div>
    </div>`;
    notifications.appendChild(toast);
    setTimeout(()=>{
      console.log(toast.firstChild.nextSibling.style.animation = "hide 0.2s ease-in 1 forwards");
      setTimeout(()=>{
        notifications.removeChild(toast)
      }, 400)
    },3000)
}

// successbtn.addEventListener('click', () => successToast("Hello my niggas"));
// failurebtn.addEventListener('click', () => failureToast("Hello my niggas"));
// infobtn.addEventListener('click', () => infoToast("Hello my niggas"))

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////




var RegisterationTab = document.getElementById("RegisterIcon");
var AddIcon = document.getElementById("AddIcon");
var DropIcon = document.getElementById("DropIcon");

var panel1 = document.getElementsByClassName("BaseDisplay")[0];
var panel2 = document.getElementsByClassName("RegisterationPanel")[0];
var panel3 = document.getElementsByClassName("AddPanel")[0];
var panel4 = document.getElementsByClassName("AccountInfo")[0];

function Clear() {
    panel1.style.display = "none";
    panel2.style.display = "none";
    panel3.style.display = "none";
    panel4.style.display = "none";
}

function display(event) {
    Clear();
    switch (event.currentTarget.id) {
        case "RegisterIcon":
            panel2.style.display = "block";
            break;
        case "AddIcon":
            panel3.style.display = "block";
            break;
        case "DropIcon":
            panel4.style.display = "block";//change
            break;
        default:
            panel1.style.display = "block";
    }
}

RegisterationTab.addEventListener("click", display);
AddIcon.addEventListener("click", display);
DropIcon.addEventListener("click", display);///change


// Course Registration Selector
/////////////////////////////////////////////////////////////////////
var MainSelector = document.getElementsByClassName("CB")[0];
var checkboxes = document.getElementsByClassName("CB");
var studentGPA = 0;
var maxCreditHours = 0;
var remainingCreditHours = 0;

fetch('StudentGPA.php')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            studentGPA = parseFloat(data.gpa);
            setMaxCreditHours(studentGPA);
            console.log(`Student GPA: ${studentGPA}, Max Credit Hours: ${maxCreditHours}`);

            initializeCheckboxRestrictions();
        } else {
            console.error('Failed to load GPA:', data.message);
            setMaxCreditHours(0);
        }
    })
    .catch(error => {
        console.error('Error fetching GPA:', error);
        setMaxCreditHours(0);
    });


function setMaxCreditHours(gpa) {
    if (gpa >= 3.5) {
        maxCreditHours = 21;
    } else if (gpa >= 3.0) {
        maxCreditHours = 18;
    } else if (gpa >= 2.5) {
        maxCreditHours = 15;
    } else if (gpa >= 2.0) {
        maxCreditHours = 12;
    } else {
        maxCreditHours = 10;
    }
    remainingCreditHours = maxCreditHours;
}

function getCurrentCreditHours() {
    let totalHours = 0;
    for (let i = 1; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            const row = checkboxes[i].closest("tr");
            const creditHourCell = row.querySelector(".CreditHour");
            const hours = parseInt(creditHourCell.textContent.trim());
            if (!isNaN(hours)) {
                totalHours += hours;
            }
        }
    }
    return totalHours;
}


function getCheckboxCreditHours(checkbox) {
    const row = checkbox.closest("tr");
    const creditHourCell = row.querySelector(".CreditHour");
    const hours = parseInt(creditHourCell.textContent.trim());
    return isNaN(hours) ? 0 : hours;
}

function checkCreditHourLimit() {
    const currentHours = getCurrentCreditHours();

    if (currentHours > maxCreditHours) {
        // infoToast(`Credit hour limit exceeded! You are allowed maximum ${maxCreditHours} credit hours. Currently selected: ${currentHours} hours.`);
        return false;
    }
    return true;
}

function wouldExceedLimit(newHours) {
    const currentHours = getCurrentCreditHours();
    return (currentHours + newHours) > maxCreditHours;
}

function updateRemainingCreditHours() {
    const currentHours = getCurrentCreditHours();
    remainingCreditHours = maxCreditHours - currentHours;
    return remainingCreditHours;
}

function canSelectCourse(courseHours) {
    updateRemainingCreditHours();

    if (remainingCreditHours <= 2) {
        return false;
    }

    if (courseHours > remainingCreditHours) {
        return false;
    }

    return true;
}

function handleCheckboxChange(event) {
    const checkbox = event.target;
    const courseHours = getCheckboxCreditHours(checkbox);

    if (checkbox.checked) {
        if (remainingCreditHours <= 2) {
            failureToast(`Cannot select any more courses! You only have ${remainingCreditHours} credit hours remaining, which is not enough for any course.`);
            checkbox.checked = false;
            event.preventDefault();
            return;
        }

        if (!canSelectCourse(courseHours)) {
            failureToast(`Cannot select this course! This course requires ${courseHours} credit hours, but you only have ${remainingCreditHours} credit hours remaining.`);
            checkbox.checked = false;
            event.preventDefault();
            return;
        }

        if (wouldExceedLimit(courseHours)) {
            failureToast(`Cannot select this course! Adding ${courseHours} credit hours would exceed your maximum allowed ${maxCreditHours} credit hours.`);
            checkbox.checked = false;
            event.preventDefault();
            return;
        }
    }


    updateRemainingCreditHours();
    updateMainSelectorState();
    if (typeof updateTotal === 'function') {
        updateTotal();
    }
    updateCreditHourStatus();
}

function updateMainSelectorState() {
    var allChecked = true;
    for (var i = 1; i < checkboxes.length; i++) {
        if (!checkboxes[i].checked) {
            allChecked = false;
            break;
        }
    }
    MainSelector.checked = allChecked;
}

function ChooseAll() {
    const selectAll = MainSelector.checked;

    if (selectAll) {
        let potentialTotalHours = 0;
        for (let i = 1; i < checkboxes.length; i++) {
            const hours = getCheckboxCreditHours(checkboxes[i]);
            potentialTotalHours += hours;
        }

        if (potentialTotalHours > maxCreditHours) {
            failureToast(`Cannot select all courses! Total credit hours (${potentialTotalHours}) exceeds your maximum allowed (${maxCreditHours}) based on your GPA.`);
            MainSelector.checked = false;
            return;
        }
    }

    for (var i = 1; i < checkboxes.length; i++) {
        checkboxes[i].checked = selectAll;
    }
    updateRemainingCreditHours();
    if (typeof updateTotal === 'function') {
        updateTotal();
    }
    updateCreditHourStatus();
}

function initializeCheckboxRestrictions() {
    for (var i = 1; i < checkboxes.length; i++) {
        checkboxes[i].removeEventListener('change', handleCheckboxChange);
    }
    for (var i = 1; i < checkboxes.length; i++) {
        checkboxes[i].addEventListener('change', handleCheckboxChange);
    }
    updateCreditHourStatus();
}

function displayCreditHourStatus() {
    const currentHours = getCurrentCreditHours();
    updateRemainingCreditHours();

    console.log(`Credit Hours: ${currentHours}/${maxCreditHours} (${remainingCreditHours} remaining)`);

    const statusElement = document.getElementById('creditHourStatus');
    if (statusElement) {
        statusElement.textContent = `Credit Hours: ${currentHours}/${maxCreditHours} (${remainingCreditHours} remaining)`;
        statusElement.style.color = currentHours > maxCreditHours ? 'red' : 'green';
    }

    for (let i = 1; i < checkboxes.length; i++) {
        const checkbox = checkboxes[i];
        const row = checkbox.closest("tr");
        const courseHours = getCheckboxCreditHours(checkbox);

        if (checkbox.checked) {
            checkbox.disabled = false;
            row.style.opacity = "1";
        } else {
            if (remainingCreditHours <= 2) {
                checkbox.disabled = true;
                row.style.opacity = "0.4";
            } else if (courseHours > remainingCreditHours) {
                checkbox.disabled = true;
                row.style.opacity = "0.6";
            } else {
                checkbox.disabled = false;
                row.style.opacity = "1";
            }
        }
    }
}

function updateCreditHourStatus() {
    displayCreditHourStatus();
}
document.addEventListener('change', function (event) {
    if (event.target.classList.contains('CB')) {
        updateCreditHourStatus();
    }
});

MainSelector.onclick = ChooseAll;
setTimeout(updateCreditHourStatus, 1500);

function loadStudentInformation() {
    fetch('RetriveStudentInformation.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const studentInfo = data.data;

                const studentInputs = document.querySelectorAll('.StudentInformation input[type="text"]');

                if (studentInputs.length >= 6) {
                    studentInputs[0].value = studentInfo.FullName || 'N/A';           // Full Name
                    studentInputs[1].value = studentInfo.StudentID || 'N/A';          // Student ID
                    studentInputs[2].value = studentInfo.Program || 'N/A';            // Program
                    studentInputs[3].value = studentInfo.Batch || 'N/A';              // Batch
                    studentInputs[4].value = studentInfo.PhoneNumber || 'N/A';        // Contact Information
                    studentInputs[5].value = studentInfo.AcademicYear || 'N/A';       // Year of Enrolment
                }

                console.log('Student information loaded successfully');
            } else {
                console.error('Failed to load student information:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching student information:', error);
        });
}

const originalDisplay = display;
function displayWithStudentInfo(event) {
    originalDisplay(event);
    if (event.currentTarget.id === "RegisterIcon") {
        loadStudentInformation();
    }
}

RegisterationTab.removeEventListener("click", display);
RegisterationTab.addEventListener("click", displayWithStudentInfo);


AddIcon.removeEventListener("click", display);
AddIcon.addEventListener("click", displayWithStudentInfo);
DropIcon.removeEventListener("click", display);
DropIcon.addEventListener("click", displayWithStudentInfo);

//////////////////////////////////////////////////////////////////////////////
//////         Registration Check

// Check registration status and decide which panel to show
function checkRegistrationStatus() {
    fetch('CheckRegistration.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                if (data.registered) {
                    // Student is registered, show the receipt
                    displayReceipt(data.data);
                    return true;
                } else {
                    // Student is not registered, show the registration form
                    panel2.style.display = "block";
                    loadStudentInformation(); // Call your existing function
                    loadRegistrationCourses(); // Call your existing function
                }
            } else {
                console.error('Error checking registration status:', data.message);
                failureToast('Error: ' + data.message);
                panel1.style.display = "block"; // Fallback to base display
            }
        })
        .catch(error => {
            console.error('Error fetching registration status:', error);
            failureToast('Error loading registration status. Please try again.');
            panel1.style.display = "block"; // Fallback to base display
        });
        return false;
}

// Display the registration receipt and populate it with data
function displayReceipt(data) {
    FinacialRecietPage.style.display = "block";
    FinacialRecietPage.style.opacity = "0";
    FinacialRecietPage.style.transition = "opacity 0.5s";
    setTimeout(() => {
        FinacialRecietPage.style.opacity = "1";
    }, 50);

    // Populate student information (same as before)
    const studentInputs = document.querySelectorAll('.StudentInformation input[type="text"]');
    if (studentInputs.length >= 6) {
        studentInputs[0].value = data.FullName || 'N/A';
        studentInputs[1].value = data.StudentID || 'N/A';
        studentInputs[2].value = data.Program || 'N/A';
        studentInputs[3].value = data.Batch || 'N/A';
        studentInputs[4].value = data.PhoneNumber || 'N/A';
        studentInputs[5].value = data.AcademicYear || 'N/A';
    }

    // Populate course information with complete details from CSV
    const courseTable = document.querySelector('.CoursesTaken table');
    // Clear existing content and add headers
    courseTable.innerHTML = `
        <tr>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Course Fee</th>
        </tr>
    `;

    if (data.Courses && data.Courses.length > 0) {
        data.Courses.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.CourseCode || 'N/A'}</td>
                <td>${course.CourseName || 'N/A'}</td>
                <td>${course.CourseFee || '0.00'}</td>
            `;
            courseTable.appendChild(row);
        });

        // Add total row
        const totalRow = document.createElement('tr');
        totalRow.style.fontWeight = 'bold';
        totalRow.style.backgroundColor = '#f0f0f0';
        totalRow.innerHTML = `
            <td colspan="2">Total Amount</td>
            <td>${data.TotalAmount}</td>
        `;
        courseTable.appendChild(totalRow);
    } else {
        // No courses message
        const noCoursesRow = document.createElement('tr');
        noCoursesRow.innerHTML = `
            <td colspan="3" style="text-align: center; padding: 20px; color: #666;">
                No courses registered
            </td>
        `;
        courseTable.appendChild(noCoursesRow);
    }

    // Populate transaction information (same as before)
    document.querySelector('.RRID').textContent = data.RegistrationID || 'N/A';
    document.querySelector('.TID').textContent = data.TransactionID || 'N/A';
    document.querySelector('.A_Number').textContent = data.BankAccountNumber || 'N/A';
    document.querySelector('.BankName').textContent = data.BankName || 'N/A';
    document.querySelector('.AmPayed').textContent = data.TransactionAmount || '0.00';
    document.querySelector('.DAP').textContent = data.RegistrationDate || 'N/A';

    // Call your existing function to update the registration header
    
}


//////////////////////////////////////////////////////////////////////////////////
////          Course Registration Panel Information Retrival

document.addEventListener("DOMContentLoaded", () => {
    const registerIcon = document.getElementById("RegisterIcon");
    const registrationPanel = document.querySelector(".RegisterationPanel");
    const courseTable = document.querySelector(".CourseContent");

    const REGISTRATION_DURATION_MINUTES = 5;
    let registrationTimer;

    registerIcon.addEventListener("click", () => {
        fetch("Registration.php")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (!data.success) {
                    registrationPanel.style.display = "none";
                    failureToast(data.message);
                    return;
                }
                registrationPanel.style.display = "block";
                const existingRows = courseTable.querySelectorAll("tr:not(.Header)");
                existingRows.forEach(row => row.remove());

                data.data.forEach((course, index) => {
                    const row = document.createElement("tr");
                    row.style.opacity = "0";
                    row.style.transition = "opacity 1s ease-in-out";

                    row.innerHTML = `
                        <td class="CheckBox"><input type="checkbox" class="CB"></td>
                        <td class="CourseID">${course.CourseCode || 'N/A'}</td>
                        <td class="CourseTitle">${course.CourseTitle || 'N/A'}</td>
                        <td class="CreditHour">${course.CreditHours || 'N/A'}</td>
                        <td class="CourseFee">${course.CourseFee || 'N/A'}</td>
                    `;

                    courseTable.appendChild(row);

                    setTimeout(() => {
                        row.style.opacity = "1";
                    }, index * 200);
                });

                startRegistrationTimer(REGISTRATION_DURATION_MINUTES);
            })
            .catch(err => {
                console.error('Error:', err);
                registrationPanel.style.display = "none";
                failureToast("Error loading courses: " + err.message);
            });
    });

    function startRegistrationTimer(minutes) {
        let remainingTime = minutes * 60;

        if (registrationTimer) clearInterval(registrationTimer);

        registrationTimer = setInterval(() => {
            remainingTime--;

            const countdownElement = document.getElementById("countdown");
            if (countdownElement) {
                const minutesLeft = Math.floor(remainingTime / 60);
                const secondsLeft = remainingTime % 60;
                countdownElement.textContent = `${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`;
            }

            if (remainingTime <= 0) {
                clearInterval(registrationTimer);
                registrationPanel.style.display = "none";
                registerIcon.style.pointerEvents = "none";
                failureToast("Course registration time has expired!");
            }
        }, 1000);
    }
});

///////////////////////////////////////////////////////////////////////

var CheckCircles = document.getElementsByClassName("Check");
var SelectionPage = document.getElementsByClassName("Selection")[0];
var PaymentPage = document.getElementsByClassName("Payment")[0];
var FinacialRecietPage = document.getElementsByClassName("FinaceReciet")[0];

// Course Selection Submittion
function SubmitSelection() {
    for (var i = 1; i < checkboxes.length; i++) {
        if (checkboxes[i].checked == true) {
            SelectionPage.style.transition = "opacity 0.5s";
            SelectionPage.style.opacity = "0";

            setTimeout(function () {
                SelectionPage.style.display = "none";
                PaymentPage.style.display = "block";

                PaymentPage.style.opacity = "0";
                PaymentPage.style.transition = "opacity 0.5s";
                setTimeout(function () {
                    PaymentPage.style.opacity = "1";
                }, 50);

            }, 500);
            CheckCircles[0].src = "../Icons/GoCheckmark.png";
            CheckCircles[1].src = "../Icons/WhiteFilledCircle.png";
            break;
        }
    }
}

var SubmitButton = document.getElementsByClassName("SubmitButton")[0];
SubmitButton.onclick = SubmitSelection;

//////////////////////////////////////////////////////////////
// Course Payment
var subPay = document.getElementsByClassName("SubmittingPayment")[0];
var sendBack = document.getElementsByClassName("SendingBack")[0];

function SendingBackwards() {
    PaymentPage.style.transition = "opacity 0.5s";
    PaymentPage.style.opacity = "0";

    setTimeout(function () {
        PaymentPage.style.display = "none";
        SelectionPage.style.display = "block";

        SelectionPage.style.opacity = "0";
        SelectionPage.style.transition = "opacity 0.5s";
        setTimeout(function () {
            SelectionPage.style.opacity = "1";
        }, 50);
    }, 500);
    CheckCircles[0].src = "../Icons/WhiteFilledCircle.png";
    CheckCircles[1].src = "../Icons/WhiteCircle.png";
}
sendBack.onclick = SendingBackwards;


///////////////////////////////////////////////////////////////////
// Holding Reciet Value

var fileInput = document.getElementsByClassName("PaymentInputInformation")[2];
var fileInputBackground = document.getElementsByClassName("fileInputBackground")[0];

fileInput.addEventListener("change", function () {
    if (fileInput.files.length > 0) {
        fileInputBackground.style.backgroundColor = "White";
    } else {
        fileInputBackground.style.backgroundColor = "transparent";
    }
});

///////////////////////////////////////////////////////////////////////////////////////
/////  Removing the Registration Paragraph and changing the Registration Receipt
var RegTitle = document.getElementsByClassName("RegTitleH1")[0];
var RegParagraph = document.getElementsByClassName("RegParagraph")[0];

function ChangingRegistrationHeader() {
    RegTitle.textContent = "Registration Receipt";
    RegParagraph.style.transition = "opacity 0.5s ease-in-out";
    RegParagraph.style.opacity = "0";
    setTimeout(function () {
        RegParagraph.style.display = "none";
    }, 500);
}

////////////////////////////////////////////////////////////////////////////////
//////    
document.addEventListener('DOMContentLoaded', () => {
    const pageOne = document.querySelector('.AccountInfoPageOne');
    const pageTwo = document.querySelector('.AccountInfoPageTwo');

    const nextButton = document.querySelector('.AccountInfoNextPage');
    const backButton = document.querySelector('.AccountInfoBackPage');

    pageOne.style.display = 'grid';
    pageTwo.style.display = 'none';

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            pageOne.style.display = 'none';
            pageTwo.style.display = 'grid';
        });
    }

    // Back button click
    if (backButton) {
        backButton.addEventListener('click', () => {
            pageTwo.style.display = 'none';
            pageOne.style.display = 'grid';
        });
    }
});

///////////////////////////////////////////////////////////////////
// Course Transaction Value adding
document.querySelector('.SubmitButton').addEventListener('click', function (e) {
    e.preventDefault();

    const selectedCourses = document.querySelectorAll('.Selection table tr:not(.Header)');
    const courseTable = document.querySelector('.CoursesTaken table');

    courseTable.innerHTML = '';
    selectedCourses.forEach(row => {
        const checkbox = row.querySelector('.CB');
        if (checkbox.checked) {
            const courseCode = row.querySelector('.CourseID').textContent.trim();
            const courseTitle = row.querySelector('.CourseTitle').textContent.trim();
            const courseFee = parseFloat(row.querySelector('.CourseFee').textContent.trim()) || 0;

            const newRow = document.createElement('tr');

            const codeCell = document.createElement('td');
            codeCell.textContent = courseCode;

            const titleCell = document.createElement('td');
            titleCell.textContent = courseTitle;

            const feeCell = document.createElement('td');
            feeCell.textContent = courseFee.toFixed(2);

            newRow.appendChild(codeCell);
            newRow.appendChild(titleCell);
            newRow.appendChild(feeCell);
            courseTable.appendChild(newRow);
        }
    });
});

///////////////////////////////////////////////////////////////////
/////     Transaction Information on Registration Reciet     //////
///////////////////////////////////////////////////////////////////

document.querySelector('.SubmittingPayment').addEventListener('click', function () {
    const accountNumber = document.getElementById('AccountNumber').value.trim();
    console.log(accountNumber);
    const bankName = document.getElementById('BankName').options[document.getElementById('BankName').selectedIndex].text.trim();
    console.log(bankName);
    const transactionID = document.getElementById('TransactionID').value.trim();
    console.log(transactionID);
    const TotalAmount = document.getElementById('TotalAmount').value.trim();
    console.log(TotalAmount);
    const dateOfPayment = new Date().toLocaleDateString();
    console.log(dateOfPayment);

    document.querySelector('.A_Number').textContent = accountNumber;
    document.querySelector('.BankName').textContent = bankName;
    document.querySelector('.TID').textContent = transactionID;
    document.querySelector('.AmPayed').textContent = TotalAmount;
    document.querySelector('.DAP').textContent = dateOfPayment;

});

///////////////////////////////////////////////////////////////////
/////////              Input Validation check         /////////////
///////////////////////////////////////////////////////////////////

var InputValues = document.getElementsByClassName("PaymentInputInformation");
var RegistrationTitle = document.getElementsByClassName
function AllFilledIn() {
    for (let i = 0; i < InputValues.length - 1; i++) {
        const input = InputValues[i];

        if (input.type === "file") {
            if (input.files.length === 0) {
                infoToast("Please upload your receipt.");
                return false;
            }
        } else if (input.tagName === "SELECT") {
            if (input.selectedIndex === 0 || input.value.trim() === "") {
                infoToast("Please select a banking type.");
                return false;
            }
        } else if (input.value.trim() === "") {
            infoToast("Please fill out all required fields.");
            return false;
        }
    }
    PaymentPage.style.transition = "opacity 0.5s";
    PaymentPage.style.opacity = "0";

    setTimeout(function () {
        PaymentPage.style.display = "none";
        FinacialRecietPage.style.display = "block";

        FinacialRecietPage.style.opacity = "0";
        FinacialRecietPage.style.transition = "opacity 0.5s";
        setTimeout(function () {
            FinacialRecietPage.style.opacity = "1";
        }, 50);
    }, 500);

    CheckCircles[1].src = "../Icons/GoCheckmark.png";
    CheckCircles[2].src = "../Icons/GoCheckmark.png";
    ChangingRegistrationHeader();
    return true;
}


/////////////////////////////////////////////////////////////////////////////
////      Inserting the Registration Information Into Database Table    /////
/////////////////////////////////////////////////////////////////////////////

// Add event listener to the submit button
document.querySelector('.SubmittingPayment').addEventListener('click', function () {
    if (AllFilledIn()) {
        const registrationData = collectRegistrationData();
        console.log('Registration Data:', registrationData);
        sendRegistrationData(registrationData);
    }
});

function collectRegistrationData() {
    // Collect selected course codes
    const selectedCourses = [];
    const checkboxes = document.querySelectorAll('.CourseContent .CB');
    const courseCodeCells = document.querySelectorAll('.CourseContent .CourseID');

    let courseCount = 0;
    checkboxes.forEach((checkbox, index) => {
        if (checkbox.checked && courseCodeCells[index].textContent.trim() !== '') {
            selectedCourses.push(courseCodeCells[index].textContent.trim());
            courseCount++;
        }
    });

    // Limit courses to 40 characters as per VARCHAR(40)
    let courseCodesString = selectedCourses.join(', ');
    if (courseCodesString.length > 40) {
        courseCodesString = courseCodesString.substring(0, 40);
    }

    // Get current date and time in YYYY-MM-DD format for MySQL DATE
    const currentDate = new Date().toISOString().split('T')[0];

    // Get other form values with length validation
    const accountNumber = document.getElementById('AccountNumber').value.substring(0, 40); // VARCHAR(40)
    const transactionID = document.getElementById('TransactionID').value.substring(0, 15); // VARCHAR(15)
    const totalAmount = document.getElementById('TotalAmount').value;
    const bankName = document.getElementById('BankName').value.substring(0, 100); // VARCHAR(100)

    // Parse transaction amount properly - handle commas, decimals, etc.
    let transactionAmount = 0;
    if (totalAmount) {
        // Remove any commas, currency symbols, and extra spaces
        const cleanAmount = totalAmount.replace(/[$,]/g, '').trim();
        transactionAmount = parseFloat(cleanAmount);

        // If parseFloat returns NaN, set to 0
        if (isNaN(transactionAmount)) {
            transactionAmount = 0;
        }
    }

    // Store all data in a const variable
    const registrationData = {
        courseCodes: courseCodesString,
        registrationDate: currentDate,
        bankAccountNumber: accountNumber,
        transactionID: transactionID,
        transactionAmount: transactionAmount, // FLOAT - now properly parsed
        bankName: bankName,
        totalCourses: courseCount // INT
    };

    console.log('Parsed Transaction Amount:', transactionAmount);
    return registrationData;
}

function sendRegistrationData(registrationData) {
    const formData = new FormData();

    // Append all data to FormData with proper data types
    formData.append('courses', registrationData.courseCodes);
    formData.append('registrationDate', registrationData.registrationDate);
    formData.append('bankAccountNumber', registrationData.bankAccountNumber);
    formData.append('transactionID', registrationData.transactionID);
    formData.append('transactionAmount', registrationData.transactionAmount.toFixed(2)); // Send as string with 2 decimal places
    formData.append('bankName', registrationData.bankName);
    formData.append('totalAmountOfCourse', registrationData.totalCourses.toString());

    console.log('Sending Transaction Amount:', registrationData.transactionAmount.toFixed(2));

    // Send data to PHP
    fetch('PlacingRegistration.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                successToast('✅ ' + data.message);
            } else {
                failureToast('❌ ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            failureToast('❌ An error occurred while processing your registration.');
        });
}

// Function to get selected course codes
function getSelectedCourses() {
    const checkboxes = document.getElementsByClassName("CB");
    const selectedCourses = [];

    for (let i = 1; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            const row = checkboxes[i].closest("tr");
            const courseCode = row.querySelector(".CourseID").textContent.trim();
            selectedCourses.push(courseCode);
        }
    }
    return selectedCourses;
}

// Function to reset form
function resetRegistrationForm() {
    document.getElementById('PaymentInputForm').reset();
    document.getElementById('TotalAmount').value = '------';

    // Uncheck all course checkboxes
    const checkboxes = document.getElementsByClassName("CB");
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
    }
}

// Initialize
function initializeRegistrationSystem() {
    const submitButton = document.querySelector('.SubmittingPayment');
    if (submitButton) {
        submitButton.addEventListener('click', function (event) {
            event.preventDefault();
            submitRegistration();
        });
    }
}

document.addEventListener('DOMContentLoaded', initializeRegistrationSystem);


///////////////////////////////////////////////////////////////////////
////          Prerequisite Check for course selection              /////
///////////////////////////////////////////////////////////////////////

async function checkPrerequisites() {
    const selectedCourses = getSelectedCourses();

    if (selectedCourses.length === 0) {
        failureToast('Please select at least one course before submitting.');
        return false;
    }

    try {
        const formData = new FormData();
        formData.append('selected_courses', JSON.stringify(selectedCourses));

        const response = await fetch('AddRegistration.php', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status} error`);
        }

        const data = await response.json();

        if (data.success) {
            if (data.has_prerequisite_issues) {
                handlePrerequisiteIssues(data.results);
                return false;
            } else {
                return true;
            }
        } else {
            failureToast('Error checking prerequisites: ' + data.message);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        failureToast('Unable to check prerequisites. Please try again.');
        return false;
    }
}

function handlePrerequisiteIssues(prerequisiteResults) {
    let alertMessage = "Prerequisite Issues Found:\n\n";
    let coursesWithIssues = [];
    let hasIssues = false;

    for (const [courseCode, result] of Object.entries(prerequisiteResults)) {
        if (!result.can_take_course) {
            alertMessage += `• ${courseCode}: ${result.message}\n\n`;
            coursesWithIssues.push(courseCode);
            hasIssues = true;
        }
    }

    if (hasIssues) {
        alertMessage += "The courses with incomplete prerequisites have been dimmed and made inaccessible. Please review your selection.";
        failureToast(alertMessage);
        dimProblematicCourses(coursesWithIssues);
    }
}

function dimProblematicCourses(coursesWithIssues) {
    const checkboxes = document.getElementsByClassName("CB");

    for (let i = 1; i < checkboxes.length; i++) {
        const checkbox = checkboxes[i];
        const row = checkbox.closest("tr");
        const courseCodeCell = row.querySelector(".CourseID");
        const courseCode = courseCodeCell.textContent.trim();

        if (coursesWithIssues.includes(courseCode)) {
            row.style.opacity = "0.1";
            row.style.pointerEvents = "none";
            checkbox.disabled = true;
            checkbox.checked = false;
        }
    }

    // After disabling invalid courses, recalculate totals
    updateRemainingCreditHours?.();
    updateTotal(); // now accessible
    updateCreditHourStatus?.();
}

function getSelectedCourses() {
    const checkboxes = document.getElementsByClassName("CB");
    const selectedCourses = [];

    for (let i = 1; i < checkboxes.length; i++) {
        if (checkboxes[i].checked && !checkboxes[i].disabled) {
            const row = checkboxes[i].closest("tr");
            const courseCode = row.querySelector(".CourseID").textContent.trim();
            if (courseCode) {
                selectedCourses.push(courseCode);
            }
        }
    }
    return selectedCourses;
}

function resetCourseAppearance() {
    const checkboxes = document.getElementsByClassName("CB");

    for (let i = 1; i < checkboxes.length; i++) {
        const checkbox = checkboxes[i];
        const row = checkbox.closest("tr");
        row.style.opacity = "1";
        row.style.pointerEvents = "auto";
        checkbox.disabled = false;
    }
}

async function SubmitSelection(event) {
    if (event) {
        event.preventDefault();
    }

    const prerequisitesMet = await checkPrerequisites();
    if (!prerequisitesMet) return false;

    const checkboxes = document.getElementsByClassName("CB");
    let hasCheckedCourses = Array.from(checkboxes).some(cb => cb.checked && !cb.disabled);

    if (!hasCheckedCourses) {
        infoToast('Please select at least one course.');
        return false;
    }

    SelectionPage.style.transition = "opacity 0.5s";
    SelectionPage.style.opacity = "0";

    setTimeout(function () {
        SelectionPage.style.display = "none";
        PaymentPage.style.display = "block";
        PaymentPage.style.opacity = "0";
        PaymentPage.style.transition = "opacity 0.5s";
        setTimeout(() => PaymentPage.style.opacity = "1", 50);
    }, 500);

    CheckCircles[0].src = "../Icons/GoCheckmark.png";
    CheckCircles[1].src = "../Icons/WhiteFilledCircle.png";

    return true;
}

document.addEventListener("DOMContentLoaded", () => {
    const registerIcon = document.getElementById("RegisterIcon");
    if (registerIcon) registerIcon.addEventListener("click", () => setTimeout(resetCourseAppearance, 100));

    const SubmitButton = document.getElementsByClassName("SubmitButton")[0];
    if (SubmitButton) SubmitButton.addEventListener('click', SubmitSelection);

    // Initial total calculation
    updateTotal();
});

///////////////////////////////////////////////////////////////////////
////            Global function: Update Total Price               /////
///////////////////////////////////////////////////////////////////////

function updateTotal() {
    const totalAmountInput = document.getElementById("TotalAmount");
    if (!totalAmountInput) return;

    let total = 0;
    const checkboxes = document.querySelectorAll(".CourseContent .CB");

    checkboxes.forEach((checkbox) => {
        // Count only checked and enabled courses
        if (checkbox.checked && !checkbox.disabled) {
            const row = checkbox.closest("tr");
            const feeCell = row.querySelector(".CourseFee");
            const feeText = feeCell.textContent.trim();
            const fee = parseFloat(feeText);
            if (!isNaN(fee)) total += fee;
        }
    });

    if (total > 0) {
        totalAmountInput.value = total.toLocaleString() + '.00';
        totalAmountInput.style.color = '#555';
    } else {
        totalAmountInput.value = "------";
        totalAmountInput.style.color = '#555';
    }
}

// Watch for changes to recalculate total dynamically
document.addEventListener("change", function (event) {
    if (event.target.classList.contains("CB")) {
        updateTotal();
    }
});


//////////////////////////////////////////////////////////////////
//////            Add Course On the Add Panel             ////////
//////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
    const addIcon = document.getElementById("AddIcon");
    const addPanel = document.querySelector(".AddPanel");
    const addCourseTable = document.querySelector(".AddPanel .CourseContent");

    addIcon.addEventListener("click", () => {
        fetch("RetriveAddCourse.php")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (!data.success) {
                    addPanel.style.display = "none";
                    failureToast(data.message);
                    return;
                }

                // Show the add panel
                addPanel.style.display = "block";

                // Hide other panels
                document.querySelector(".RegisterationPanel").style.display = "none";
                document.querySelector(".AccountInfo").style.display = "none";
                document.querySelector(".BaseDisplay").style.display = "none";

                // Clear existing rows except header
                const existingRows = addCourseTable.querySelectorAll("tr:not(:first-child)");
                existingRows.forEach(row => row.remove());

                // Check if there are courses available
                if (data.data.length === 0) {
                    const noCoursesRow = document.createElement("tr");
                    noCoursesRow.innerHTML = `
                        <td colspan="5" style="text-align: center; padding: 20px; color: #666; font-style: italic;">
                            No courses available for add request at this time.
                        </td>
                    `;
                    addCourseTable.appendChild(noCoursesRow);
                    return;
                }

                // Add courses to the table with fade-in animation
                data.data.forEach((course, index) => {
                    const row = document.createElement("tr");
                    row.style.opacity = "0";
                    row.style.transition = "opacity 0.5s ease-in-out";

                    row.innerHTML = `
                        <td class="CheckBox">
                            <input type="checkbox" class="CB" 
                                   data-course-code="${course.CourseCode}" 
                                   data-course-fee="${course.CourseFee}">
                        </td>
                        <td class="CourseID">${course.CourseCode || 'N/A'}</td>
                        <td class="CourseTitle">${course.CourseTitle || 'N/A'}</td>
                        <td class="CreditHour">${course.CreditHours || 'N/A'}</td>
                        <td class="CourseFee">${course.CourseFee ? course.CourseFee : 'N/A'}</td>
                    `;

                    addCourseTable.appendChild(row);

                    // Animate row appearance
                    setTimeout(() => {
                        row.style.opacity = "1";
                    }, index * 150);
                });

                // Add submit button if not exists
                addSubmitButton();

                // Add event listener for checkboxes
                addCheckboxEventListeners();
            })
            .catch(err => {
                console.error('Error:', err);
                addPanel.style.display = "none";
                failureToast("Error loading available courses: " + err.message);
            });
    });

    function addSubmitButton() {
        // Remove existing submit button if any
        const existingButton = document.querySelector('.AddPanel .SubmitButton');
        if (existingButton) {
            existingButton.remove();
        }

        // Add new submit button
        const applySection = document.querySelector('.ApplySection');
        const submitButton = document.createElement('button');
        submitButton.type = 'button';
        submitButton.className = 'SubmitButton';
        submitButton.textContent = 'Submit Add Request';
        submitButton.addEventListener('click', handleAddRequestSubmit);

        // Apply styles correctly
        submitButton.style.background = 'linear-gradient(0deg, #3a3f48, #2a2e36)';
        submitButton.style.color = 'white';
        submitButton.style.marginTop = '7px';
        submitButton.style.padding = '8px 36px';
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '10px';
        submitButton.style.fontSize = '18px';
        submitButton.style.float = 'right';

        applySection.appendChild(submitButton);
    }


    function addCheckboxEventListeners() {
        const checkboxes = addCourseTable.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedCourses);
        });
    }

    function updateSelectedCourses() {
        const selectedCourses = [];
        const checkboxes = addCourseTable.querySelectorAll('input[type="checkbox"]:checked');

        checkboxes.forEach(checkbox => {
            selectedCourses.push({
                courseCode: checkbox.getAttribute('data-course-code'),
                courseFee: checkbox.getAttribute('data-course-fee')
            });
        });

        console.log('Selected courses for add request:', selectedCourses);
    }

    function handleAddRequestSubmit() {
        const selectedCourses = [];
        const checkboxes = addCourseTable.querySelectorAll('input[type="checkbox"]:checked');

        if (checkboxes.length === 0) {
            failureToast('Please select at least one course to add.');
            return;
        }

        checkboxes.forEach(checkbox => {
            selectedCourses.push(checkbox.getAttribute('data-course-code'));
        });

        // Confirm with user
        const confirmation = confirm(`You are about to submit add requests for ${selectedCourses.length} course(s). Continue?`);

        if (confirmation) {
            submitAddRequest(selectedCourses);
        }
    }

    function submitAddRequest(selectedCourses) {
        // Create form data
        const formData = new FormData();
        formData.append('student_id', '<?php echo $_SESSION["studentid"]; ?>');
        formData.append('courses', JSON.stringify(selectedCourses));
        formData.append('action', 'add_course_request');

        // Submit the add request
        fetch('SubmitAddRequest.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    successToast('Add request submitted successfully!');
                    // Optionally refresh the course list or reset the form
                    addPanel.style.display = 'none';
                    document.querySelector(".BaseDisplay").style.display = 'block';
                } else {
                    failureToast('Error submitting add request: ' + data.message);
                }
            })
            .catch(err => {
                console.error('Submission error:', err);
                failureToast('Error submitting add request. Please try again.');
            });
    }

    // Optional: Add a back button functionality
    function addBackButton() {
        const backButton = document.createElement('button');
        backButton.type = 'button';
        backButton.className = 'BackButton';
        backButton.textContent = 'Back to Main';
        backButton.style.marginRight = '10px';
        backButton.addEventListener('click', () => {
            addPanel.style.display = 'none';
            document.querySelector(".BaseDisplay").style.display = 'block';
        });

        const applySection = document.querySelector('.ApplySection');
        applySection.appendChild(backButton);
    }
});