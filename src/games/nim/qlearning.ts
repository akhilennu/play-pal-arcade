
import { toast } from "@/components/ui/use-toast";

// Type definitions for our Q-learning implementation
export interface NimState {
  piles: number[];
}

export interface NimAction {
  pileIndex: number;
  count: number;
}

export type QTable = Map<string, Map<string, number>>;

// Constants for Q-learning
const ALPHA = 0.1; // Learning rate
const GAMMA = 0.9; // Discount factor
const EPSILON = 0.1; // Exploration rate for training
const EPISODES = 10000; // Number of training episodes
const STORAGE_KEY = "nim-qtable"; // localStorage key

// Convert a state (pile configuration) to a string key
export const stateToString = (state: NimState): string => {
  return JSON.stringify(state.piles);
};

// Convert an action to a string key
export const actionToString = (action: NimAction): string => {
  return `${action.pileIndex},${action.count}`;
};

// Parse an action string back to a NimAction object
export const stringToAction = (actionStr: string): NimAction => {
  const [pileIndex, count] = actionStr.split(",").map(Number);
  return { pileIndex, count };
};

// Get all possible actions from a state
export const getValidActions = (state: NimState): NimAction[] => {
  const actions: NimAction[] = [];
  state.piles.forEach((pileSize, pileIndex) => {
    for (let count = 1; count <= pileSize; count++) {
      actions.push({ pileIndex, count });
    }
  });
  return actions;
};

// Get the next state after taking an action
export const getNextState = (state: NimState, action: NimAction): NimState => {
  const newPiles = [...state.piles];
  newPiles[action.pileIndex] = Math.max(0, newPiles[action.pileIndex] - action.count);
  return { piles: newPiles };
};

// Choose an action using epsilon-greedy strategy
export const chooseAction = (
  state: NimState, 
  qTable: QTable,
  epsilon: number = 0
): NimAction => {
  const stateKey = stateToString(state);
  const validActions = getValidActions(state);
  
  // If no valid actions, return a default (should never happen in Nim)
  if (validActions.length === 0) {
    return { pileIndex: 0, count: 0 };
  }
  
  // Exploration: choose a random action with probability epsilon
  if (Math.random() < epsilon) {
    return validActions[Math.floor(Math.random() * validActions.length)];
  }
  
  // Exploitation: choose the best action
  const stateQValues = qTable.get(stateKey);
  
  // If state not in Q-table, choose randomly
  if (!stateQValues) {
    return validActions[Math.floor(Math.random() * validActions.length)];
  }
  
  // Find the action with the highest Q-value
  let bestAction = validActions[0];
  let bestValue = -Infinity;
  
  validActions.forEach(action => {
    const actionKey = actionToString(action);
    const qValue = stateQValues.get(actionKey) || 0;
    if (qValue > bestValue) {
      bestValue = qValue;
      bestAction = action;
    }
  });
  
  return bestAction;
};

// Get the maximum Q-value for a state
export const getMaxQValue = (state: NimState, qTable: QTable): number => {
  const stateKey = stateToString(state);
  const stateQValues = qTable.get(stateKey);
  
  if (!stateQValues || stateQValues.size === 0) {
    return 0;
  }
  
  let maxQValue = -Infinity;
  stateQValues.forEach(qValue => {
    maxQValue = Math.max(maxQValue, qValue);
  });
  
  return maxQValue === -Infinity ? 0 : maxQValue;
};

// Update the Q-table using the Q-learning update rule
export const updateQValue = (
  qTable: QTable,
  state: NimState,
  action: NimAction,
  reward: number,
  nextState: NimState
): void => {
  const stateKey = stateToString(state);
  const actionKey = actionToString(action);
  
  // Ensure state exists in Q-table
  if (!qTable.has(stateKey)) {
    qTable.set(stateKey, new Map<string, number>());
  }
  
  // Get current Q-value
  const stateQValues = qTable.get(stateKey)!;
  const currentQValue = stateQValues.get(actionKey) || 0;
  
  // Calculate new Q-value
  const maxNextQValue = getMaxQValue(nextState, qTable);
  const newQValue = currentQValue + ALPHA * (reward + GAMMA * maxNextQValue - currentQValue);
  
  // Update Q-table
  stateQValues.set(actionKey, newQValue);
};

// Check if a game is over (all piles are empty)
export const isGameOver = (state: NimState): boolean => {
  return state.piles.every(pile => pile === 0);
};

// Train the Q-learning agent
export const trainAgent = (): QTable => {
  console.log("Starting Q-learning training...");
  const qTable = new Map<string, Map<string, number>>();
  
  // Run training episodes
  for (let episode = 0; episode < EPISODES; episode++) {
    // Initialize game
    let state: NimState = { piles: [3, 4, 5] };
    let player = 1; // Player 1 starts
    
    // Play until game over
    while (!isGameOver(state)) {
      // Choose action using epsilon-greedy
      const action = chooseAction(state, qTable, EPSILON);
      
      // Take action
      const nextState = getNextState(state, action);
      
      // Determine reward
      let reward = 0;
      if (isGameOver(nextState)) {
        // Game over - player who took the last stone loses
        reward = player === 1 ? -1 : 1;  // AI (player 2) wants to win
      }
      
      // Update Q-table
      updateQValue(qTable, state, action, reward, nextState);
      
      // Update state
      state = nextState;
      
      // Switch player
      player = player === 1 ? 2 : 1;
    }
    
    // Log progress occasionally
    if (episode % 1000 === 0) {
      console.log(`Completed ${episode} training episodes`);
    }
  }
  
  console.log("Q-learning training complete!");
  return qTable;
};

// Save Q-table to localStorage
export const saveQTable = (qTable: QTable): void => {
  try {
    // Convert Map to serializable object
    const serializable: Record<string, Record<string, number>> = {};
    qTable.forEach((actionMap, stateKey) => {
      serializable[stateKey] = {};
      actionMap.forEach((qValue, actionKey) => {
        serializable[stateKey][actionKey] = qValue;
      });
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    toast({
      title: "AI Model Saved",
      description: "Q-learning model successfully saved to local storage.",
    });
  } catch (error) {
    console.error("Error saving Q-table:", error);
    toast({
      title: "Error Saving AI Model",
      description: "Failed to save Q-learning model.",
      variant: "destructive",
    });
  }
};

// Load Q-table from localStorage
export const loadQTable = (): QTable => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return new Map<string, Map<string, number>>();
    }
    
    const parsed = JSON.parse(serialized);
    const qTable = new Map<string, Map<string, number>>();
    
    // Convert object back to Map
    Object.entries(parsed).forEach(([stateKey, actionObj]) => {
      const actionMap = new Map<string, number>();
      Object.entries(actionObj as Record<string, number>).forEach(([actionKey, qValue]) => {
        actionMap.set(actionKey, qValue);
      });
      qTable.set(stateKey, actionMap);
    });
    
    return qTable;
  } catch (error) {
    console.error("Error loading Q-table:", error);
    toast({
      title: "Error Loading AI Model",
      description: "Failed to load Q-learning model. Using new model instead.",
      variant: "destructive",
    });
    return new Map<string, Map<string, number>>();
  }
};

// Export Q-table as JSON
export const exportQTable = (qTable: QTable): string => {
  try {
    // Convert Map to serializable object
    const serializable: Record<string, Record<string, number>> = {};
    qTable.forEach((actionMap, stateKey) => {
      serializable[stateKey] = {};
      actionMap.forEach((qValue, actionKey) => {
        serializable[stateKey][actionKey] = qValue;
      });
    });
    
    return JSON.stringify(serializable, null, 2);
  } catch (error) {
    console.error("Error exporting Q-table:", error);
    return "{}";
  }
};

// Import Q-table from JSON
export const importQTable = (json: string): QTable | null => {
  try {
    const parsed = JSON.parse(json);
    const qTable = new Map<string, Map<string, number>>();
    
    // Convert object to Map
    Object.entries(parsed).forEach(([stateKey, actionObj]) => {
      const actionMap = new Map<string, number>();
      Object.entries(actionObj as Record<string, number>).forEach(([actionKey, qValue]) => {
        actionMap.set(actionKey, qValue);
      });
      qTable.set(stateKey, actionMap);
    });
    
    return qTable;
  } catch (error) {
    console.error("Error importing Q-table:", error);
    return null;
  }
};

// Get an AI move using the trained Q-table
export const getAIMove = (piles: number[]): NimAction => {
  // Load Q-table
  const qTable = loadQTable();
  
  // If Q-table is empty, train it
  if (qTable.size === 0) {
    toast({
      title: "Training AI",
      description: "First run detected. Training AI model...",
    });
    const trainedQTable = trainAgent();
    saveQTable(trainedQTable);
    return chooseAction({ piles }, trainedQTable);
  }
  
  // Use loaded Q-table to choose action
  return chooseAction({ piles }, qTable);
};
