import * as vocabData from "../data/vocabData.js"
import * as data from "../data/conjugationData.js"
console.log(vocabData)
let grammarData;


async function init() {

        const response = await fetch("./data/grammarData.json");
        grammarData = await response.json();

    renderTiles();
}

function restoreActiveTab() {
    const tabSections = document.querySelectorAll(".tab-section");

    tabSections.forEach(tabSection => {
        const savedPath = sessionStorage.getItem(
            `activeTab-${tabSection.dataset.section}`
        );

        if (!savedPath) return;

        const savedTab = tabSection.querySelector(
            `.tab[data-path="${savedPath}"]`
        );

        if (!savedTab) return;

        tabSection.querySelectorAll(".tab").forEach(tab => {
            tab.classList.remove("active");
        });

        savedTab.classList.add("active");

    });

}
function restoreActiveKanji() {
    const savedKanji = localStorage.getItem("activeKanji");
    if (!savedKanji) return;

    const kanjiTile = document.querySelector(
        `.kanji-dest .tile[data-kanji="${savedKanji}"]`
    );
    if (!kanjiTile) return;

    kanjiTile.classList.add("active");
    showKanjiInfo({
            target: kanjiTile
        }
    )
}


restoreActiveKanji();
function openVocabModal(event) {
    const tile = event.target;
    const tileMeaning = tile.dataset.meaning;
    const tileReading = tile.dataset.reading;
    const tileNotes = [];
    tile.notes?.forEach(note => {
        tileNotes.push(tile.dataset[note]);
    })
    console.log(tileNotes)

    const modal = document.querySelector("#tile-modal");
    const modalHeader = modal.querySelector(".modal-header");
    const modalMeaning = modal.querySelector(".modal-meaning");
    const modalReading = modal.querySelector(".modal-reading");
    const modalNotes = modal.querySelector(".modal-notes");

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

function openPatternModal(event) {
    const tile = event.target.closest(".tile")
    const data = tile.patternData;

    const title = tile.dataset.title;
    const meaning = tile.dataset.meaning;
    const lesson = tile.dataset.lesson;
    const format = tile.dataset.format;

    const modal = document.querySelector("#grammar-modal");
    const modalTitle = modal.querySelector(".modal-title");
    const modalMeaning = modal.querySelector(".modal-meaning");
    const modalFormat = modal.querySelector(".modal-format");
    const modalNotes = modal.querySelector(".modal-notes");
    const modalLesson = modal.querySelector(".modal-lesson");
    const modalFollows = modal.querySelector(".modal-follows");
    const followsInnerWrapper = modal.querySelector("#followsWrapper");
    const modalChains = modal.querySelector(".modal-chaining");
    const chainsInnerWrapper = modal.querySelector("#chainsWrapper");




    modalTitle.textContent = title;
    modalLesson.innerHTML = `L${lesson}`;
    modalFormat.innerHTML = `<span class="innerHeader">Format</span> <br>${format}`.replace(/&(.*?)&/g,
        '<span class="format-styling">$1</span>'
    );

    modalMeaning.innerHTML = `<span class="innerHeader">Meaning</span> <br>${meaning}`;

    modalNotes.innerHTML = "<span class=\"innerHeader\">Notes</span> <br>";
    data.notes?.forEach((note) => {
        const noteElement = document.createElement("div");
        noteElement.innerHTML = `${note}`.replace(/&(.*?)&/g,
            '<span class="format-styling">$1</span>');
        modalNotes.appendChild(noteElement);
    })

    followsInnerWrapper.innerHTML = "";
    data.follows?.forEach((el) => {
        const inputElement = document.createElement("div");
        inputElement.innerHTML = `${el}`.replace(/&(.*?)&/g,
        '<span class="format-styling">$1</span>');
        inputElement.classList.add("inline");
        followsInnerWrapper.appendChild(inputElement);
    })

    chainsInnerWrapper.innerHTML = "";
    data.chainsWith?.forEach((el) => {
        const chainElement = document.createElement("div");
        chainElement.innerHTML = `${el}`.replace(/&(.*?)&/g,
            '<span class="format-styling">$1</span>');
        chainsInnerWrapper.appendChild(chainElement);
    })

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
        openVocabModal(event);
    })

}

