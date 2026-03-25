let buildActive = false;
let fallingItemsContainer = null;
let screen1BottomBox = null;
let screen1BottomFloor = null;
let screen1 = null;
let screen1TopRight = null;
let score = 0;
let fallingInterval;
let puzzlePieces = [];
let puzzleContainer = null;


document.addEventListener('DOMContentLoaded', function () {
    screen1 = document.querySelector('.screen1');
    screen1BottomBox = document.querySelector('.screen1_bottom_box');
    screen1BottomFloor = document.querySelector('.screen1_bottom_floor');
    screen1TopRight = document.querySelector('.screen1_top_right');
    fallingItemsContainer = document.createElement('div');
    fallingItemsContainer.className = 'falling_items_container';
    screen1.appendChild(fallingItemsContainer);

    const popup = document.getElementById('popupOverlay');
    if (popup) {
        popup.style.display = 'flex';
    }

    const closeBtn = document.getElementById('closePopup');
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            popup.style.display = 'none';
            startBuild();
        });
    }

    const summaryClose = document.getElementById('closeSummary');
    if (summaryClose) {
        summaryClose.addEventListener('click', function () {
            document.getElementById('summaryPopup').style.display = 'none';
        });
    }
    puzzleContainer = document.querySelector('.puzzle_content');
    if (puzzleContainer) {
        makeDropZone(puzzleContainer);
        createPuzzlePieces();
    }
    initInteractiveHouse();
});
function startBuild() {

    score = 0;
    updateScore();
    buildActive = true;

    if (screen1BottomBox) {
        screen1BottomBox.style.cursor = 'grab';
        screen1BottomBox.classList.add('catcher_box');
        screen1BottomBox.style.position = 'fixed';
        screen1BottomBox.style.bottom = '200px';
        screen1BottomBox.style.zIndex = '1000';
        screen1BottomBox.style.display = 'flex';

        const boxWidth = screen1BottomBox.offsetWidth;
        const startX = (window.innerWidth / 2) - (boxWidth / 2);
        screen1BottomBox.style.left = startX + 'px';
    }

    if (screen1BottomFloor) {
        screen1BottomFloor.style.zIndex = '99';
    }

    fallingInterval = setInterval(() => {
        if (buildActive) {
            createFallingItem();
        }
    }, 800);

    document.addEventListener('mousemove', moveCatcher);
    
    window.addEventListener('scroll', handleScroll);
}
function moveCatcher(e) {
    if (!buildActive || !screen1BottomBox) return;

    if (!isScreen1Visible()) {
        screen1BottomBox.style.display = 'none';
        return;
    }
    
    const screen1Rect = screen1.getBoundingClientRect();
    const isOverScreen1 =
        e.clientX >= screen1Rect.left &&
        e.clientX <= screen1Rect.right &&
        e.clientY >= screen1Rect.top &&
        e.clientY <= screen1Rect.bottom;

    if (isOverScreen1) {
        screen1BottomBox.style.display = 'flex';
        
        let newX = e.clientX - screen1BottomBox.offsetWidth / 2;
        newX = Math.max(screen1Rect.left, Math.min(newX, screen1Rect.right - screen1BottomBox.offsetWidth));
        
        screen1BottomBox.style.left = newX + 'px';
    } else {
        screen1BottomBox.style.display = 'none';
    }
}
function isScreen1Visible() {
    if (!screen1) return false;

    const screen1Rect = screen1.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    return screen1Rect.bottom > 0 && screen1Rect.top < windowHeight;
}
function handleScroll() {
    if (!buildActive || !screen1BottomBox) return;
    
    if (!isScreen1Visible()) {
        screen1BottomBox.style.display = 'none';
    }
}

window.addEventListener('scroll', handleScroll);
function createFallingItem() {
    if (!fallingItemsContainer || !screen1) return;

    const item = document.createElement('div');
    item.className = 'falling_item';

    const images = [
        { path: 'assets/images/house_part.svg', width: 135, height: 34 },
        { path: 'assets/images/house_part2.svg', width: 43, height: 46 },
        { path: 'assets/images/house_part3.svg', width: 132, height: 37 }
    ];

    const randomIndex = Math.floor(Math.random() * images.length);
    const selectedImage = images[randomIndex];
    const screen1Rect = screen1.getBoundingClientRect();

    item.style.width = selectedImage.width + 'px';
    item.style.height = selectedImage.height + 'px';
    item.style.backgroundImage = `url('${selectedImage.path}')`;
    item.style.backgroundSize = 'contain';
    item.style.backgroundRepeat = 'no-repeat';
    item.style.backgroundPosition = 'center';

    const randomX = Math.random() * (screen1Rect.width - selectedImage.width);
    item.style.left = randomX + 'px';
    item.style.top = '0px';

    const duration = 2 + Math.random() * 3;
    item.style.animation = `fall ${duration}s linear forwards`;

    item.style.setProperty('--target_top', screen1Rect.height - 150 + 'px');

    fallingItemsContainer.appendChild(item);

    function checkCollision() {
        if (!buildActive || !item.parentNode || !screen1BottomBox || !screen1) return;

        const boxRect = screen1BottomBox.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();

        if (itemRect.bottom >= boxRect.top &&
            itemRect.right >= boxRect.left &&
            itemRect.left <= boxRect.right &&
            itemRect.top <= boxRect.bottom) {


            score++;
            updateScore();
            item.remove();

            if (score >= 5) {
                summaryBuild();
            }

            return;
        }

        if (item.parentNode) {
            requestAnimationFrame(checkCollision);
        }
    }

    requestAnimationFrame(checkCollision);

    setTimeout(() => {
        if (item.parentNode) {
            item.remove();
        }
    }, duration * 1000);
}

