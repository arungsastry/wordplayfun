import { createSignal, For, createEffect } from 'solid-js';
import './GameScreen.css';

function GameScreen(props) {
  // Sample first word - "CAT" (hidden from display)
  const [currentWord] = createSignal('CAT');

  // All alphabets A-Z
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const [letterPool, setLetterPool] = createSignal(allLetters);
  const [answerSlots, setAnswerSlots] = createSignal([null, null, null]); // 3 slots for CAT
  const [draggedLetter, setDraggedLetter] = createSignal(null);
  const [points, setPoints] = createSignal(0);
  const [flashColor, setFlashColor] = createSignal(null); // 'blue' or 'red'
  const [isChecking, setIsChecking] = createSignal(false);

  // Check answer when slots change
  createEffect(() => {
    const slots = answerSlots();
    // Check if all slots are filled and we're not already checking
    if (slots.every(slot => slot !== null) && !isChecking()) {
      setIsChecking(true);
      const userAnswer = slots.join('');
      const correctAnswer = currentWord();

      if (userAnswer === correctAnswer) {
        // Correct! Flash blue and increment points ONCE
        setFlashColor('blue');
        setPoints(p => p + 1);
        setTimeout(() => {
          setFlashColor(null);
          resetGame();
          setIsChecking(false);
        }, 1000);
      } else {
        // Wrong! Flash red
        setFlashColor('red');
        setTimeout(() => {
          setFlashColor(null);
          setIsChecking(false);
        }, 1000);
      }
    }
  });

  const resetGame = () => {
    setAnswerSlots([null, null, null]);
    setLetterPool(allLetters);
  };

  const removeLetter = (slotIndex) => {
    const letter = answerSlots()[slotIndex];
    if (letter) {
      // Return letter to pool
      setLetterPool([...letterPool(), letter]);
      // Clear the slot
      const newSlots = [...answerSlots()];
      newSlots[slotIndex] = null;
      setAnswerSlots(newSlots);
    }
  };

  const clickToPlace = (letter, poolIndex) => {
    // Find first empty slot
    const slots = answerSlots();
    const emptySlotIndex = slots.findIndex(slot => slot === null);

    if (emptySlotIndex !== -1) {
      // Place letter in first empty slot
      const newSlots = [...slots];
      newSlots[emptySlotIndex] = letter;
      setAnswerSlots(newSlots);

      // Remove letter from pool
      const newPool = letterPool().filter((_, i) => i !== poolIndex);
      setLetterPool(newPool);
    }
  };

  const handleDragStart = (e, letter, fromPool, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', letter);
    setDraggedLetter({ letter, fromPool, index });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnSlot = (e, slotIndex) => {
    e.preventDefault();
    const dragged = draggedLetter();
    if (!dragged) return;

    // Don't allow drop if slot is already filled
    if (answerSlots()[slotIndex] !== null) return;

    const newSlots = [...answerSlots()];
    newSlots[slotIndex] = dragged.letter;
    setAnswerSlots(newSlots);

    // Remove letter from pool if it came from pool
    if (dragged.fromPool) {
      const newPool = letterPool().filter((_, i) => i !== dragged.index);
      setLetterPool(newPool);
    } else {
      // If moving from another slot, clear the old slot
      const oldSlots = [...answerSlots()];
      oldSlots[dragged.index] = null;
      setAnswerSlots(oldSlots);
    }

    setDraggedLetter(null);
  };

  const handleDropOnPool = (e) => {
    e.preventDefault();
    const dragged = draggedLetter();
    if (!dragged || dragged.fromPool) return;

    // Return letter to pool from answer slot
    setLetterPool([...letterPool(), dragged.letter]);
    const newSlots = [...answerSlots()];
    newSlots[dragged.index] = null;
    setAnswerSlots(newSlots);
    setDraggedLetter(null);
  };

  return (
    <div class="game-screen">
      {/* Points Counter - Bottom Left */}
      <div class="points-counter">
        Points: {points()}
      </div>

      <div class={`game-container ${flashColor() ? `flash-${flashColor()}` : ''}`}>
        {/* Letter Pool - All alphabets at top */}
        <div
          class="letter-pool"
          onDragOver={handleDragOver}
          onDrop={handleDropOnPool}
        >
          <For each={letterPool()}>
            {(letter, index) => (
              <div
                class="letter-tile"
                draggable={true}
                onDragStart={(e) => handleDragStart(e, letter, true, index())}
                onClick={() => clickToPlace(letter, index())}
              >
                {letter}
              </div>
            )}
          </For>
        </div>

        {/* Visual/Image Area */}
        <div class="visual-area">
          <div class="placeholder-visual">
            <span>🐱</span>
          </div>
        </div>

        {/* Answer Slots - below visual */}
        <div class="answer-slots">
          <For each={answerSlots()}>
            {(letter, index) => (
              <div
                class="answer-slot"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnSlot(e, index())}
              >
                {letter && (
                  <div class="letter-tile-wrapper">
                    <button
                      class="remove-letter"
                      onClick={() => removeLetter(index())}
                    >
                      ×
                    </button>
                    <div
                      class="letter-tile placed"
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, letter, false, index())}
                    >
                      {letter}
                    </div>
                  </div>
                )}
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Back Button */}
      <button class="back-button" onClick={props.onBack}>
        ← Back
      </button>
    </div>
  );
}

export default GameScreen;
