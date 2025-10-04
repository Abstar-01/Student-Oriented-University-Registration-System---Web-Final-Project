// Get button elements
var RegisterationTab = document.getElementById("RegisterIcon");
var AddIcon = document.getElementById("AddIcon");
var DropIcon = document.getElementById("DropIcon");

// Get panel elements
var panel1 = document.getElementsByClassName("BaseDisplay")[0];
var panel2 = document.getElementsByClassName("RegisterationPanel")[0];
var panel3 = document.getElementsByClassName("AddPanel")[0];
var panel4 = document.getElementsByClassName("AccountInfo")[0];

// Function to hide all panels
function Clear() {
    panel1.style.display = "none";
    panel2.style.display = "none";
    panel3.style.display = "none";
    panel4.style.display = "none";
}

// Function to display the correct panel
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

// Attach click listeners
RegisterationTab.addEventListener("click", display);
AddIcon.addEventListener("click", display);
DropIcon.addEventListener("click", display);


// Course Registration Selector
/////////////////////////////////////////////////////////////////////
var MainSelector = document.getElementsByClassName("CB")[0];
var checkboxes = document.getElementsByClassName("CB");
var studentGPA = 0;
var maxCreditHours = 0;
var remainingCreditHours = 0; // ADDED: Track remaining credit hours

// Initialize GPA and credit hour limits
fetch('StudentGPA.php')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            studentGPA = parseFloat(data.gpa);
            setMaxCreditHours(studentGPA);
            console.log(`Student GPA: ${studentGPA}, Max Credit Hours: ${maxCreditHours}`);
            
            // ADDED: Initialize checkbox restrictions after GPA is loaded
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

// Function to set max credit hours based on GPA
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
    remainingCreditHours = maxCreditHours; // ADDED: Initialize remaining hours
}

// Function to calculate current total credit hours
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

// Function to get credit hours for a specific checkbox
function getCheckboxCreditHours(checkbox) {
    const row = checkbox.closest("tr");
    const creditHourCell = row.querySelector(".CreditHour");
    const hours = parseInt(creditHourCell.textContent.trim());
    return isNaN(hours) ? 0 : hours;
}

// Function to check if selection exceeds credit hour limit
function checkCreditHourLimit() {
    const currentHours = getCurrentCreditHours();
    
    if (currentHours > maxCreditHours) {
        alert(`Credit hour limit exceeded! You are allowed maximum ${maxCreditHours} credit hours. Currently selected: ${currentHours} hours.`);
        return false;
    }
    return true;
}

// NEW: Function to check if a NEW selection would exceed limit
function wouldExceedLimit(newHours) {
    const currentHours = getCurrentCreditHours();
    return (currentHours + newHours) > maxCreditHours;
}

// ADDED: Function to update remaining credit hours
function updateRemainingCreditHours() {
    const currentHours = getCurrentCreditHours();
    remainingCreditHours = maxCreditHours - currentHours;
    return remainingCreditHours;
}

// ADDED: Function to check if course can be selected based on remaining credits
function canSelectCourse(courseHours) {
    updateRemainingCreditHours();
    
    // If remaining credits are 2 or less, no courses can be selected
    if (remainingCreditHours <= 2) {
        return false;
    }
    
    // Check if this specific course can fit in remaining credits
    if (courseHours > remainingCreditHours) {
        return false;
    }
    
    return true;
}

// ADDED: New function to handle individual checkbox changes with restriction check
function handleCheckboxChange(event) {
    const checkbox = event.target;
    const courseHours = getCheckboxCreditHours(checkbox);
    
    // Only check restrictions when checking a box (not unchecking)
    if (checkbox.checked) {
        // First check if remaining credits allow any selection
        if (remainingCreditHours <= 2) {
            alert(`Cannot select any more courses! You only have ${remainingCreditHours} credit hours remaining, which is not enough for any course.`);
            checkbox.checked = false;
            event.preventDefault();
            return;
        }
        
        // Check if this specific course can be selected
        if (!canSelectCourse(courseHours)) {
            alert(`Cannot select this course! This course requires ${courseHours} credit hours, but you only have ${remainingCreditHours} credit hours remaining.`);
            checkbox.checked = false;
            event.preventDefault();
            return;
        }
        
        // Check if adding this course would exceed the overall limit
        if (wouldExceedLimit(courseHours)) {
            alert(`Cannot select this course! Adding ${courseHours} credit hours would exceed your maximum allowed ${maxCreditHours} credit hours.`);
            checkbox.checked = false;
            event.preventDefault();
            return;
        }
    }
    
    // Update remaining credit hours
    updateRemainingCreditHours();
    
    // Update the MainSelector state
    updateMainSelectorState();
    
    // Update total amount if function exists
    if (typeof updateTotal === 'function') {
        updateTotal();
    }
    
    // Update credit hour status
    updateCreditHourStatus();
}

// ADDED: Function to update main selector state
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
    
    // If we're SELECTING all courses (not deselecting)
    if (selectAll) {
        // First, calculate what the total credit hours would be if we select all
        let potentialTotalHours = 0;
        for (let i = 1; i < checkboxes.length; i++) {
            const hours = getCheckboxCreditHours(checkboxes[i]);
            potentialTotalHours += hours;
        }
        
        // Check if selecting all would exceed the limit
        if (potentialTotalHours > maxCreditHours) {
            alert(`Cannot select all courses! Total credit hours (${potentialTotalHours}) exceeds your maximum allowed (${maxCreditHours}) based on your GPA.`);
            MainSelector.checked = false;
            return;
        }
    }
    
    // If we passed the check (or we're deselecting), proceed with selection
    for (var i = 1; i < checkboxes.length; i++) {
        checkboxes[i].checked = selectAll;
    }
    
    // Update remaining credit hours
    updateRemainingCreditHours();
    
    // Update total amount after selection
    if (typeof updateTotal === 'function') {
        updateTotal();
    }
    
    // Update credit hour status
    updateCreditHourStatus();
}

