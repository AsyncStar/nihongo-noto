import * as vocabData from "./vocabData.js"
console.log(vocabData)

function openModal(event) {
    const tile = event.target;
    const tileMeaning = tile.dataset.meaning;
    const tileReading = tile.dataset.reading;
    const tileNotes = [];
    tile.notes?.forEach(note => {
        tileNotes.push(tile.dataset[note]);
    })
    console.log(tileNotes)

    const modal = document.querySelector("#tile-modal");
    const modalHeader = document.querySelector(".modal-header");
    const modalMeaning = document.querySelector(".modal-meaning");
    const modalReading = document.querySelector(".modal-reading");
    const modalNotes = document.querySelector(".modal-notes");

    modalHeader.textContent = tile.textContent
    modalReading.innerHTML = `Reading: ${tileReading}`;
    modalMeaning.innerHTML = `Meaning: ${tileMeaning}`;
    modalNotes.innerHTML = `Notes: ${tileNotes}`;

    modal.showModal();

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            const rect = modal.getBoundingClientRect()

            const isOutside = (
                event.clientX < rect.left || event.clientX > rect.right ||
                event.clientY < rect.top || event.clientY > rect.bottom
            );

            if (isOutside) {
                modal.close()
            }
        }
    });
}

function createVocabTile(data, destination) {
    const main = data.main;
    const meaning = data.meaning;
    const reading = data.reading;
    const tile = document.createElement('span');

    tile.dataset.meaning = meaning;
    tile.dataset.reading = reading;

    data.notes?.forEach(note => {
        tile.dataset[note.id] = note;
    })

    tile.classList.add('tile');
    tile.innerHTML = main;
    destination.appendChild(tile);

    tile.addEventListener('click', (event) => {
        openModal(event);
    })

}

function renderTiles() {
    const tabSections = document.querySelectorAll(".tab-section");

    tabSections.forEach(section => {
        createVocabGroupTilesOnActive(section);
    })
}
renderTiles();
function createVocabGroupTilesOnActive(tabSection) {
    const activeTab = tabSection.querySelector(".tab.active");

        const path = activeTab.dataset.path.split(".");
        const dest = tabSection.querySelector(".destination");

        let data = vocabData;
        path.forEach(part => {
            data = data[part];
            console.log(data)
        })

            Object.entries(data).forEach(([id, noun]) => {
                createVocabTile(noun, dest);

            })


}

function switchActiveTab(event) {
    const clickedTab = event.target;
    console.log(clickedTab);
    const tabSection = clickedTab.closest(".tab-section");
    const destination = tabSection.querySelector(".destination");
    const tabsList = clickedTab.closest(".tabs");
    const allTabs = tabsList.querySelectorAll(".tab");

    allTabs.forEach(tab => {
        tab.classList.remove("active");
    })

    destination.innerHTML = "";
    clickedTab.classList.add('active');
    createVocabGroupTilesOnActive(tabSection);

}

const tabElements = document.querySelectorAll(".tab");
tabElements.forEach(tabElement => {
    tabElement.addEventListener("click", switchActiveTab);

})

