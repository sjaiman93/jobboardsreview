import { jobBoardFlow } from "./jobBoard";
import { aiToolFlow } from "./aiTool";

export * from "./shared";

// Board data says what a listing is in `productType`. Anything that isn't an
// AI tool is reviewed as a job board.
export function listingTypeOf(board) {
  return board?.productType === "ai_tool" ? "ai_tool" : "job_board";
}

export function flowFor(listingType) {
  return listingType === "ai_tool" ? aiToolFlow : jobBoardFlow;
}
