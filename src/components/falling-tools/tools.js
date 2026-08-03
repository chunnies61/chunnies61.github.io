// Falling tool icons + word-tag pills.
// Icons (no `aspect`) render as squares. Tags (`aspect` set) render as
// pill shapes, sized by height, with width = height × aspect.
//
// Adjust freely: add a new icon with { label, src } (square), or a new
// tag with { label, src, aspect } (pill) — aspect = svgWidth / svgHeight.
// A tool with no local asset yet can use a favicon fallback instead:
// { label: 'Something', domain: 'example.com' }

import claude from './icons/claude.svg';
import chatgpt from './icons/chatgpt.svg';
import figma from './icons/figma.svg';
import creativeCloud from './icons/creative-cloud.svg';
import sketch from './icons/sketch.svg';

import zeroToOne from './icons/0-to-1.svg';
import aiNative from './icons/ai-native.svg';
import awardWinning from './icons/award-winning.svg';
import b2b from './icons/b2b.svg';
import b2c from './icons/b2c.svg';
import dataDriven from './icons/data-driven.svg';
import fintech from './icons/fintech.svg';
import systemsThinking from './icons/systems-thinking.svg';

export const TOOLS = [
  { label: 'Claude', src: claude },
  { label: 'ChatGPT', src: chatgpt },
  { label: 'Figma', src: figma },
  { label: 'Creative Cloud', src: creativeCloud },
  { label: 'Sketch', src: sketch },

  { label: '0-to-1', src: zeroToOne, aspect: 2.0 },
  { label: 'AI Native', src: aiNative, aspect: 2.6176 },
  { label: 'Award-winning', src: awardWinning, aspect: 4.2353 },
  { label: 'B2B', src: b2b, aspect: 1.3529 },
  { label: 'B2C', src: b2c, aspect: 1.4412 },
  { label: 'Data-driven', src: dataDriven, aspect: 3.4412 },
  { label: 'Fintech', src: fintech, aspect: 2.2353 },
  { label: 'Systems Thinking', src: systemsThinking, aspect: 4.7059 },
];
