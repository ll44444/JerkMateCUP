//JerkmateCup_v1.0.1 - stamina bar added

import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const SchiumaParty = () => {
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [foamLevels, setFoamLevels] = useState({});
  const [time, setTime] = useState(0);
  const [foamDataMap, setFoamDataMap] = useState({});
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [gameSpeed, setGameSpeed] = useState(1); // Per la demo, accelleriamo il gioco
  const [winner, setWinner] = useState(null);
  const [staminaLevels, setStaminaLevels] = useState({});
  const [isRecharging, setIsRecharging] = useState({});
  const [strokeTimers, setStrokeTimers] = useState({});
  const [isStroking, setIsStroking] = useState({});

  const foamTimerRef = useRef(null);
  const gameTimerRef = useRef(null);
  const eventTimerRef = useRef(null);
  const hasWinnerRef = useRef(false);

  const totalGameTime = 30 * 60; // 30 minuti in secondi
  const eventInterval = 3 * 60; // 3 minuti in secondi

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
      ability: "Liquid - Aumenta la velocità di caricamento del 40% per 5 secondi",
      loadRate: 0.06 // Tasso rallentato per durare 30 minuti
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
      ability: "Analisi Perfetta - Riduce la possibilità di errori del 70% per 8 secondi",
      loadRate: 0.055
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
      ability: "Schiuma Esplosiva - Carica la barra di un immediato 15%",
      loadRate: 0.058
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
      ability: "Armonia Perfetta - Rende tutte le statistiche 8/10 per 10 secondi",
      loadRate: 0.059
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
      ability: "Armonia Perfetta - Rende tutte le statistiche 8/10 per 10 secondi",
      loadRate: 0.059
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
      ability: "Armonia Perfetta - Rende tutte le statistiche 8/10 per 10 secondi",
      loadRate: 0.059
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
      ability: "Armonia Perfetta - Rende tutte le statistiche 8/10 per 10 secondi",
      loadRate: 0.059
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
      ability: "Armonia Perfetta - Rende tutte le statistiche 8/10 per 10 secondi",
      loadRate: 0.059
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
      ability: "Ottimizzazione - Aumenta l'efficienza del 25% per 12 secondi",
      loadRate: 0.8
    }
  ];

  // Array di possibili eventi casuali
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
      value: 0.5, // moltiplica per 0.5 la velocità
      duration: 60, // 60 secondi
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
      value: 2, // moltiplica per 2 la velocità
      duration: 45, // 45 secondi
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
      duration: 30, // 30 secondi
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

  // Funzione migliorata per renderizzare il grafico esagonale delle statistiche
  const renderHexagonChart = (stats) => {
    const statNames = Object.keys(stats);
    const statValues = Object.values(stats);
    const maxStat = 10;
    const size = 150;
    const center = size / 2;
    const radius = size * 0.3;

    // Calcola i punti dell'esagono
    const points = statNames.map((_, i) => {
      const angle = Math.PI * 2 * i / statNames.length - Math.PI / 2;
      const value = statValues[i] / maxStat;
      const x = center + radius * Math.cos(angle) * value;
      const y = center + radius * Math.sin(angle) * value;
      return { x, y };
    });

    // Renderizza l'esagono delle statistiche
    return (
      <div className="w-full flex justify-center mt-4">
        <svg width={size} height={size} className="stats-hexagon">
          {/* Sfondo bianco per migliorare leggibilità */}
          <circle cx={center} cy={center} r={radius + 25} fill="#FFFFFF" />

          {/* Griglia di sfondo */}
          {[2, 4, 6, 8, 10].map((level, i) => {
            const ratio = level / maxStat;
            const hexPoints = statNames.map((_, j) => {
              const angle = Math.PI * 2 * j / statNames.length - Math.PI / 2;
              const x = center + radius * Math.cos(angle) * ratio;
              const y = center + radius * Math.sin(angle) * ratio;
              return `${x},${y}`;
            }).join(' ');

            return (
              <polygon
                key={`grid-${i}`}
                points={hexPoints}
                fill="none"
                stroke={level === 10 ? "#aaaaaa" : "#dddddd"}
                strokeWidth={level === 10 ? "1" : "0.75"}
              />
            );
          })}

          {/* Assi delle statistiche */}
          {statNames.map((_, i) => {
            const angle = Math.PI * 2 * i / statNames.length - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#dddddd"
                strokeWidth="0.75"
              />
            );
          })}

          {/* Statistiche */}
          <polygon
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="rgba(0, 123, 255, 0.4)"
            stroke="#0056b3"
            strokeWidth="2"
          />

          {/* Etichette delle statistiche */}
          {statNames.map((stat, i) => {
            const angle = Math.PI * 2 * i / statNames.length - Math.PI / 2;
            const x = center + (radius + 20) * Math.cos(angle);
            const y = center + (radius + 20) * Math.sin(angle);

            // Aggiungiamo un piccolo sfondo bianco per migliorare la leggibilità del testo
            return (
              <g key={`label-${i}`}>

                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill="#000000"
                  style={{ textShadow: "1px 1px 1px #FFFFFF, -1px -1px 1px #FFFFFF, 1px -1px 1px #FFFFFF, -1px 1px 1px #FFFFFF" }}
                >
                  {stat.charAt(0).toUpperCase() + stat.slice(1)}
                </text>
                {/* Mostra anche il valore numerico vicino al punto */}
                <text
                  x={points[i].x}
                  y={points[i].y + (angle > Math.PI * 0.5 && angle < Math.PI * 1.5 ? -10 : 15)}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#333333"
                  className="value-label"
                >
                  {statValues[i]}
                </text>
              </g>
            );
          })}

          {/* Punti delle statistiche */}
          {points.map((point, i) => (
            <circle
              key={`point-${i}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#0056b3"
              stroke="#FFFFFF"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>
    );
  };

  // Funzione per generare un evento casuale
  const generateRandomEvent = () => {
    const randomEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
    const newEvent = {
      ...randomEvent,
      id: Date.now(),
      time: time
    };

    setEvents(prevEvents => [...prevEvents, newEvent]);
    setCurrentEvent(newEvent);

    // Applica l'effetto dell'evento
    applyEventEffect(newEvent);

    // Rimuovi l'evento corrente dopo un periodo
    setTimeout(() => {
      setCurrentEvent(null);

      // Se l'evento ha una durata, ripristina i valori normali dopo la durata
      if ((newEvent.effect === 'speedup' || newEvent.effect === 'slowdown') && newEvent.duration) {
        const character = characters.find(c => c.name === selectedCharacters);
        if (character) {
          // Rimuovi l'effetto temporaneo
          clearInterval(foamTimerRef.current);

          foamTimerRef.current = setInterval(() => {
            updateFoamLevel(character.loadRate);
          }, 1000 / gameSpeed);
        }
      }
    }, 5000); // Mostra l'evento per 5 secondi
  };

  // Funzione per applicare l'effetto dell'evento
  const applyEventEffect = (event) => {
    selectedCharacters.forEach(characterName => {
      const character = characters.find(c => c.name === characterName);
      if (!character) return;

      switch (event.effect) {
        case 'increase':
          // Incrementa immediatamente la barra
          setFoamLevels(prevLevels => ({
            ...prevLevels,
            [characterName]: Math.min((prevLevels[characterName] || 0) + event.value, 100)
          }));
          break;

        case 'decrease':
          // Decrementa immediatamente la barra
          setFoamLevels(prevLevels => ({
            ...prevLevels,
            [characterName]: Math.max((prevLevels[characterName] || 0) - event.value, 0)
          }));
          break;

        case 'speedup':
          // Aumenta la velocità di caricamento per un periodo
          if (foamTimerRef.current[characterName]) {
            clearInterval(foamTimerRef.current[characterName]);

            foamTimerRef.current[characterName] = setInterval(() => {
              updateFoamLevel(characterName, character.loadRate * event.value);
            }, 1000 / gameSpeed);

            if (event.duration) {
              setTimeout(() => {
                if (foamTimerRef.current[characterName]) {
                  clearInterval(foamTimerRef.current[characterName]);

                  foamTimerRef.current[characterName] = setInterval(() => {
                    updateFoamLevel(characterName, character.loadRate);
                  }, 1000 / gameSpeed);
                }
              }, event.duration * 1000 / gameSpeed);
            }
          }
          break;

        case 'slowdown':
          // Rallenta la velocità di caricamento per un periodo
          if (foamTimerRef.current[characterName]) {
            clearInterval(foamTimerRef.current[characterName]);

            foamTimerRef.current[characterName] = setInterval(() => {
              updateFoamLevel(characterName, character.loadRate * event.value);
            }, 1000 / gameSpeed);

            if (event.duration) {
              setTimeout(() => {
                if (foamTimerRef.current[characterName]) {
                  clearInterval(foamTimerRef.current[characterName]);

                  foamTimerRef.current[characterName] = setInterval(() => {
                    updateFoamLevel(characterName, character.loadRate);
                  }, 1000 / gameSpeed);
                }
              }, event.duration * 1000 / gameSpeed);
            }
          }
          break;

        case 'pause':
          // Ferma completamente il caricamento per un periodo
          if (foamTimerRef.current[characterName]) {
            clearInterval(foamTimerRef.current[characterName]);

            if (event.duration) {
              setTimeout(() => {
                foamTimerRef.current[characterName] = setInterval(() => {
                  updateFoamLevel(characterName, character.loadRate);
                }, 1000 / gameSpeed);
              }, event.duration * 1000 / gameSpeed);
            }
          }
          break;

        default:
          break;
      }
    });
  };

  // Modifica anche startStaminaRecharge per riavviare il timer solo dopo la ricarica
const startStaminaRecharge = (characterName) => {
  const character = characters.find(c => c.name === characterName);
  if (!character) return;

  // Ferma il timer della foam durante la ricarica
  if (foamTimerRef.current[characterName]) {
    clearInterval(foamTimerRef.current[characterName]);
    foamTimerRef.current[characterName] = null;
  }

  setIsRecharging(prev => ({ ...prev, [characterName]: true }));

  const rechargeTime = 10000 * (1 - (character.stats.stamina / 12));
  const targetStamina = character.stats.stamina * 10;

  setTimeout(() => {
    setStaminaLevels(prev => ({ 
      ...prev, 
      [characterName]: targetStamina 
    }));
    setIsRecharging(prev => ({ ...prev, [characterName]: false }));

    // Riavvia il timer della foam SOLO dopo che la ricarica è completa
    foamTimerRef.current[characterName] = setInterval(() => {
      updateFoamLevel(characterName, character.loadRate);
    }, 1000 / gameSpeed);
  }, rechargeTime);
};

  // Modify your existing drainStamina function
  const drainStamina = (characterName) => {
    setStaminaLevels(prevLevels => {
      const currentLevel = prevLevels[characterName] || 0;
      const newLevel = Math.max(0, currentLevel - 0.1);

      // If stamina hits 0 and not already recharging, start recharge
      if (newLevel === 0 && !isRecharging[characterName]) {
        startStaminaRecharge(characterName);
      }

      return {
        ...prevLevels,
        [characterName]: newLevel
      };
    });
  };

  // Modifica completamente la funzione updateFoamLevel
const updateFoamLevel = (characterName, rate) => {
  // 1. Controllo immediato: se c'è un vincitore o sta ricaricando, non fare nulla
  if (hasWinnerRef.current || isRecharging[characterName] || staminaLevels[characterName] <= 0) {
    return;
  }

  // 2. Drain stamina
  drainStamina(characterName);

  // 3. Controllo finale: se la stamina è 0 o sta ricaricando, non aggiornare il progresso
  if (isRecharging[characterName] || staminaLevels[characterName] <= 0) {
    return;
  }

  // 4. Solo se passiamo tutti i controlli, aggiorniamo il progresso
  setFoamLevels(prevLevels => {
    const prevLevel = prevLevels[characterName] || 0;
    if (prevLevel >= 100) return prevLevels;

    const newLevel = Math.min(prevLevel + rate, 100);

    // Aggiorniamo il grafico solo se siamo sicuri di poter procedere
    setFoamDataMap(prevDataMap => ({
      ...prevDataMap,
      [characterName]: [
        ...(prevDataMap[characterName] || []),
        { time: time / 60, foam: newLevel }
      ]
    }));

    if (newLevel >= 100) {
      hasWinnerRef.current = true;
      setWinner(characterName);
      endGame();
    }

    return {
      ...prevLevels,
      [characterName]: newLevel
    };
  });
};

  // Funzione per avviare il gioco
  const startGame = () => {
    if (selectedCharacters.length !== 2) return;

    setGameStarted(true);
    setFoamLevels({
      [selectedCharacters[0]]: 0,
      [selectedCharacters[1]]: 0
    });
    setFoamDataMap({
      [selectedCharacters[0]]: [{ time: 0, foam: 0 }],
      [selectedCharacters[1]]: [{ time: 0, foam: 0 }]
    });
    setTime(0);
    setEvents([]);
    setCurrentEvent(null);
    setWinner(null);
    setStaminaLevels({
      [selectedCharacters[0]]: characters.find(c => c.name === selectedCharacters[0]).stats.stamina * 10,
      [selectedCharacters[1]]: characters.find(c => c.name === selectedCharacters[1]).stats.stamina * 10
    });

    // Timer per il gioco (incrementa ogni secondo)
    gameTimerRef.current = setInterval(() => {
      setTime(prevTime => {
        const newTime = prevTime + 1;

        // Verifica se è tempo di generare un evento (ogni 3 minuti)
        if (Math.floor(newTime) % eventInterval === 0) {
          generateRandomEvent();
        }

        return newTime;
      });
    }, 1000 / gameSpeed);

    // Timer per la barra della schiuma per ogni personaggio
    foamTimerRef.current = {};

    selectedCharacters.forEach(characterName => {
      const character = characters.find(c => c.name === characterName);

      foamTimerRef.current[characterName] = setInterval(() => {
        updateFoamLevel(characterName, character.loadRate);
      }, 1000 / gameSpeed);
    });

    // Initialize stroke timers for each character
    selectedCharacters.forEach(characterName => {
      const character = characters.find(c => c.name === characterName);
      const { strokeInterval } = calculateStrokeStats(character);

      strokeTimers[characterName] = setInterval(() => {
        performStroke(characterName);
      }, strokeInterval / gameSpeed);
    });

    // Timer per gli eventi (ogni 3 minuti)
    eventTimerRef.current = setInterval(() => {
      // Questo viene gestito nel gameTimer, ma teniamo il riferimento
      // per la pulizia
    }, eventInterval * 1000 / gameSpeed);
  };

  // Funzione per terminare il gioco
  const endGame = () => {
    clearInterval(gameTimerRef.current);

    // Pulisci tutti i timer dei personaggi
    if (foamTimerRef.current) {
      Object.values(foamTimerRef.current).forEach(timer => {
        clearInterval(timer);
      });
    }

    clearInterval(eventTimerRef.current);
    Object.values(strokeTimers).forEach(timer => clearInterval(timer));
  };

  // Funzione per resettare il gioco
  const resetGame = () => {
    endGame();
    setStaminaLevels({});
    setGameStarted(false);
    setFoamLevels({});
    setFoamDataMap({});
    setTime(0);
    setEvents([]);
    setCurrentEvent(null);
    setWinner(null);
    hasWinnerRef.current = false; // Resetta il ref
  };

  // Funzione per selezionare un personaggio
  const selectCharacter = (name) => {
    setSelectedCharacters(prev => {
      // Se il personaggio è già selezionato, lo rimuovo
      if (prev.includes(name)) {
        return prev.filter(char => char !== name);
      }

      // Se ho già selezionato 2 personaggi, sostituisco il primo
      if (prev.length >= 2) {
        return [prev[1], name];
      }

      // Altrimenti aggiungo il personaggio
      return [...prev, name];
    });

    resetGame();
  };

  // Utility per formattare il tempo in minuti:secondi
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Effetto per la pulizia quando il componente si smonta
  useEffect(() => {
    return () => {
      clearInterval(gameTimerRef.current);
      clearInterval(foamTimerRef.current);
      clearInterval(eventTimerRef.current);
    };
  }, []);

  // Add this new function to calculate stroke stats
  const calculateStrokeStats = (character) => {
    const strokeInterval = (12 - character.stats.velocità) * 1000; // Convert to milliseconds
    const strokeGain = 0.4 * character.stats.potenza;
    return { strokeInterval, strokeGain };
  };

  // Modifica la funzione performStroke
const performStroke = (characterName) => {
  const character = characters.find(c => c.name === characterName);
  if (!character || hasWinnerRef.current) return;

  // Controlla se il personaggio sta ricaricando la stamina
  if (isRecharging[characterName]) return;

  // Controlla se ha abbastanza stamina per uno stroke
  const staminaCost = 10 + character.stats.potenza;
  if (staminaLevels[characterName] < staminaCost) return;

  setIsStroking(prev => ({ ...prev, [characterName]: true }));

  // Calcola il guadagno dello stroke
  const { strokeGain } = calculateStrokeStats(character);

  // Consuma la stamina
  setStaminaLevels(prev => ({
    ...prev,
    [characterName]: Math.max(0, prev[characterName] - staminaCost)
  }));

  // Update foam level
  setFoamLevels(prevLevels => {
    const prevLevel = prevLevels[characterName] || 0;
    const newLevel = Math.min(prevLevel + strokeGain, 100);

    if (newLevel >= 100) {
      hasWinnerRef.current = true;
      setWinner(characterName);
      endGame();
    }

    return {
      ...prevLevels,
      [characterName]: newLevel
    };
  });

  // Update graph data
  setFoamDataMap(prevDataMap => ({
    ...prevDataMap,
    [characterName]: [
      ...(prevDataMap[characterName] || []),
      { 
        time: time / 60,
        foam: Math.min((prevDataMap[characterName]?.slice(-1)[0]?.foam || 0) + strokeGain, 100)
      }
    ]
  }));

  // Reset stroking state after animation
  setTimeout(() => {
    setIsStroking(prev => ({ ...prev, [characterName]: false }));
  }, 500);
};

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold font-arial text-center mb-6">JERKMATE CUP</h1>

      {!gameStarted ? (
        <div className="character-selection">
          <h2 className="text-xl font-semibold font-arial text-center mb-4">Seleziona i tuoi 2 Jerkmate</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((character) => (
              <div
                key={character.name}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedCharacters.includes(character.name)
                  ? 'bg-blue-100 border-blue-500 shadow-md'
                  : 'bg-white border-gray-300 hover:bg-blue-50'
                  }`}
                onClick={() => selectCharacter(character.name)}
              >
                <h3 className="text-lg font-semibold font-arial">{character.name} - "{character.nickname}"</h3>
                <p className="text-sm text-gray-600 mb-2">{character.archetipo}</p>

                {renderHexagonChart(character.stats)}

                <div className="mt-4">
                  <p className="text-sm font-semibold font-arial">Abilità Speciale:</p>
                  <p className="text-sm">{character.ability}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
              <h3 className="font-semibold font-arial">Informazioni sulla Partita:</h3>
              <ul className="font-arial list-disc pl-5 mt-2">
                <li>Durata totale: 30 minuti</li>
                <li>Eventi casuali ogni 3 minuti</li>
                <li>Gli eventi possono accelerare, rallentare, far retrocedere o avanzare la barra</li>
              </ul>
            </div>

            <div className="text-center mb-4">
              <p className="mb-2 font-arial">Per la demo, scegli la velocità di gioco:</p>
              <select
                className="p-2 border rounded"
                value={gameSpeed}
                onChange={(e) => setGameSpeed(Number(e.target.value))}
              >
                <option value="1">Tempo reale (30 minuti)</option>
                <option value="10">10x più veloce (3 minuti)</option>
                <option value="20">20x più veloce (90 secondi)</option>
                <option value="30">30x più veloce (1 minuto)</option>
              </select>
            </div>
          </div>

          {selectedCharacters.length === 2 && (
            <div className="mt-4 text-center">
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
        <div className="game-screen">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Sfida: {selectedCharacters[0]} vs {selectedCharacters[1]}
            </h2>
            <div className="text-xl font-semibold">
              Tempo: {formatTime(time)} / {formatTime(totalGameTime)}
            </div>
          </div>

          <div className="stamina-container">
            {/* Left Player */}
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
                    width: `${Math.round(staminaLevels[selectedCharacters[0]] || 0)}%`,
                    transition: isRecharging[selectedCharacters[0]] 
                      ? `width ${2000 * (0.1 + (characters.find(c => c.name === selectedCharacters[0]).stats.stamina / 10))}ms linear`
                      : 'width 0.5s ease-out'
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

            {/* Right Player */}
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
                    width: `${Math.round(staminaLevels[selectedCharacters[1]] || 0)}%`,
                    transition: isRecharging[selectedCharacters[1]] 
                      ? `width ${2000 * (0.1 + (characters.find(c => c.name === selectedCharacters[1]).stats.stamina / 10))}ms linear`
                      : 'width 0.5s ease-out'
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

          {/* Indicatore evento corrente */}
          {currentEvent && (
            <div className={`mb-4 p-3 rounded-lg bg-${currentEvent.color}-100 border border-${currentEvent.color}-500 transition-all`}>
              <h3 className={`font-bold text-${currentEvent.color}-700`}>{currentEvent.name}</h3>
              <p className={`text-${currentEvent.color}-600`}>{currentEvent.description}</p>
            </div>
          )}

          {/* Barre di progresso per entrambi i personaggi */}
          {selectedCharacters.map((characterName, index) => (
            <div className="mb-4" key={characterName}>
              <div className="text-sm font-semibold mb-1">
                {characterName}: {(foamLevels[characterName] || 0).toFixed(1)}%
              </div>
              <div className="foam-bar">
                <div
                  className={`foam-fill ${isStroking[characterName] ? 'stroking' : ''} ${
                    index === 0 ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{
                    width: `${foamLevels[characterName] || 0}%`
                  }}
                ></div>
              </div>
            </div>
          ))}

          

          {/* Grafico con due linee */}
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart>
                <XAxis
                  dataKey="time"
                  label={{ value: 'Minuti', position: 'insideBottom', offset: -5 }}
                  domain={[0, 'dataMax']}
                />
                <YAxis
                  label={{ value: '% Schiuma', angle: -90, position: 'insideLeft' }}
                  domain={[0, 100]}
                />
                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Livello Schiuma']} labelFormatter={(value) => `Minuto ${value}`} />

                {selectedCharacters.map((characterName, index) => (
                  <Line
                    key={characterName}
                    type="stepAfter"  // Cambia da "monotone" a "stepAfter"
                    data={foamDataMap[characterName] || []}
                    dataKey="foam"
                    name={characterName}
                    stroke={index === 0 ? "#0056b3" : "#00b358"}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}

                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Log degli eventi */}
          <div className="mb-4 p-3 bg-white rounded-lg shadow-sm max-h-64 overflow-y-auto">
            <h3 className="font-semibold font-arial mb-2">Eventi ({events.length}):</h3>
            {events.length === 0 ? (
              <p className="text-gray-500 italic">In attesa del primo evento...</p>
            ) : (
              <ul className="space-y-2">
                {events.map((event) => (
                  <li key={event.id} className={`p-2 rounded bg-${event.color}-50 border-l-4 border-${event.color}-400`}>
                    <span className="font-semibold font-arial">[{formatTime(event.time)}]</span> {event.name} - {event.description}
                  </li>
                )).reverse()}
              </ul>
            )}
          </div>


          {/*foamLevel >= 100 && (
            <div className="text-center p-4 bg-green-100 border border-green-500 rounded-lg mb-4">
              <h3 className="text-xl font-bold font-arial text-green-700">Complimenti!</h3>
              <p className="text-lg">Hai completato la sfida in {formatTime(time)}!</p>
            </div>
          )*/}

          {winner && (
            <div className="text-center p-4 bg-green-100 border border-green-500 rounded-lg mb-4">
              <h3 className="text-xl font-bold text-green-700">Complimenti!</h3>
              <p className="text-lg">{winner} ha vinto in {formatTime(time)}!</p>
            </div>
          )}


          <div className="text-center">
            <button
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold font-arial hover:bg-gray-600 transition-colors"
              onClick={resetGame}
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