function updateScore() {
    if (screen1TopRight) {
        screen1TopRight.textContent = score + '/5 В КОРЗИНЕ';
    }
}

function summaryBuild() {
    buildActive = false;
    clearInterval(fallingInterval);

    if (fallingItemsContainer) {
        fallingItemsContainer.innerHTML = '';
    }

    if (screen1BottomBox) {
        screen1BottomBox.style.position = '';
        screen1BottomBox.style.left = '';
        screen1BottomBox.style.bottom = '';
        screen1BottomBox.style.cursor = '';
        screen1BottomBox.style.display = 'flex';
        screen1BottomBox.classList.remove('catcher_box');
    }

    document.removeEventListener('mousemove', moveCatcher);
    window.removeEventListener('scroll', handleScroll);

    document.getElementById('summaryPopup').style.display = 'flex';
}









function makeDropZone(zone) {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();

        const pieceId = e.dataTransfer.getData('text/plain');
        const draggedPiece = document.getElementById(pieceId);

        if (draggedPiece) {
            const realWidth = parseInt(draggedPiece.dataset.realWidth) || 100;
            const realHeight = parseInt(draggedPiece.dataset.realHeight) || 100;

            const rect = zone.getBoundingClientRect();
            const x = e.clientX - rect.left - (realWidth / 2);
            const y = e.clientY - rect.top - (realHeight / 2);

            const newPiece = draggedPiece.cloneNode(true);
            newPiece.id = pieceId + '_' + Date.now();
            newPiece.classList.add('placed');
            newPiece.style.position = 'absolute';
            newPiece.style.left = x + 'px';
            newPiece.style.top = y + 'px';
            
            newPiece.style.width = realWidth + 'px';
            newPiece.style.height = realHeight + 'px';
            newPiece.style.cursor = 'move';
            newPiece.style.objectFit = 'contain';

            newPiece.setAttribute('draggable', 'true');

            newPiece.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.id);
            });

            newPiece.addEventListener('dragend', (e) => {
                e.target.style.opacity = '1';
            });

            zone.appendChild(newPiece);

            draggedPiece.style.display = 'none';
        }
    });
}

function createPuzzlePieces() {
    const container = document.createElement('div');
    container.className = 'pieces_container';

    const pieces = [
        { id: 'piece1', src: 'assets/images/puzzle_piece1.svg', width: 520, height: 308 },
        { id: 'piece2', src: 'assets/images/puzzle_piece2.svg', width: 372, height: 258 },
        { id: 'piece3', src: 'assets/images/puzzle_piece3.svg', width: 368, height: 332 },
        { id: 'piece4', src: 'assets/images/puzzle_piece4.svg', width: 164, height: 332 },
        { id: 'piece5', src: 'assets/images/puzzle_piece5.svg', width: 366, height: 332 }
    ];

    pieces.forEach(p => {
        const piece = document.createElement('img');
        piece.id = p.id;
        piece.src = p.src;
        piece.className = 'puzzle_piece';
        piece.setAttribute('draggable', 'true');
        
        piece.dataset.realWidth = p.width;
        piece.dataset.realHeight = p.height;
        
        piece.style.width = '100px';
        piece.style.height = '100px';
        piece.style.objectFit = 'contain';

        piece.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.id);
        });

        container.appendChild(piece);
    });

    const puzzle = document.querySelector('.puzzle');
    puzzle.insertBefore(container, document.querySelector('.puzzle_content'));
}







function handleScreen3Scroll() {
    const screen3 = document.querySelector('.screen3');
    const title = document.querySelector('.screen3_title');
    const timeline1 = document.getElementById('timeline1');
    const timeline2 = document.getElementById('timeline2');
    const timeline3 = document.getElementById('timeline3');
    const timeline4 = document.getElementById('timeline4');
    
    if (!screen3) return;
    
    const screen3Top = screen3.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (screen3Top < windowHeight - 100) {
        title.classList.add('visible');
    } else {
        title.classList.remove('visible');
    }
    
    if (screen3Top < windowHeight - 400) {
        timeline1.classList.add('visible');
    } else {
        timeline1.classList.remove('visible');
    }
    
    if (screen3Top < windowHeight - 600) {
        timeline2.classList.add('visible');
    } else {
        timeline2.classList.remove('visible');
    }
    
    if (screen3Top < windowHeight - 800) {
        timeline3.classList.add('visible');
    } else {
        timeline3.classList.remove('visible');
    }
    
    if (screen3Top < windowHeight - 1000) {
        timeline4.classList.add('visible');
    } else {
        timeline4.classList.remove('visible');
    }
}
window.addEventListener('scroll', handleScreen3Scroll);
window.addEventListener('resize', handleScreen3Scroll);

