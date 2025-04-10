//JerkmateCup_v1.0.1 - stamina bar added

import React, { useState, useEffect, useRef } from 'react';

const SchiumaParty = () => {
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [events, setEvents] = useState({
    player1: [],
    player2: []
  });
  const [currentEvents, setCurrentEvents] = useState({
    player1: null,
    player2: null
  });
  const [gameSpeed, setGameSpeed] = useState(1);
  const [winner, setWinner] = useState(null);
  const [staminaLevels, setStaminaLevels] = useState({});
  const [isRecharging, setIsRecharging] = useState({});
  const [strokeTimers, setStrokeTimers] = useState({});
  const [isStroking, setIsStroking] = useState({});
  const [progressLevels, setProgressLevels] = useState({ player1: 0, player2: 0 });
  const [pulseCount, setPulseCount] = useState({ player1: 0, player2: 0 });
  const [audioContext] = useState(() => new (window.AudioContext || window.webkitAudioContext)());

  const pulseTimersRef = useRef({});
  const hasWinnerRef = useRef(false);

  const totalGameTime = 30 * 60; // 30 minutes
  const eventInterval = 30; // 30 seconds between events

  const characters = [
    {
      name: "Andrea",
      nickname: "Legless King",
      archetipo: "Indomable",
      stats: {
        velocità: 9,
        precisione: 10,
        tecnica: 9,
        potenza: 8,
        stamina: 7,
        fortuna: 2
      },
      ability: "Liquid - Aumenta la velocità di caricamento del 40% per 5 secondi"
    },
    {
      name: "Luca",
      nickname: "La Bestia",
      archetipo: "Bear",
      stats: {
        velocità: 4,
        precisione: 6,
        tecnica: 3,
        potenza: 10,
        stamina: 5,
        fortuna: 9
      },
      ability: "Analisi Perfetta - Riduce la possibilità di errori del 70% per 8 secondi"
    },
    {
      name: "Tunillo",
      nickname: "AI",
      archetipo: "Engineer",
      stats: {
        velocità: 6,
        precisione: 7,
        tecnica: 10,
        potenza: 3,
        stamina: 5,
        fortuna: 5
      },
      ability: "Schiuma Esplosiva - Carica la barra di un immediato 15%"
    },
    {
      name: "Antonio",
      nickname: "Il Filosofo",
      archetipo: "Glasscannon",
      stats: {
        velocità: 6,
        precisione: 8,
        tecnica: 7,
        potenza: 5,
        stamina: 8,
        fortuna: 6
      },
      ability: "Armonia Perfetta - Rende tutte le statistiche 8/10 per 10 secondi"
    },
    {
      name: "Ernesto",
      nickname: "L'Erede di dio",
      archetipo: "Caos",
      stats: {
        velocità: 8,
        precisione: 9,
        tecnica: 9,
        potenza: 9,
        stamina: 2,
        fortuna: 6
      },
      ability: "Armonia Perfetta - Rende tutte le statistiche 8/10 per 10 secondi"
    },
    {
      name: "Simone S.",
      nickname: "Il Professore",
      archetipo: "Trickster",
      stats: {
        velocità: 6,
        precisione: 8,
        tecnica: 7,
        potenza: 6,
        stamina: 4,
        fortuna: 7
      },
      ability: "Armonia Perfetta - Rende tutte le statistiche 8/10 per 10 secondi"
    },
    {
      name: "Simone M.",
      nickname: "L'Artista",
      archetipo: "Cumslinger",
      stats: {
        velocità: 8,
        precisione: 9,
        tecnica: 9,
        potenza: 3,
        stamina: 2,
        fortuna: 4
      },
      ability: "Armonia Perfetta - Rende tutte le statistiche 8/10 per 10 secondi"
    },
    {
      name: "Salvatore",
      nickname: "Il Lampo",
      archetipo: "Speedster",
      stats: {
        velocità: 8,
        precisione: 9,
        tecnica: 9,
        potenza: 3,
        stamina: 3,
        fortuna: 4
      },
      ability: "Armonia Perfetta - Rende tutte le statistiche 8/10 per 10 secondi"
    },
    {
      name: "Marco",
      nickname: "dio",
      archetipo: "winner",
      stats: {
        velocità: 10,
        precisione: 10,
        tecnica: 10,
        potenza: 10,
        stamina: 10,
        fortuna: 10
      },
      ability: "Ottimizzazione - Aumenta l'efficienza del 25% per 12 secondi"
    }
  ];

  const possibleEvents = [
    {
      name: "Palle pulsanti!",
      description: "Un'improvvisa potenza ti fa pulsare le palle, aumentando il tuo progresso!",
      effect: "increase",
      value: 5,
      color: "green"
    },
    {
      name: "Pene afflosciato",
      description: "La pressione cala improvvisamente ammorbidendo il tuo pene, rallenta il progresso",
      effect: "slowdown",
      value: 0.5,
      duration: 60,
      color: "orange"
    },
    {
      name: "Frenulo infiammato",
      description: "Troppa schiuma sul pesce! Parte del progresso va perso",
      effect: "decrease",
      value: 3,
      color: "red"
    },
    {
      name: "Velocità Massiva",
      description: "Lo stroking accelera improvvisamente!",
      effect: "speedup",
      value: 2,
      duration: 45,
      color: "blue"
    },
    {
      name: "Sabotaggio!",
      description: "Qualcuno ha manomesso il tuo sistema! Perdi molto progresso",
      effect: "decrease",
      value: 8,
      color: "purple"
    },
    {
      name: "MARCO TI DA UNA MANO!",
      description: "MARCO TALENTO TI METTE UNA MANO SUL PESCE! Guadagni molto progresso",
      effect: "increase",
      value: 10,
      color: "teal"
    },
    {
      name: "Intasamento",
      description: "Un grumo di sborra blocca le palle, rallentando il processo",
      effect: "pause",
      duration: 30,
      color: "gray"
    },
    {
      name: "Manutenzione Rapida",
      description: "Una rapida sistemata al pisello migliora l'efficienza",
      effect: "speedup",
      value: 1.5,
      duration: 90,
      color: "cyan"
    }
  ];

  const generateRandomEvent = (playerIndex, characterName) => {
    const playerKey = `player${playerIndex + 1}`;
    const randomEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
    if (!currentEvents[playerKey]) {
      const newEvent = {
        ...randomEvent,
        id: Date.now(),
        time: time,
        playerName: characterName
      };
      setEvents(prev => ({ ...prev, [playerKey]: [...prev[playerKey], newEvent] }));
      setCurrentEvents(prev => ({ ...prev, [playerKey]: newEvent }));
      setTimeout(() => {
        setCurrentEvents(prev => ({ ...prev, [playerKey]: null }));
      }, 5000);
    }
  };

  const calculatePulsatingIncrement = (character) => {
    // Formula: potenza 1 = 0.2%, potenza 10 = 5%
    // Usiamo una scala lineare: (0.2 + (potenza - 1) * 0.533) * gameSpeed
    return (0.2 + (character.stats.potenza - 1) * 0.533) * gameSpeed;
  };

  const playStrokeSound = () => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // La nota A4
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const updateProgress = (playerKey, character) => {
    const currentPulse = (pulseCount[playerKey] || 0) + 1;
    setPulseCount(prev => ({ ...prev, [playerKey]: currentPulse }));

    const increment = calculatePulsatingIncrement(character);
    setProgressLevels(prev => {
      const newProgress = Math.min(prev[playerKey] + increment, 100);
      if (newProgress >= 100 && !hasWinnerRef.current) {
        setWinner(character.name);
        Object.values(pulseTimersRef.current).forEach(timer => clearInterval(timer));
        hasWinnerRef.current = true;
      }
      return { ...prev, [playerKey]: newProgress };
    });

    const alertElement = document.querySelector(`.stroke-alert.${playerKey}`);
    const barElement = document.querySelector(`.progress-bar.${playerKey} .progress-fill`);

    if (alertElement && barElement) {
      barElement.classList.add("stroking");
      alertElement.classList.add("visible");
      alertElement.textContent = `STROKING!`;

      playStrokeSound();

      setTimeout(() => {
        barElement.classList.remove("stroking");
        alertElement.classList.remove("visible");
      }, 900); // Cambiato da 1000 a 900ms
    }
  };

  const startGame = () => {
    if (selectedCharacters.length !== 2) return;
    setGameStarted(true);
    setTime(0);
    setEvents({ player1: [], player2: [] });
    setCurrentEvents({ player1: null, player2: null });
    setWinner(null);
    hasWinnerRef.current = false;
    setProgressLevels({ player1: 0, player2: 0 });
    setPulseCount({ player1: 0, player2: 0 });

    setStaminaLevels({
      [selectedCharacters[0]]: characters.find(c => c.name === selectedCharacters[0]).stats.stamina * 10,
      [selectedCharacters[1]]: characters.find(c => c.name === selectedCharacters[1]).stats.stamina * 10
    });

    selectedCharacters.forEach((characterName, index) => {
      const character = characters.find(c => c.name === characterName);
      const pulsePeriod = 10000 / character.stats.velocità;
      const playerKey = `player${index + 1}`;

      pulseTimersRef.current[playerKey] = setInterval(() => {
        updateProgress(playerKey, character);
        if (index === 0) {
          setTime(prevTime => {
            const newTime = prevTime + pulsePeriod / 1000;
            if (Math.floor(newTime) % eventInterval === 0 && Math.floor(newTime) !== 0) {
              generateRandomEvent(0, selectedCharacters[0]);
              setTimeout(() => generateRandomEvent(1, selectedCharacters[1]), 2000);
            }
            return newTime;
          });
        }
      }, pulsePeriod);
    });

    selectedCharacters.forEach(characterName => {
      const character = characters.find(c => c.name === characterName);
      const { strokeInterval } = calculateStrokeStats(character);
      strokeTimers[characterName] = setInterval(() => {
        performStroke(characterName);
      }, strokeInterval);
    });
  };

  const calculateStrokeStats = (character) => {
    const strokeInterval = (12 - character.stats.velocità) * 1000;
    const strokeGain = 0.4 * character.stats.potenza;
    return { strokeInterval, strokeGain };
  };

  const performStroke = (characterName) => {
    const character = characters.find(c => c.name === characterName);
    if (!character || hasWinnerRef.current) return;
    if (isRecharging[characterName]) return;

    const staminaCost = 10 + character.stats.potenza;
    if (staminaLevels[characterName] < staminaCost) return;

    setIsStroking(prev => ({ ...prev, [characterName]: true }));
    setStaminaLevels(prev => ({
      ...prev,
      [characterName]: Math.max(0, prev[characterName] - staminaCost)
    }));
    setTimeout(() => {
      setIsStroking(prev => ({ ...prev, [characterName]: false }));
    }, 500);
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderStatsChart = (stats) => {
    const maxSquares = 10;

    const getSquareColor = (index) => {
      const red = Math.round(255 - (index * 25.5));
      const green = Math.round(index * 25.5);
      return `rgb(${red}, ${green}, 0)`;
    };

    return (
      <div className="stats-container">
        {Object.entries(stats).map(([stat, value]) => (
          <div key={stat} className="stat-row flex items-center mb-2">
            <span className="stat-label font-arial font-semibold w-20 text-gray-700">
              {stat.charAt(0).toUpperCase() + stat.slice(1)}:
            </span>
            <div className="squares-container flex gap-1">
              {[...Array(maxSquares)].map((_, i) => (
                <div
                  key={i}
                  className="square-stat border border-gray-400"
                  style={{
                    backgroundColor: i < value ? getSquareColor(i) : '#e5e7eb',
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSpeedControls = () => (
    <div className="speed-controls mt-4 mb-4 text-center">
      <label className="mr-2 font-arial text-gray-700">Velocità di Gioco:</label>
      <select 
        value={gameSpeed} 
        onChange={(e) => setGameSpeed(parseFloat(e.target.value))}
        className="game-speed-select pregame"
      >
        <option value={0.5}>0.5x (Lento)</option>
        <option value={1}>1x (Normale)</option>
        <option value={2}>2x (Veloce)</option>
        <option value={3}>3x (Ultra)</option>
        <option value={5}>5x (INSANE)</option>
      </select>
    </div>
  );

  useEffect(() => {
    return () => {
      Object.values(pulseTimersRef.current).forEach(timer => clearInterval(timer));
      Object.values(strokeTimers).forEach(timer => clearInterval(timer));
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-100 rounded-lg shadow-lg my-8 relative">
      <h1 className="text-3xl font-bold font-arial text-center mb-6 neon-text">JERKMATE CUP</h1>

      {!gameStarted ? (
        <div className="character-selection">
          <h2 className="text-xl font-semibold font-arial text-center mb-4">Seleziona i tuoi 2 Jerkmate</h2>
          
          {renderSpeedControls()}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((character) => (
              <div
                key={character.name}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedCharacters.includes(character.name) ? 'selected bg-blue-50' : 'bg-white border-gray-300 hover:bg-blue-50'
                }`}
                onClick={() => setSelectedCharacters(prev => 
                  prev.includes(character.name) 
                    ? prev.filter(c => c !== character.name) 
                    : prev.length < 2 
                      ? [...prev, character.name] 
                      : [prev[1], character.name]
                )}
              >
                <h3 className="text-lg font-semibold font-arial">{character.name} - "{character.nickname}"</h3>
                <p className="text-sm text-gray-600 mb-2 font-arial">{character.archetipo}</p>
                <div className="stats-chart-container flex justify-center">
                  {renderStatsChart(character.stats)}
                </div>
                <p className="text-sm mt-2 font-arial">
                  <span className="font-semibold">Abilità:</span> {character.ability}
                </p>
              </div>
            ))}
          </div>

          {selectedCharacters.length === 2 && (
            <div className="mt-4 text-center">
              <p className="mb-2 text-gray-600">
                Velocità selezionata: {gameSpeed}x
              </p>
              <button
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                onClick={startGame}
              >
                Inizia Partita con {selectedCharacters[0]} vs {selectedCharacters[1]}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="game-screen relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Sfida: {selectedCharacters[0]} vs {selectedCharacters[1]}
            </h2>
            <div className="text-xl font-semibold">
              Tempo: {formatTime(time)} / {formatTime(totalGameTime)}
            </div>
          </div>

          <div className="stamina-container relative">
            <div className="stroke-alert player1">STROKING!</div>
            <div className="stroke-alert player2">STROKING!</div>

            <div className="stamina-player-container">
              <div className="text-lg font-bold mb-2 text-center">
                {selectedCharacters[0]}
              </div>
              <div className="stamina-bar">
                <div
                  className={`stamina-fill ${
                    isRecharging[selectedCharacters[0]] 
                      ? 'recharging' 
                      : staminaLevels[selectedCharacters[0]] < 30 
                        ? 'low' 
                        : ''
                  }`}
                  style={{
                    width: `${Math.round(staminaLevels[selectedCharacters[0]] || 0)}%`
                  }}
                >
                  {isRecharging[selectedCharacters[0]] && (
                    <span className="recharging-text">RECHARGING</span>
                  )}
                </div>
              </div>
              <div className="text-sm mt-1 text-center">
                Stamina: {Math.round(staminaLevels[selectedCharacters[0]] || 0)}%
              </div>
            </div>

            <div className="stamina-player-container">
              <div className="text-lg font-bold mb-2 text-center">
                {selectedCharacters[1]}
              </div>
              <div className="stamina-bar">
                <div
                  className={`stamina-fill ${
                    isRecharging[selectedCharacters[1]] 
                      ? 'recharging' 
                      : staminaLevels[selectedCharacters[1]] < 30 
                        ? 'low' 
                        : ''
                  }`}
                  style={{
                    width: `${Math.round(staminaLevels[selectedCharacters[1]] || 0)}%`
                  }}
                >
                  {isRecharging[selectedCharacters[1]] && (
                    <span className="recharging-text">RECHARGING</span>
                  )}
                </div>
              </div>
              <div className="text-sm mt-1 text-center">
                Stamina: {Math.round(staminaLevels[selectedCharacters[1]] || 0)}%
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="text-lg font-bold mb-2 text-right">
                Eventi di {selectedCharacters[0]}
              </div>
              {currentEvents.player1 && (
                <div className={`event-card p-3 rounded-lg bg-${currentEvents.player1.color}-100 border border-${currentEvents.player1.color}-500 transition-all`}>
                  <h3 className={`font-bold text-${currentEvents.player1.color}-700`}>
                    {currentEvents.player1.name}
                  </h3>
                  <p className={`text-${currentEvents.player1.color}-600`}>
                    {currentEvents.player1.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="text-lg font-bold mb-2 text-right">
                Eventi di {selectedCharacters[1]}
              </div>
              {currentEvents.player2 && (
                <div className={`event-card p-3 rounded-lg bg-${currentEvents.player2.color}-100 border border-${currentEvents.player2.color}-500 transition-all`}>
                  <h3 className={`font-bold text-${currentEvents.player2.color}-700`}>
                    {currentEvents.player2.name}
                  </h3>
                  <p className={`text-${currentEvents.player2.color}-600`}>
                    {currentEvents.player2.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="progress-bars-section mt-8">
            <div className="flex justify-between items-start gap-4">
              <div className="progress-bar-wrapper flex-1">
                <div className="text-center mb-2">{selectedCharacters[0]}</div>
                <div className="progress-bar player1">
                  <div className="stroke-alert">STROKING!</div>
                  <div
                    className="progress-fill"
                    style={{ height: `${progressLevels.player1}%` }}
                  ></div>
                </div>
              </div>

              <div className="progress-bar-wrapper flex-1">
                <div className="text-center mb-2">{selectedCharacters[1]}</div>
                <div className="progress-bar player2">
                  <div className="stroke-alert">STROKING!</div>
                  <div
                    className="progress-fill"
                    style={{ height: `${progressLevels.player2}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {winner && (
            <div className="text-center p-4 bg-green-100 border border-green-500 rounded-lg mb-4">
              <h3 className="text-xl font-bold text-green-700">Complimenti!</h3>
              <p className="text-lg">{winner} ha vinto in {formatTime(time)}!</p>
            </div>
          )}

          <div className="text-center mt-4">
            <button
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold font-arial hover:bg-gray-600 transition-colors"
              onClick={() => window.location.href = window.location.href}
            >
              Torna alla Selezione dei Personaggi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchiumaParty;