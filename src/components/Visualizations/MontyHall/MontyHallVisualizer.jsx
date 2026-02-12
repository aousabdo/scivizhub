import React, { useMemo, useState } from 'react';

const DOORS = [0, 1, 2];

const randomDoor = () => Math.floor(Math.random() * DOORS.length);

const createRound = () => ({
  carDoor: randomDoor(),
  initialPick: null,
  revealedDoor: null,
  finalPick: null,
  decision: null,
  phase: 'pick',
});

const chooseHostRevealDoor = (carDoor, initialPick) => {
  const validDoors = DOORS.filter((door) => door !== carDoor && door !== initialPick);
  return validDoors[Math.floor(Math.random() * validDoors.length)];
};

const chooseSwitchDoor = (initialPick, revealedDoor) => {
  return DOORS.find((door) => door !== initialPick && door !== revealedDoor);
};

const runMontyHallTrials = (trials) => {
  let stayWins = 0;
  let switchWins = 0;

  for (let i = 0; i < trials; i += 1) {
    const carDoor = randomDoor();
    const firstChoice = randomDoor();

    if (firstChoice === carDoor) {
      stayWins += 1;
    } else {
      switchWins += 1;
    }
  }

  return { stayWins, switchWins };
};

const clampBatchSize = (value) => {
  if (Number.isNaN(value)) return 100;
  return Math.min(5000, Math.max(10, value));
};

const toPercent = (wins, trials) => {
  if (!trials) return '0.0';
  return ((wins / trials) * 100).toFixed(1);
};