function createPatternTile(data, destination) {

    const tile = document.createElement('span');
    tile.innerText = data.main;

    tile.dataset.title = data.title;
    tile.dataset.meaning = data.meaning;
    tile.dataset.lesson = data.lesson;
    tile.dataset.format = data.format;
    tile.patternData = data;

    const text = tile.innerText;
    tile.innerHTML = text.replace(/\^(.*?)\^/g,
        '<span class="highlight">$1</span>'
    );


    tile.classList.add('tile');
    destination.appendChild(tile);

    tile.addEventListener('click', (event) => {
        openPatternModal(event);
    })


}

function createKanjiTile(kanji, data, destination) {
    const tile = document.createElement('span');
    tile.innerText = kanji;
    tile.dataset.meaning = data.meaning;
    tile.dataset.lesson = data.lesson;
    tile.dataset.kanji = kanji;
    tile.KanjiData = data;


    tile.classList.add('kanji-tile');
    destination.appendChild(tile);

    tile.addEventListener('click', (event) => {
        showKanjiInfo(event);
    })
}

function findVocabById(data, id) {
    for (const [key, value] of Object.entries(data)) {
        if (key === id) {
            return value;
        }
        if (typeof value === "object" && value !== null) {
            const result = findVocabById(value, id);
            if (result) {
                return result;
            }
        }
    }
    return null;
}


init();
restoreActiveTab();

function getDataFromPath(data, path) {
    const parts = path.split(".");
    for (const part of parts) {
        data = data[part];
    }
    return data
}
function createGroupTilesOnActive(tabSection) {
    const activeTab = tabSection.querySelector(".tab.active");
    const dest = tabSection.querySelector(".destination");

    const section = tabSection.parentElement.dataset.section;

            if (section === "vocab") {
                    let data = getDataFromPath(vocabData, activeTab.dataset.path);

                    Object.entries(data).forEach(([id, noun]) => {
                        createVocabTile(noun, dest);
                    })

            }
            if (section === "grammar") {
                let data = getDataFromPath(grammarData, activeTab.dataset.path);
                console.log('Data passed to entries:', data);
                Object.entries(data);
                Object.entries(data).forEach(([id, pattern]) => {
                    createPatternTile(pattern, dest);
                })

            }

         if (section === "kanji")
        {
            let data = getDataFromPath(vocabData, activeTab.dataset.path);
            Object.entries(data).forEach(([kanji, data]) => {
                createKanjiTile(kanji, data, dest);
            })
        }


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
    createGroupTilesOnActive(tabSection);

    sessionStorage.setItem(
        `activeTab-${tabSection.dataset.section}`,
        clickedTab.dataset.path
    );
}


function renderTiles() {
    const tabSections = document.querySelectorAll(".tab-section");

    tabSections.forEach(section => {
        createGroupTilesOnActive(section);
    })
}

const tabElements = document.querySelectorAll(".tab");
tabElements.forEach(tabElement => {
    tabElement.addEventListener("click", switchActiveTab);

})


function showKanjiInfo(event) {
    const tile = event.currentTarget;
    const destination = tile.parentElement.parentElement;
    const section = tile.closest(".kanji-section");



        if (!tile || !tile.parentElement || !tile.parentElement.parentElement) {
            return;
        }
        const allActiveKanji = destination.querySelectorAll(".active-kanji");
        allActiveKanji.forEach(activeKanji => {
            activeKanji.classList.remove("active-kanji");
        })
        tile.classList.add('active-kanji');

        const data = tile.KanjiData;
        const kanji = tile.innerText;
        /*save active kanji in session */
        localStorage.setItem("activeKanji", tile.dataset.kanji);


        const largeKanji = section.querySelector(".large-kanji");
        const readings = section.querySelector(".readings");
        const meaning = section.querySelector(".meaning");
        const vocabDest = section.querySelector(".kanji-dest");

        largeKanji.innerHTML = "";
        meaning.innerHTML = "";
        readings.innerHTML = "";
        vocabDest.innerHTML = "";


        largeKanji.innerText = kanji;
        meaning.innerText = data.meaning;
        data.readings.forEach((reading) => {
            const element = document.createElement("span");
            element.innerText = reading;
            readings.appendChild(element);
        })

        data.vocab.forEach(vocabId => {
            const vocabEntry = findVocabById(vocabData, vocabId);
            if (!vocabData) return;
            createVocabTile(vocabEntry, vocabDest);
        });





}


