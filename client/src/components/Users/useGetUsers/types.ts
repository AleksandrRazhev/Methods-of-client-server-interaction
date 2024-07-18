import { User } from "../types";

export type GetType = "shortPolling" | "longPolling";

export interface Response {
  users: User[];
  last: number;
}
