import { toast } from "@/components/ui/use-toast";
// Import the new pile generation function
import { generateRandomPiles } from './gameLogic'; 

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
const GAMMA = 0.99; // Discount factor
const EPSILON = 0.2; // Exploration rate for training
const EPISODES = 50000; // Number of training episodes
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
    // This case should ideally not be reached if isGameOver is checked before calling chooseAction
    // For safety, let's return a placeholder or handle error appropriately.
    // For now, returning an invalid action that will likely be caught or ignored.
    console.warn("chooseAction called with no valid actions for state:", state);
    return { pileIndex: -1, count: -1 }; // Indicates an issue
  }
  
  // Exploration: choose a random action with probability epsilon
  if (Math.random() < epsilon) {
    return validActions[Math.floor(Math.random() * validActions.length)];
  }
  
  // Exploitation: choose the best action
  const stateQValues = qTable.get(stateKey);
  
  // If state not in Q-table, choose randomly (or among best unvisited actions)
  if (!stateQValues) {
    // Fallback to random if state is new and not exploring
    return validActions[Math.floor(Math.random() * validActions.length)];
  }
  
  // Find the action with the highest Q-value
  let bestAction = validActions[0]; // Initialize with the first valid action
  let bestValue = -Infinity;
  
  validActions.forEach(action => {
    const actionKey = actionToString(action);
    const qValue = stateQValues.get(actionKey) || 0; // Default to 0 if action not in Q-table for this state
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
    return 0; // No known Q-values for this state, optimistic default is 0
  }
  
  let maxQValue = -Infinity;
  stateQValues.forEach(qValue => {
    maxQValue = Math.max(maxQValue, qValue);
  });
  
  // If all Q-values are -Infinity (e.g., uninitialized), return 0. Otherwise, return the actual max.
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
  const currentQValue = stateQValues.get(actionKey) || 0; // Default to 0 if action not seen before for this state
  
  // Calculate new Q-value
  // If nextState is terminal, maxNextQValue is 0.
  // maxNextQValue represents the maximum value the *opponent* can achieve from nextState,
  // as it will be their turn.
  const maxNextQValue = isGameOver(nextState) ? 0 : getMaxQValue(nextState, qTable);
  // For the current player, the value of nextState is the negative of the opponent's best outcome.
  // So, we use -maxNextQValue in the update rule for the current player's Q-value.
  const newQValue = currentQValue + ALPHA * (reward + GAMMA * (-maxNextQValue) - currentQValue);
  
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
    // Initialize game with random piles
    let state: NimState = { piles: generateRandomPiles() };
    let player = 1; // Player 1 (human/opponent) starts, AI is player 2 for reward calculation
    
    // Play until game over
    while (!isGameOver(state)) {
      // Choose action using epsilon-greedy (AI is effectively playing against itself or an epsilon-greedy version of itself)
      const action = chooseAction(state, qTable, EPSILON);
      // Ensure action is valid (e.g. if chooseAction returned a placeholder for no valid actions)
      if (action.pileIndex === -1) {
          // This should not happen if isGameOver is checked, but as a safeguard:
          console.error("Invalid action chosen during training, breaking episode.", state);
          break; 
      }
      
      // Take action
      const nextState = getNextState(state, action);
      
      // Determine reward
      let reward = 0; // Default reward for non-terminal moves
      if (isGameOver(nextState)) {
        // Game over. The player who made the move that emptied the piles causes the *other* player to win.
        // In Nim, the player who takes the last stone LOSES.
        // So, if 'player' (the one who just made 'action') makes the game end, 'player' loses.
        // The Q-value update is from the perspective of the current 'player'.
        // If current 'player' makes a move to a terminal state where they lose, reward is -1.
        // If they make a move to a terminal state where they win (opponent took last stone), reward is +1.
        // Standard Nim: player taking last stone loses.
        // If player (who took action) makes sum = 0, player loses.
        reward = -1; // Player who made the move to an empty state (took last stone) loses.
      }
      
      // Update Q-table: we update the Q-value for the (state, action) pair taken by 'player'
      updateQValue(qTable, state, action, reward, nextState);
      
      // Update state
      state = nextState;
      
      // Switch player (not strictly necessary for Q-learning if AI plays both sides, but helps conceptualize)
      player = player === 1 ? 2 : 1;
    }
    
    // Log progress occasionally
    if (episode > 0 && episode % (EPISODES / 10) === 0) { // Log 10 times during training
      console.log(`Completed ${episode} training episodes (${(episode/EPISODES)*100}%)`);
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
  let qTable = loadQTable(); // Changed to let
  
  // If Q-table is empty, train it
  if (qTable.size === 0) {
    toast({
      title: "Training AI",
      description: "First run or no saved model. Training AI model...",
    });
    qTable = trainAgent(); // Reassign to qTable
    saveQTable(qTable);
  }
  
  // Use loaded Q-table to choose action (epsilon = 0 for exploitation during play)
  return chooseAction({ piles }, qTable, 0);
};