function cycler() {
    const cyclers = document.querySelectorAll('.cycler');


    cyclers.forEach((elem) => {
        const items = elem.querySelectorAll('.cycle');
        const totalOptions = items.length;
        let currentIndex = 0;

        items.forEach((opt, index) => {

            opt.addEventListener('click', () => {
                items[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % totalOptions;


                items[currentIndex].classList.add('active');

                if (elem.closest('#verb-conjugator')) {
                    verbConjugator(cycler);
                }
            })

        })
    })


}

cycler();

function segmentedControlKana() {
    const control = document.querySelectorAll('.segmented-control-kana');

    control.forEach((elem) => {

        elem.addEventListener('click', e => {
            const button = e.target.closest('.segment');
            if (!button) return;

            elem.querySelectorAll('.segment').forEach(seg => {
                seg.classList.remove('active');
            });

            button.classList.add('active');
            verbConjugator();

        });
    })

}

segmentedControlKana();

function getActiveValue(control) {
    const active = control.querySelector('.segment.active');
    console.log(active);
    return active ? active.dataset.value : null;
}

function getData(value) {
    return data[value];
}

function verbConjugator() {
    let vowelShift = data.vowels.iRow;
    let ending = data.endings.polite.present.affirmative;
    const verbConjugator = document.querySelector('#verb-conjugator');
    const voiceModality = verbConjugator.querySelector('#voice-modality');
    const form = verbConjugator.querySelector('#form');
    const polarity = verbConjugator.querySelector('#polarity');
    const tense = verbConjugator.querySelector('#tense');

    let activeVoiceModality = voiceModality.querySelector('.cycle.active').dataset.value;
    console.log(activeVoiceModality);
    let activeForm = form.querySelector('.cycle.active').dataset.value;
    console.log(activeForm);
    let activePolarity = polarity.querySelector('.cycle.active').dataset.value;
    console.log(activePolarity);
    let activeTense = tense.querySelector('.cycle.active').dataset.value;
    console.log(activeTense);

    // Handle the vowel shift first

    if (activeForm === "polite") {
        if (activeVoiceModality === "standard") {
            vowelShift = data.vowels.iRow;
        }
        if (activeVoiceModality === "potential") {
            vowelShift = data.vowels.eRow;
        }
    } else if (activeForm === "short") {
        if (activeVoiceModality === "standard") {
            vowelShift = data.vowels.dictionary;
            if (activePolarity === "negative") {
                vowelShift = data.vowels.aRow;
            }

            if (activePolarity === "affirmative" && activeTense === "past") {
                vowelShift = data.vowels.nTaDaRow;
            }
        }
        if (activeVoiceModality === "potential") {
            vowelShift = data.vowels.eRowDictionary;

            if (activePolarity === "negative" || activeTense === "past") {
                vowelShift = data.vowels.eRow;
            }

            if (activePolarity === "affirmative" && activeTense === "past") {
                vowelShift = data.vowels.eTaDaRow;
            }



        }
    } else if (activeForm === "te-form") {
        if (activeVoiceModality === "standard") {
            vowelShift = data.vowels.baseTe;
        }
        if (activeVoiceModality === "potential") {
            vowelShift = data.vowels.eRowTe;
        }
    }

    // Then the ending
    if (activeForm === "polite") {
        if (activeTense === "present") {
            if (activePolarity === "affirmative") {
                ending = data.endings.polite.present.affirmative
            } else {
                ending = data.endings.polite.present.negative;
            }
        } else {
            if (activePolarity === "affirmative") {
                ending = data.endings.polite.past.affirmative
            }
            else { ending = data.endings.polite.past.negative }
        }
    } else if (activeForm === "short") {
        if (activeTense === "present") {
            if (activePolarity === "affirmative") {
                ending = data.endings.short.present.affirmative
            } else {
                ending = data.endings.short.present.negative;
            }
        } else {
            if (activePolarity === "affirmative") {
                ending = data.endings.short.past.affirmative
            }
            else { ending = data.endings.short.past.negative }
        }
    } else {
        ending = data.endings.te.blank;
    }

    // Get kana

    const kanaControl = verbConjugator.querySelector('.segmented-control-kana');
    let activeKana = getActiveValue(kanaControl);
    console.log(activeKana);

    let newKana = vowelShift[activeKana];

    const kanaDest = verbConjugator.querySelector(".kana-dest");
    const endingDest = verbConjugator.querySelector(".ending-dest");

    kanaDest.innerHTML = newKana;
    endingDest.innerHTML = ending;
}
