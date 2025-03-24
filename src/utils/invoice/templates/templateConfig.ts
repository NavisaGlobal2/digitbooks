
/**
 * Template configuration for different invoice styles
 */

import { TemplateConfig } from "./types";

/**
 * Default template configuration
 */
export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  colors: {
    primary: [5, 209, 102],     // Brand green
    secondary: [3, 74, 46],     // Darker green
    text: [44, 62, 80],         // Dark blue-gray
    background: [255, 255, 255], // White
    accent: [249, 249, 249]     // Light gray
  },
  fonts: {
    header: 'helvetica',
    body: 'helvetica'
  },
  margins: {
    top: 20,
    right: 15,
    bottom: 20,
    left: 15
  }
};

/**
 * Professional template configuration
 */
export const PROFESSIONAL_TEMPLATE_CONFIG: TemplateConfig = {
  colors: {
    primary: [3, 74, 46],       // Darker green
    secondary: [5, 209, 102],   // Brand green
    text: [50, 50, 50],         // Dark gray
    background: [252, 252, 252], // Off-white
    accent: [240, 240, 240]     // Light gray
  },
  fonts: {
    header: 'helvetica',
    body: 'helvetica'
  },
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  }
};

/**
 * Minimalist template configuration
 */
export const MINIMALIST_TEMPLATE_CONFIG: TemplateConfig = {
  colors: {
    primary: [80, 80, 80],      // Dark gray
    secondary: [120, 120, 120], // Medium gray
    text: [60, 60, 60],         // Darker gray
    background: [255, 255, 255], // White
    accent: [240, 240, 240]     // Light gray
  },
  fonts: {
    header: 'helvetica',
    body: 'helvetica'
  },
  margins: {
    top: 30,
    right: 30,
    bottom: 30,
    left: 30
  }
};
