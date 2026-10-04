/**
 * Money calculations: pure functions over plain data, with no I/O.
 *
 * Amounts are integers in the currency's minor unit (rupiah, or US cents), never floating point.
 * Balances, budget figures and net worth are always computed here and never stored.
 */

export type Currency = "IDR" | "USD";
