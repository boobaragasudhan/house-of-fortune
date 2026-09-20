import type { FortuneSymbol, FortuneTile } from '@hof/shared';
import { PROBABILITIES } from '../game/gameConfig';

export class ChainVRF {
  /**
   * Simulates requesting randomness from the Chain Casino SDK.
   * @param wager The active wager amount.
   * @returns A Promise resolving to a unique VRF request ID.
   */
  static async requestRandomness(wager: number): Promise<string> {
    console.log(`[CHAIN] Requesting VRF for wager: ${wager}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const requestId = 'vrf_' + Math.random().toString(36).substring(2, 11);
        resolve(requestId);
      }, 800);
    });
  }

  /**
   * Simulates the VRF fulfillment, generating a cryptographically fair 3x3 board.
   * @param requestId The VRF request ID to fulfill.
   * @returns A Promise resolving to the generated 3x3 Fortune Board.
   */
  static async determineOutcome(requestId: string): Promise<FortuneTile[]> {
    console.log(`[CHAIN] Fulfilling VRF requestId: ${requestId}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const board: FortuneTile[] = [];
        const symbols = Object.keys(PROBABILITIES) as FortuneSymbol[];
        
        for (let i = 0; i < 9; i++) {
          const rand = Math.random(); // In a real SDK, this comes from the VRF payload
          let cumulative = 0;
          let selectedSymbol: FortuneSymbol = 'SHADOW';
          
          for (const sym of symbols) {
            cumulative += PROBABILITIES[sym];
            if (rand <= cumulative) {
              selectedSymbol = sym;
              break;
            }
          }

          board.push({
            id: i,
            symbol: selectedSymbol,
            status: 'HIDDEN'
          });
        }
        
        resolve(board);
      }, 1200);
    });
  }
}
