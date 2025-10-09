// navigation logic

let dashboardBtn = document.querySelector(".dashboardBtn");
let studentsBtn = document.querySelector(".studentsBtn");
let gradesBtn = document.querySelector(".gradesBtn");

let dashboard = document.querySelector("#dashboard");
let students = document.querySelector("#students");
let grades = document.querySelector("#grades");

dashboardBtn.addEventListener('click', ()=>{
  dashboardBtn.classList.remove("unselected");
  dashboardBtn.classList.add("selected");
  studentsBtn.classList.add("unselected");
  studentsBtn.classList.remove("selected");
  gradesBtn.classList.add("unselected");
  gradesBtn.classList.remove("selected");

  dashboard.classList.add("show");
  dashboard.classList.remove("none");
  students.classList.add("none");
  students.classList.remove("show");
  grades.classList.add("none");
  grades.classList.remove("show");

})
studentsBtn.addEventListener('click', ()=>{
  dashboardBtn.classList.add("unselected");
  dashboardBtn.classList.remove("selected");
  studentsBtn.classList.add("selected");
  studentsBtn.classList.remove("unselected");
  gradesBtn.classList.add("unselected");
  gradesBtn.classList.remove("selected");
  
  dashboard.classList.add("none");
  dashboard.classList.remove("show");
  students.classList.add("show");
  students.classList.remove("none");
  grades.classList.add("none");
  grades.classList.remove("show");
})
gradesBtn.addEventListener('click', ()=>{
  dashboardBtn.classList.add("unselected");
  dashboardBtn.classList.remove("selected");
  studentsBtn.classList.add("unselected");
  studentsBtn.classList.remove("selected");
  gradesBtn.classList.add("selected");
  gradesBtn.classList.remove("unselected");
  
  dashboard.classList.add("none");
  dashboard.classList.remove("show");
  students.classList.add("none");
  students.classList.remove("show");
  grades.classList.add("show");
  grades.classList.remove("none");
})


// Students Popup logic

let addStudentPopup = document.querySelector(".add");
let addStudent = document.querySelector(".addStudentBtn")
let removePopup = document.querySelector(".removePopup");

addStudentPopup.addEventListener('click', ()=>{
  document.querySelector(".popup-overlay").classList.add("active");
})

removePopup.addEventListener('click', () => {
  document.querySelector(".popup-overlay").classList.remove("active");
})

// object that will store the STUDENT form input
let obj = {};
addStudent.addEventListener('click', (e) => {
  e.preventDefault();
  obj["fullName"] = document.querySelector("#fullName").value;
  obj["dob"] = document.querySelector("#dob").value;
  obj["gender"] = document.querySelector("#gender").value;
  obj["batch"] = document.querySelector("#batch").value;
  obj["program"] = document.querySelector("#program").value;
  obj["phone"] = document.querySelector("#phone").value;
  obj["year"] = document.querySelector("#year").value;
  obj["email"] = document.querySelector("#email").value;
   document.querySelector(".popup-overlay").classList.remove("active");
   console.log(obj);
})

// search bar and search button logic(students)
let searchBtn = document.querySelector(".searchBtn");

searchBtn.addEventListener('click', (e) => {
  e.preventDefault()
  let searchWord = e.target.parentNode.previousElementSibling.firstElementChild.value;
  console.log(searchWord);
})

let studentForm = document.querySelector(".studentForm");

studentForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  let searchWord  = e.target.firstElementChild.firstElementChild.value;
  console.log(searchWord)
})


// Grades panel logic

// edit button logic(grades)
let editGrade = document.querySelector(".grade_editBtn");


editGrade.addEventListener('click', (e)=>{
  document.querySelector(".grade_popup-overlay").classList.add("active");
  let data = e.target.nextElementSibling;
  let fullName = data.firstElementChild;
  let id = fullName.nextElementSibling;
  let courseCode = id.nextElementSibling;
  let courseName = courseCode.nextElementSibling;
  let creditHours = courseName.nextElementSibling;
  let grade = creditHours.nextElementSibling;
  console.log(fullName, id, courseCode, courseName, creditHours, grade)
  let gradeFormData = {"fullName": fullName.textContent, "id": id.textContent, "courseCode": courseCode.textContent, "courseName": courseName.textContent, "creditHours": creditHours.textContent, "grade": grade.textContent};
  document.querySelector(".grade_modal #fullName").value = gradeFormData["fullName"];
  document.querySelector(".grade_modal #id").value = gradeFormData["id"];
  document.querySelector(".grade_modal #courseCode").value = gradeFormData["courseCode"];
  document.querySelector(".grade_modal #courseName").value = gradeFormData["courseName"];
  document.querySelector(".grade_modal #creditHours").value = gradeFormData["creditHours"];
  // TO BE IMPLEMENTED
  // document.querySelector(".grade_modal #grade").value = grade;
})

// remove grade popup logic
let removeGradePopup = document.querySelector(".gradeRemovePopup");
removeGradePopup.addEventListener('click', ()=>{
  document.querySelector(".grade_popup-overlay").classList.remove("active");
})

// grade search bar logic and search button logic
let gradeSearchBtn = document.querySelector(".gradeSearchBtn");
let gradeForm = document.querySelector(".gradeForm");

gradeForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  let searchWord  = e.target.firstElementChild.firstElementChild.value;
  console.log(searchWord)
})

gradeSearchBtn.addEventListener('click', (e) => {
  e.preventDefault()
  let searchWord = e.target.parentNode.previousElementSibling.firstElementChild.value;
  console.log(searchWord);
})



