import { createSignal } from 'solid-js';
import './styles.css';
import GameScreen from './GameScreen';

function App() {
  const [currentScreen, setCurrentScreen] = createSignal('welcome'); // 'welcome' or 'game'

  const handleGoClick = () => {
    setCurrentScreen('game');
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
  };

  return (
    <>
      {currentScreen() === 'welcome' ? (
        <div class="container">
          <h1>Hello Aariv!</h1>
          <button class="go-button" onClick={handleGoClick}>
            GO
          </button>
        </div>
      ) : (
        <GameScreen onBack={handleBackToWelcome} />
      )}
    </>
  );
}

export default App;
