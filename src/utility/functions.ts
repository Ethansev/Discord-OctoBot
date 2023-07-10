import chalk from 'chalk';
import { Client } from '../Client';
import { readdirSync } from 'fs';
import { BotEvent } from '../@types/types';
import { Interaction } from 'discord.js';

type colorType = 'text' | 'variable' | 'error';

const themeColors = {
  text: '#ff8e4d',
  variable: '#ff624d',
  error: '#f5426c',
};

export const getThemeColor = (color: colorType) => Number(`0x${themeColors[color].substring(1)}`);

export const color = (color: colorType, message: any) => {
  return chalk.hex(themeColors[color])(message);
};
