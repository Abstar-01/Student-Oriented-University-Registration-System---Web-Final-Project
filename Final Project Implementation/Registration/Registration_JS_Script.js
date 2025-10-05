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
            panel4.style.display = "block";
            break;
        default:
            panel1.style.display = "block";
    }
}

RegisterationTab.addEventListener("click", display);
AddIcon.addEventListener("click", display);
DropIcon.addEventListener("click", display);


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
        alert(`Credit hour limit exceeded! You are allowed maximum ${maxCreditHours} credit hours. Currently selected: ${currentHours} hours.`);
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
            alert(`Cannot select any more courses! You only have ${remainingCreditHours} credit hours remaining, which is not enough for any course.`);
            checkbox.checked = false;
            event.preventDefault();
            return;
        }
        
        if (!canSelectCourse(courseHours)) {
            alert(`Cannot select this course! This course requires ${courseHours} credit hours, but you only have ${remainingCreditHours} credit hours remaining.`);
            checkbox.checked = false;
            event.preventDefault();
            return;
        }
        
        if (wouldExceedLimit(courseHours)) {
            alert(`Cannot select this course! Adding ${courseHours} credit hours would exceed your maximum allowed ${maxCreditHours} credit hours.`);
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
            alert(`Cannot select all courses! Total credit hours (${potentialTotalHours}) exceeds your maximum allowed (${maxCreditHours}) based on your GPA.`);
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
document.addEventListener('change', function(event) {
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
                    alert(data.message);
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
                alert("Error loading courses: " + err.message);
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
                alert("Course registration time has expired!");
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

///////////////////////////////////////////////////////////////////
////////       Input Validation check

var InputValues = document.getElementsByClassName("PaymentInputInformation");
var RegistrationTitle = document.getElementsByClassName
function AllFilledIn() {
  for (let i = 0; i < InputValues.length-1; i++) {
    const input = InputValues[i];

    if (input.type === "file") {
      if (input.files.length === 0) {
        alert("Please upload your receipt.");
        return;
      }
    }else if (input.tagName === "SELECT") {
      if (input.selectedIndex === 0 || input.value.trim() === "") {
        alert("Please select a banking type.");
        return;
      }
    }else if (input.value.trim() === "") {
      alert("Please fill out all required fields.");
      return;
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
}

subPay.onclick = AllFilledIn;

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

///////////////////////////////////////////////////////////
///// Transaction Information on Registration Reciet

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

  /////////////////////////////////////////////////////////////////////////////
 ////      Inserting the Registration Information Into Database Table    /////
/////////////////////////////////////////////////////////////////////////////

// Function to handle registration submission
function submitRegistration() {
    const transactionID = document.getElementById('TransactionID').value.trim();
    const bankName = document.getElementById('BankName').value;
    const totalAmount = document.getElementById('TotalAmount').value;
    const accountNumber = document.getElementById('AccountNumber').value.trim();
    
    const selectedCourses = getSelectedCourses();

    if (!transactionID) {
        alert('Please enter Transaction ID');
        return;
    }
    if (!bankName || bankName === ' ') {
        alert('Please select a bank');
        return;
    }
    if (!accountNumber) {
        alert('Please enter your bank account number');
        return;
    }
    if (selectedCourses.length === 0) {
        alert('Please select at least one course');
        return;
    }
    if (totalAmount === '------' || totalAmount === 'XXXX.XX') {
        alert('Invalid total amount');
        return;
    }

    const transactionAmount = parseFloat(totalAmount.replace(/[^\d.]/g, ''));
    if (isNaN(transactionAmount) || transactionAmount <= 0) {
        alert('Invalid transaction amount');
        return;
    }

    const formData = new URLSearchParams();
    formData.append('transaction_id', transactionID);
    formData.append('transaction_amount', transactionAmount);
    formData.append('bank_name', bankName);
    formData.append('bank_account_number', accountNumber);
    selectedCourses.forEach(course => formData.append('selected_courses[]', course));

    alert('🔄 Processing your registration...');

    fetch('PlacingRegistration.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`✅ Registration Successful!\n\nCourses Registered: ${data.courses_registered}\nTotal Courses: ${data.total_courses}`);
            resetRegistrationForm();
        } else {
            alert('❌ Registration Failed: ' + data.message);
        }
    })
    .catch(error => {
        alert('❌ Network Error: Please try again');
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
        submitButton.addEventListener('click', function(event) {
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
        alert('Please select at least one course before submitting.');
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
            alert('Error checking prerequisites: ' + data.message);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Unable to check prerequisites. Please try again.');
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
        alert(alertMessage);
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
        alert('Please select at least one course.');
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
