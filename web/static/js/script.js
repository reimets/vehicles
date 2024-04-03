// document.addEventListener("DOMContentLoaded", function () {...}); see kuulaja ootab, kuni kogu HTML on täielikult laetud ja parseeritud, enne kui käivitab 
// funktsiooni sisu. See ei oota CSS-i, pilte või muid ressursse, vaid ainult dokumendi DOMi valmimist.
// leht laetakse sujuvalt sisse
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute("data-theme", savedTheme);
}); 
  
  
  // see koodi lõik hoolitseb lehekülje dark/light tekkimise ja püsimise eest
document.getElementById("themeToggle").addEventListener("click", function() {
      let currentTheme = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.body.setAttribute("data-theme", currentTheme);
      localStorage.setItem('theme', currentTheme); // Salvesta teema eelistus
  });
// ************************
// lõik selleks, et cars APIst võtta manufacturers andmeid
// fetch('http://localhost:3000/api/manufacturers')
//   .then(response => {
//     if (!response.ok) {
//       throw new Error('Network response was not ok ' + response.statusText);
//     }
//     return response.json();
//   })
//   .then(data => {
//     console.log(data); // Siin on sinu päritud andmed
//     // Siin võid jätkata andmete töötlemist ja nende näitamist veebilehel
//   })
//   .catch(error => console.error('There has been a problem with your fetch operation:', error));
// });




    // ///////////////////////////////
    // ///////////////////////////////
    // fetch('../api/manufacturers')
    // .then(response => response.json())
    // .then(data => {
    //     const filtersDiv = document.getElementById('filters');
    //     data.manufacturers.forEach(manufacturer => {
    //         const button = document.createElement('button');
    //         button.value = manufacturer.name;
    //         button.textContent = manufacturer.name;
    //         filtersDiv.appendChild(button);
    //     });
    // })
    // .catch(error => {
    //     console.error('Error fetching manufacturers:', error);
    // });


// document.addEventListener("DOMContentLoaded", function () {
//     const menuToggle = document.getElementById("menu-toggle");
//     const desktopMenu = document.querySelector(".desktop-menu");
  
//     menuToggle.addEventListener("click", () => {
//         if (desktopMenu.style.display === "none" || desktopMenu.style.display === "") {
//             desktopMenu.style.display = "block";
//         } else {
//             desktopMenu.style.display = "none";
//         }
//     });
//   // Hüpikakna avamine "Open To Work" ovaalile
//   const ovalOpenToWork = document.querySelector(".oval:nth-child(1)");
//   const openToWorkPopup = document.getElementById("open-to-work-popup");

//   // ovalOpenToWork.addEventListener("mouseenter", () => {
//   //     openToWorkPopup.style.display = "block";
//   // });
//     ovalOpenToWork.addEventListener("mouseenter", () => {
//       openToWorkPopup.classList.add("show");
//   });

//   // Hüpikakna sulgemine "Open To Work" ovaalil
//   const closeOpenToWorkPopup = document.getElementById("close-open-to-work-popup");

//   // closeOpenToWorkPopup.addEventListener("click", () => {
//   //     openToWorkPopup.style.display = "none";
//   // });
//     closeOpenToWorkPopup.addEventListener("click", () => {
//       openToWorkPopup.classList.remove("show");
//   });

//   // Hüpikakna avamine "Invite Me" ovaalile
//   const ovalInviteMe = document.querySelector(".oval:nth-child(2)");
//   const inviteMePopup = document.getElementById("invite-me-popup");

//   // ovalInviteMe.addEventListener("mouseenter", () => {
//   //     inviteMePopup.style.display = "block";
//   // });
//     ovalInviteMe.addEventListener("mouseenter", () => {
//       inviteMePopup.classList.add("show");
//   });

//   // Hüpikakna sulgemine "Invite Me" ovaalil
//   const closeInviteMePopup = document.getElementById("close-invite-me-popup");

//   // closeInviteMePopup.addEventListener("click", () => {
//   //     inviteMePopup.style.display = "none";
//   // });
//     closeInviteMePopup.addEventListener("click", () => {
//       inviteMePopup.classList.remove("show");
//   });
//   document.addEventListener("keydown", function (event) {
//     if (event.key === "Escape") {
//       // openToWorkPopup.style.display = "none"; // kadus j'rsku 'ra'
//       openToWorkPopup.classList.remove("show"); // l'heb sujuvalt 'ra

//       // inviteMePopup.style.display = "none";
//       inviteMePopup.classList.remove("show"); // l'heb sujuvalt 'ra
//     }
//   });
// });