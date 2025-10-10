let notifications = document.querySelector('.notifications');
console.log(notifications);

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
// infobtn.addEventListener('click', () => infoToast("Hello my niggas"));



