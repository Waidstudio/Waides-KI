import { pgTable, text, serial, integer, boolean, real, timestamp, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  service: text("service").notNull(),
  key: text("key").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ethData = pgTable("eth_data", {
  id: serial("id").primaryKey(),
  price: real("price").notNull(),
  volume: real("volume"),
  marketCap: real("market_cap"),
  priceChange24h: real("price_change_24h"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const signals = pgTable("signals", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'LONG', 'SHORT', 'HOLD'
  confidence: real("confidence").notNull(),
  entryPoint: real("entry_point"),
  targetPrice: real("target_price"),
  stopLoss: real("stop_loss"),
  description: text("description").notNull(),
  konsMessage: text("kons_message"),
  timestamp: timestamp("timestamp").defaultNow(),
  isActive: boolean("is_active").default(false),
});

export const candlesticks = pgTable("candlesticks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  openTime: bigint("open_time", { mode: "number" }).notNull(),
  closeTime: bigint("close_time", { mode: "number" }).notNull(),
  open: real("open").notNull(),
  high: real("high").notNull(),
  low: real("low").notNull(),
  close: real("close").notNull(),
  volume: real("volume").notNull(),
  interval: text("interval").notNull(),
  isFinal: boolean("is_final").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  service: true,
  key: true,
});

export const insertEthDataSchema = createInsertSchema(ethData).omit({
  id: true,
  timestamp: true,
});

export const insertSignalSchema = createInsertSchema(signals).omit({
  id: true,
  timestamp: true,
});

export const insertCandlestickSchema = createInsertSchema(candlesticks).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertEthData = z.infer<typeof insertEthDataSchema>;
export type EthData = typeof ethData.$inferSelect;
export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type Signal = typeof signals.$inferSelect;
export type InsertCandlestick = z.infer<typeof insertCandlestickSchema>;
export type Candlestick = typeof candlesticks.$inferSelect;