const MontyHallVisualizer = () => {
  const [round, setRound] = useState(createRound());
  const [manualStats, setManualStats] = useState({ wins: 0, losses: 0 });
  const [batchSize, setBatchSize] = useState(200);
  const [simulationStats, setSimulationStats] = useState({
    stayWins: 0,
    stayTrials: 0,
    switchWins: 0,
    switchTrials: 0,
  });
  const [lastBatch, setLastBatch] = useState(null);

  const manualTrials = manualStats.wins + manualStats.losses;
  const manualWinRate = toPercent(manualStats.wins, manualTrials);

  const stayRate = toPercent(simulationStats.stayWins, simulationStats.stayTrials);
  const switchRate = toPercent(simulationStats.switchWins, simulationStats.switchTrials);
  const switchAdvantage = (parseFloat(switchRate) - parseFloat(stayRate)).toFixed(1);

  const phaseMessage = useMemo(() => {
    if (round.phase === 'pick') {
      return 'Choose one door. One door has a car, and the other two have goats.';
    }
    if (round.phase === 'switch') {
      return 'The host revealed a goat behind one door. Will you stay or switch?';
    }
    const didWin = round.finalPick === round.carDoor;
    if (didWin) {
      return `You won the car by choosing Door ${round.finalPick + 1}. Start a new round to try again.`;
    }
    return `You found a goat. The car was behind Door ${round.carDoor + 1}. Start a new round to retry.`;
  }, [round]);

  const startNewRound = () => {
    setRound(createRound());
  };

  const handleInitialPick = (door) => {
    if (round.phase !== 'pick') return;

    const revealedDoor = chooseHostRevealDoor(round.carDoor, door);
    setRound((current) => ({
      ...current,
      initialPick: door,
      revealedDoor,
      phase: 'switch',
    }));
  };

  const finishRound = (finalPick, decision) => {
    const won = finalPick === round.carDoor;

    setRound((current) => ({
      ...current,
      finalPick,
      decision,
      phase: 'result',
    }));

    setManualStats((current) => ({
      wins: current.wins + (won ? 1 : 0),
      losses: current.losses + (won ? 0 : 1),
    }));
  };

  const handleStay = () => {
    if (round.phase !== 'switch') return;
    finishRound(round.initialPick, 'stay');
  };

  const handleSwitch = () => {
    if (round.phase !== 'switch') return;
    const switchedDoor = chooseSwitchDoor(round.initialPick, round.revealedDoor);
    finishRound(switchedDoor, 'switch');
  };

  const runSimulationBatch = (multiplier = 1) => {
    const totalTrials = batchSize * multiplier;
    const { stayWins, switchWins } = runMontyHallTrials(totalTrials);

    setSimulationStats((current) => ({
      stayWins: current.stayWins + stayWins,
      stayTrials: current.stayTrials + totalTrials,
      switchWins: current.switchWins + switchWins,
      switchTrials: current.switchTrials + totalTrials,
    }));

    setLastBatch({
      trials: totalTrials,
      stayWins,
      switchWins,
    });
  };

  const resetSimulation = () => {
    setSimulationStats({
      stayWins: 0,
      stayTrials: 0,
      switchWins: 0,
      switchTrials: 0,
    });
    setLastBatch(null);
  };

  const getDoorStateClasses = (door) => {
    const baseClasses = 'h-36 rounded-xl border-2 p-3 transition-all';

    if (round.phase === 'pick') {
      return `${baseClasses} bg-gray-50 border-gray-300 hover:border-blue-400 hover:bg-blue-50`;
    }

    if (door === round.revealedDoor) {
      return `${baseClasses} bg-red-50 border-red-300`;
    }

    if (round.phase === 'switch' && door === round.initialPick) {
      return `${baseClasses} bg-blue-50 border-blue-300`;
    }

    if (round.phase === 'result' && door === round.finalPick && door === round.carDoor) {
      return `${baseClasses} bg-emerald-50 border-emerald-400`;
    }

    if (round.phase === 'result' && door === round.finalPick && door !== round.carDoor) {
      return `${baseClasses} bg-amber-50 border-amber-400`;
    }

    if (round.phase === 'result' && door === round.carDoor) {
      return `${baseClasses} bg-emerald-50 border-emerald-300`;
    }

    return `${baseClasses} bg-gray-50 border-gray-300`;
  };

  const renderDoorStatus = (door) => {
    if (round.phase === 'pick') {
      return 'Closed Door';
    }

    if (door === round.revealedDoor) {
      return 'Host revealed a goat';
    }

    if (round.phase === 'switch' && door === round.initialPick) {
      return 'Your original choice';
    }

    if (round.phase === 'switch') {
      return 'Still closed';
    }

    if (door === round.carDoor) {
      return 'Car';
    }

    return 'Goat';
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-2">Play A Round</h2>
        <p className="text-gray-700 mb-4">{phaseMessage}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {DOORS.map((door) => (
            <button
              key={door}
              type="button"
              disabled={round.phase !== 'pick'}
              className={`${getDoorStateClasses(door)} text-left ${round.phase !== 'pick' ? 'cursor-default' : 'cursor-pointer'}`}
              onClick={() => handleInitialPick(door)}
            >
              <p className="text-lg font-semibold mb-2">Door {door + 1}</p>
              <p className="text-sm text-gray-700">{renderDoorStatus(door)}</p>
              {round.phase === 'result' && door === round.finalPick && (
                <p className="text-xs text-gray-600 mt-3">
                  Final choice ({round.decision === 'switch' ? 'Switched' : 'Stayed'})
                </p>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleStay}
            disabled={round.phase !== 'switch'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Stay
          </button>
          <button
            type="button"
            onClick={handleSwitch}
            disabled={round.phase !== 'switch'}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Switch
          </button>
          <button
            type="button"
            onClick={startNewRound}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            New Round
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-2">Run Strategy Simulation</h2>
          <p className="text-gray-700 mb-5">
            Run many random games and compare long-run outcomes for always staying versus always switching.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="batch-size" className="block text-sm font-medium text-gray-700 mb-2">
                Trials per batch: {batchSize}
              </label>
              <input
                id="batch-size"
                type="range"
                min="10"
                max="5000"
                step="10"
                value={batchSize}
                onChange={(event) => setBatchSize(clampBatchSize(parseInt(event.target.value, 10)))}
                className="w-full"
              />
              <input
                type="number"
                min="10"
                max="5000"
                step="10"
                value={batchSize}
                onChange={(event) => setBatchSize(clampBatchSize(parseInt(event.target.value, 10)))}
                className="mt-3 p-2 w-full border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex flex-wrap content-start gap-3">
              <button
                type="button"
                onClick={() => runSimulationBatch(1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Run 1 Batch
              </button>
              <button
                type="button"
                onClick={() => runSimulationBatch(10)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Run 10 Batches
              </button>
              <button
                type="button"
                onClick={resetSimulation}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Reset Simulation
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold text-blue-700">Always Stay</span>
                <span>
                  {simulationStats.stayWins}/{simulationStats.stayTrials} wins ({stayRate}%)
                </span>
              </div>
              <div className="w-full h-4 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${stayRate}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold text-emerald-700">Always Switch</span>
                <span>
                  {simulationStats.switchWins}/{simulationStats.switchTrials} wins ({switchRate}%)
                </span>
              </div>
              <div className="w-full h-4 bg-emerald-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600" style={{ width: `${switchRate}%` }} />
              </div>
            </div>
          </div>

          {lastBatch && (
            <div className="mt-5 p-4 rounded-lg bg-gray-50 border border-gray-200 text-sm">
              Last batch ({lastBatch.trials.toLocaleString()} trials):
              {' '}
              stay won {lastBatch.stayWins.toLocaleString()} times, switch won {lastBatch.switchWins.toLocaleString()} times.
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 space-y-4">
          <h3 className="text-xl font-bold">Quick Insights</h3>
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-900">
              Manual rounds: {manualStats.wins} wins, {manualStats.losses} losses ({manualWinRate}% win rate).
            </p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="text-sm text-emerald-900">
              Theory predicts about 33.3% wins for stay and 66.7% wins for switch.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-900">
              Current measured switch advantage: {switchAdvantage}% points.
            </p>
          </div>
          <p className="text-sm text-gray-600">
            The host always reveals a goat and knows where the car is. That information changes the odds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MontyHallVisualizer;
