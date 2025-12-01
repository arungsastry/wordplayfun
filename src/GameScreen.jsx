import { createSignal, For, createEffect } from 'solid-js';
import './GameScreen.css';
import { WORDS } from './words';

function GameScreen(props) {
  const [currentWordIndex, setCurrentWordIndex] = createSignal(0);
  const [gameComplete, setGameComplete] = createSignal(false);

  const currentWordData = () => WORDS[currentWordIndex()];
  const currentWord = () => currentWordData().word;
  const currentEmoji = () => currentWordData().emoji;

  // All alphabets A-Z - constant, never changes
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const [answerSlots, setAnswerSlots] = createSignal(
    new Array(currentWord().length).fill(null)
  );
  const [draggedLetter, setDraggedLetter] = createSignal(null);
  const [points, setPoints] = createSignal(0);
  const [flashColor, setFlashColor] = createSignal(null);
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

          // Move to next word or complete game
          const nextIndex = currentWordIndex() + 1;
          if (nextIndex < WORDS.length) {
            setCurrentWordIndex(nextIndex);
            const nextWordLength = WORDS[nextIndex].word.length;
            setAnswerSlots(new Array(nextWordLength).fill(null));
          } else {
            // All words completed!
            setGameComplete(true);
          }

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

  const removeLetter = (slotIndex) => {
    const letter = answerSlots()[slotIndex];
    if (letter) {
      // Clear the slot (letter stays in alphabet pool)
      const newSlots = [...answerSlots()];
      newSlots[slotIndex] = null;
      setAnswerSlots(newSlots);
    }
  };

  const clickToPlace = (letter) => {
    // Find first empty slot
    const slots = answerSlots();
    const emptySlotIndex = slots.findIndex(slot => slot === null);

    if (emptySlotIndex !== -1) {
      // Place letter in first empty slot (letter stays in alphabet pool)
      const newSlots = [...slots];
      newSlots[emptySlotIndex] = letter;
      setAnswerSlots(newSlots);
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

    // If moving from another slot, clear the old slot
    if (!dragged.fromPool) {
      newSlots[dragged.index] = null;
    }

    setAnswerSlots(newSlots);
    setDraggedLetter(null);
  };

  const handleDropOnPool = (e) => {
    e.preventDefault();
    const dragged = draggedLetter();
    if (!dragged || dragged.fromPool) return;

    // Remove letter from answer slot (it stays in alphabet pool)
    const newSlots = [...answerSlots()];
    newSlots[dragged.index] = null;
    setAnswerSlots(newSlots);
    setDraggedLetter(null);
  };

  // Show congratulations screen if game complete
  if (gameComplete()) {
    return (
      <div class="game-screen">
        <div class="congratulations-screen">
          <h1 class="congrats-title">🎉 CONGRATULATIONS! 🎉</h1>
          <p class="congrats-message">You completed all {WORDS.length} words!</p>
          <p class="final-score">Final Score: {points()} points</p>
          <button class="play-again-button" onClick={props.onBack}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class="game-screen">
      {/* Points Counter - Bottom Left */}
      <div class="points-counter">
        Points: {points()}
      </div>

      {/* Word Counter - Top Right */}
      <div class="word-counter">
        Word {currentWordIndex() + 1} / {WORDS.length}
      </div>

      <div class={`game-container ${flashColor() ? `flash-${flashColor()}` : ''}`}>
        {/* Letter Pool - All alphabets at top */}
        <div
          class="letter-pool"
          onDragOver={handleDragOver}
          onDrop={handleDropOnPool}
        >
          <For each={allLetters}>
            {(letter, index) => (
              <div
                class="letter-tile"
                draggable={true}
                onDragStart={(e) => handleDragStart(e, letter, true, index())}
                onClick={() => clickToPlace(letter)}
              >
                {letter}
              </div>
            )}
          </For>
        </div>

        {/* Visual/Image Area */}
        <div class="visual-area">
          <div class="placeholder-visual">
            <span>{currentEmoji()}</span>
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
    </div>
  );
}

export default GameScreen;
