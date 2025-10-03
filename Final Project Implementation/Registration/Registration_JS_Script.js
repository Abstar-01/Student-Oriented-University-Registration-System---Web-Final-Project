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

// Initialize GPA and credit hour limits
fetch('StudentGPA.php')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            studentGPA = parseFloat(data.gpa);
            setMaxCreditHours(studentGPA);
            console.log(`Student GPA: ${studentGPA}, Max Credit Hours: ${maxCreditHours}`);
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

// Function to check if selection exceeds credit hour limit
function checkCreditHourLimit() {
    const currentHours = getCurrentCreditHours();
    
    if (currentHours > maxCreditHours) {
        alert(`Credit hour limit exceeded! You are allowed maximum ${maxCreditHours} credit hours. Currently selected: ${currentHours} hours.`);
        return false;
    }
    return true;
}

function ChooseAll() {
    const selectAll = MainSelector.checked;
    
    // If we're SELECTING all courses (not deselecting)
    if (selectAll) {
        // First, calculate what the total credit hours would be if we select all
        let potentialTotalHours = 0;
        for (let i = 1; i < checkboxes.length; i++) {
            const row = checkboxes[i].closest("tr");
            const creditHourCell = row.querySelector(".CreditHour");
            const hours = parseInt(creditHourCell.textContent.trim());
            if (!isNaN(hours)) {
                potentialTotalHours += hours;
            }
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
    
    // Update total amount after selection
    if (typeof updateTotal === 'function') {
        updateTotal();
    }
    
    // Update credit hour status
    updateCreditHourStatus();
}

function ChooseAllInactive() {
    // For individual checkboxes, check credit hour limit before allowing selection
    if (this.checked && !checkCreditHourLimit()) {
        this.checked = false;
        return;
    }
    
    // Update the MainSelector state based on individual checkboxes
    var allChecked = true;
    for (var i = 1; i < checkboxes.length; i++) {
        if (!checkboxes[i].checked) {
            allChecked = false;
            break;
        }
    }
    MainSelector.checked = allChecked;
    
    // Update total amount
    if (typeof updateTotal === 'function') {
        updateTotal();
    }
    
    // Update credit hour status
    updateCreditHourStatus();
}

// Initialize event listeners
MainSelector.onclick = ChooseAll;
for (var i = 1; i < checkboxes.length; i++) {
    checkboxes[i].onclick = ChooseAllInactive;
}

// Function to display current credit hour status
function displayCreditHourStatus() {
    const currentHours = getCurrentCreditHours();
    const remainingHours = maxCreditHours - currentHours;
    
    console.log(`Credit Hours: ${currentHours}/${maxCreditHours} (${remainingHours} remaining)`);
    
    // You can also display this information on the page
    const statusElement = document.getElementById('creditHourStatus');
    if (statusElement) {
        statusElement.textContent = `Credit Hours: ${currentHours}/${maxCreditHours}`;
        statusElement.style.color = currentHours > maxCreditHours ? 'red' : 'green';
    }
}

// Call this function whenever checkboxes change to update status
function updateCreditHourStatus() {
    displayCreditHourStatus();
}

// Add event listener for dynamic updates
document.addEventListener('change', function(event) {
    if (event.target.classList.contains('CB')) {
        updateCreditHourStatus();
    }
});

// Initial status display
setTimeout(updateCreditHourStatus, 1000);

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

///////////////////////////////////////////////////////////////////
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

