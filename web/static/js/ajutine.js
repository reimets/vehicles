    ///////////////////////////////
        // sellega lõiguga saab failist nimekirja webi, aga liiga palju vajab hetkel JS-i, et sellele keskenduda 
    fetch('/static/json/data-copy.json')
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
        const navElement = document.querySelector('nav');
      // Kõigepealt, puhasta olemasolev sisu, kui seda on
        navElement.innerHTML = '';
      // Loome uue nimekirja (ul) elemendi
        const list = document.createElement('ul');
        data.manufacturers.forEach(manufacturer => {
        // Iga tootja kohta loome uue listi (li) elemendi
            const listItem = document.createElement('li');
            listItem.textContent = manufacturer.name;
            // Lisame listi elemendi nimekirja
            list.appendChild(listItem);
        });
      // Lisame loodud nimekirja nav elemendile
        navElement.appendChild(list);
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
  });
    ///////////////////////////////

    // Hüpikakna avamine "Open To Work" ovaalile
    const ovalOpenToWork = document.querySelector(".oval:nth-child(1)");
    const openToWorkPopup = document.getElementById("open-to-work-popup");

    // ovalOpenToWork.addEventListener("mouseenter", () => {
    //     openToWorkPopup.style.display = "block";
    // });
    ovalOpenToWork.addEventListener("click", () => {
        openToWorkPopup.classList.add("show");
    });

    // Hüpikakna sulgemine "Open To Work" ovaalil
    const closeOpenToWorkPopup = document.getElementById("close-open-to-work-popup");

    // closeOpenToWorkPopup.addEventListener("click", () => {
    //     openToWorkPopup.style.display = "none";
    // });
    closeOpenToWorkPopup.addEventListener("click", () => {
        openToWorkPopup.classList.remove("show");
    });

    // Hüpikakna avamine "Invite Me" ovaalile
    const ovalInviteMe = document.querySelector(".oval:nth-child(2)");
    const inviteMePopup = document.getElementById("invite-me-popup");

    // ovalInviteMe.addEventListener("mouseenter", () => {
    //     inviteMePopup.style.display = "block";
    // });
    ovalInviteMe.addEventListener("click", () => {
        inviteMePopup.classList.add("show");
    });

    // Hüpikakna sulgemine "Invite Me" ovaalil
    const closeInviteMePopup = document.getElementById("close-invite-me-popup");

    // closeInviteMePopup.addEventListener("click", () => {
    //     inviteMePopup.style.display = "none";
    // });
    closeInviteMePopup.addEventListener("click", () => {
        inviteMePopup.classList.remove("show");
    });
    document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        // openToWorkPopup.style.display = "none"; // kadus j'rsku 'ra'
        openToWorkPopup.classList.remove("show"); // l'heb sujuvalt 'ra

        // inviteMePopup.style.display = "none";
        inviteMePopup.classList.remove("show"); // l'heb sujuvalt 'ra
    }
    });