// ADDED: New function to initialize checkbox restrictions
function initializeCheckboxRestrictions() {
    // Remove existing event listeners first to avoid duplicates
    for (var i = 1; i < checkboxes.length; i++) {
        checkboxes[i].removeEventListener('change', handleCheckboxChange);
    }
    
    // Add new event listeners for individual checkboxes
    for (var i = 1; i < checkboxes.length; i++) {
        checkboxes[i].addEventListener('change', handleCheckboxChange);
    }
    
    // Update initial status
    updateCreditHourStatus();
}

// Function to display current credit hour status
function displayCreditHourStatus() {
    const currentHours = getCurrentCreditHours();
    updateRemainingCreditHours();
    
    console.log(`Credit Hours: ${currentHours}/${maxCreditHours} (${remainingCreditHours} remaining)`);
    
    // You can also display this information on the page
    const statusElement = document.getElementById('creditHourStatus');
    if (statusElement) {
        statusElement.textContent = `Credit Hours: ${currentHours}/${maxCreditHours} (${remainingCreditHours} remaining)`;
        statusElement.style.color = currentHours > maxCreditHours ? 'red' : 'green';
    }
    
    // ADDED: Enhanced visual feedback for checkboxes
    for (let i = 1; i < checkboxes.length; i++) {
        const checkbox = checkboxes[i];
        const row = checkbox.closest("tr");
        const courseHours = getCheckboxCreditHours(checkbox);
        
        if (checkbox.checked) {
            // Selected courses are always enabled
            checkbox.disabled = false;
            row.style.opacity = "1";
        } else {
            // For unchecked courses, disable based on remaining credits
            if (remainingCreditHours <= 2) {
                // No courses can be selected if remaining <= 2
                checkbox.disabled = true;
                row.style.opacity = "0.4";
            } else if (courseHours > remainingCreditHours) {
                // Course requires more credits than available
                checkbox.disabled = true;
                row.style.opacity = "0.6";
            } else {
                // Course can be selected
                checkbox.disabled = false;
                row.style.opacity = "1";
            }
        }
    }
}

// Call this function whenever checkboxes change to update status
function updateCreditHourStatus() {
    displayCreditHourStatus();
}

// Add global event listener for dynamic updates
document.addEventListener('change', function(event) {
    if (event.target.classList.contains('CB')) {
        updateCreditHourStatus();
    }
});

// Initialize event listeners for main selector
MainSelector.onclick = ChooseAll;

// Initial status display (with delay to ensure GPA is loaded)
setTimeout(updateCreditHourStatus, 1500);


//////////////////////////////////////////////////////////////////////////////////
////          Course Registration Panel Information Retrival

document.addEventListener("DOMContentLoaded", () => {
    const registerIcon = document.getElementById("RegisterIcon");
    const registrationPanel = document.querySelector(".RegisterationPanel");
    const courseTable = document.querySelector(".CourseContent");

    // Duration of course registration in minutes
    const REGISTRATION_DURATION_MINUTES = 1;
    let registrationTimer; // Store timer reference

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
                    // Hide registration panel and alert user
                    registrationPanel.style.display = "none";
                    alert(data.message);
                    return;
                }

                // Show panel (in case it was hidden)
                registrationPanel.style.display = "block";

                // Clear existing course rows except header
                const existingRows = courseTable.querySelectorAll("tr:not(.Header)");
                existingRows.forEach(row => row.remove());

                // Insert rows for each course with fade-in effect
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
                    
                    // Staggered fade-in effect
                    setTimeout(() => {
                        row.style.opacity = "1";
                    }, index * 200);
                });

                // Start the registration timer
                startRegistrationTimer(REGISTRATION_DURATION_MINUTES);
            })
            .catch(err => {
                console.error('Error:', err);
                registrationPanel.style.display = "none";
                alert("Error loading courses: " + err.message);
            });
    });

    function startRegistrationTimer(minutes) {
        let remainingTime = minutes * 60; // Convert minutes to seconds

        // Clear any existing timer
        if (registrationTimer) clearInterval(registrationTimer);

        registrationTimer = setInterval(() => {
            remainingTime--;

            // Optional: Update a countdown display in the panel
            // You can add a countdown display element in your HTML
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

/////////////////////////////////////////////////////////////////////////////
//// Updating Total price input tag on payment page

document.addEventListener("DOMContentLoaded", function () {
  const totalAmountInput = document.getElementById("TotalAmount");

  function updateTotal() {
    let total = 0;
    
    // Get ALL checkboxes each time (including newly added ones)
    const checkboxes = document.querySelectorAll(".CourseContent .CB");

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const row = checkbox.closest("tr");
        const feeCell = row.querySelector(".CourseFee");
        const fee = parseFloat(feeCell.textContent.trim());
        if (!isNaN(fee)) {
          total += fee;
        }
      }
    });

    totalAmountInput.value = total > 0 ? total.toLocaleString() + '.00' : "------";
    totalAmountInput.style.color = '#555';
  }

  // Use event delegation to handle dynamically added checkboxes
  document.addEventListener("change", function (event) {
    if (event.target.classList.contains("CB")) {
      updateTotal();
    }
  });

  // Initial update in case any checkboxes are pre-checked
  updateTotal();
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