setTimeout(handleScreen3Scroll, 100);





let isRecording = false;
let recordedSequence = [];
let audioContext = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function playNote(frequency, duration = 0.3) {
    initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

const noteFrequencies = {
    sound1: 261.63,
    sound2: 293.66,
    sound3: 329.63,
    sound4: 349.23,
    sound5: 392.00,
    sound6: 440.00,
    sound7: 493.88,
    sound8: 523.25
};

const noteNames = {
    sound1: 'ДО',
    sound2: 'РЕ',
    sound3: 'МИ',
    sound4: 'ФА',
    sound5: 'СОЛЬ',
    sound6: 'ЛЯ',
    sound7: 'СИ',
    sound8: 'ДО²'
};

document.querySelectorAll('.music_btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const soundId = this.dataset.sound;
        const frequency = noteFrequencies[soundId];
        
        playNote(frequency);
        
        this.classList.add('active');
        setTimeout(() => {
            this.classList.remove('active');
        }, 200);
        
        if (isRecording) {
            recordedSequence.push({
                sound: soundId,
                time: Date.now()
            });
        }
    });
});

const recordBtn = document.getElementById('recordBtn');
recordBtn.addEventListener('click', function() {
    initAudio();
    
    if (!isRecording) {
        isRecording = true;
        recordedSequence = [];
        this.classList.add('recording');
        this.innerHTML = '<span class="square"></span> СТОП';
    } else {
        isRecording = false;
        this.classList.remove('recording');
        this.innerHTML = '<span class="circle"></span> ЗАПИСЬ';
    }
});

const playBtn = document.getElementById('playBtn');
playBtn.addEventListener('click', async function() {
    if (recordedSequence.length === 0) {
        alert('Сначала запишите что-нибудь!');
        return;
    }
    
    initAudio();
    this.style.opacity = '0.5';
    this.textContent = 'ПЕСНЯ...';
    
    
    const firstNoteTime = recordedSequence[0].time;
    
    for (let note of recordedSequence) {
        const delay = note.time - firstNoteTime;
        
        setTimeout(() => {
            playNote(noteFrequencies[note.sound]);
            
            animateCows();
            
            const btn = document.querySelector(`[data-sound="${note.sound}"]`);
            if (btn) {
                btn.classList.add('active');
                setTimeout(() => {
                    btn.classList.remove('active');
                }, 200);
            }
        }, delay);
    }
    
    const lastNoteTime = recordedSequence[recordedSequence.length - 1].time;
    const totalDuration = lastNoteTime - firstNoteTime + 500;
    
    setTimeout(() => {
        this.style.opacity = '1';
        this.textContent = '▶ ПРОИГРАТЬ';
    }, totalDuration);
});

document.body.addEventListener('click', function initAudioOnFirstClick() {
    initAudio();
    document.body.removeEventListener('click', initAudioOnFirstClick);
}, { once: true });

function animateCows() {
    const cowLeft = document.querySelector('.cow_left');
    const cowRight = document.querySelector('.cow_right');
    
    if (cowLeft) {
        cowLeft.classList.add('dancing');
        setTimeout(() => {
            cowLeft.classList.remove('dancing');
        }, 300);
    }
    
    if (cowRight) {
        cowRight.classList.add('dancing');
        setTimeout(() => {
            cowRight.classList.remove('dancing');
        }, 300);
    }
}





function initInteractiveHouse() {
    const windows = document.querySelectorAll('.window');
    const windowPopup = document.getElementById('windowPopup');
    const windowPopupText = document.getElementById('windowPopupText');
    const closeWindowPopup = document.getElementById('closeWindowPopup');
    
    if (!windows.length || !windowPopup) return;
    
    function showPopup(text) {
        windowPopupText.textContent = text;
        windowPopup.style.display = 'flex';
    }
    
    if (closeWindowPopup) {
        closeWindowPopup.addEventListener('click', function() {
            windowPopup.style.display = 'none';
        });
    }
    
    windowPopup.addEventListener('click', function(e) {
        if (e.target === windowPopup) {
            windowPopup.style.display = 'none';
        }
    });
    
    windows.forEach(window => {
        window.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const infoText = this.dataset.info;
            
            if (infoText) {
                showPopup(infoText);
            }
            
            const diamond = this.querySelector('.diamond');
            if (diamond) {
                diamond.style.transform = 'rotate(45deg) scale(1.2)';
                setTimeout(() => {
                    diamond.style.transform = 'rotate(45deg) scale(1)';
                }, 200);
            }
            
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}