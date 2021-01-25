const random = percent => {
  return Math.random() < percent ? 'A' : 'B'
}

// TODO change percent to config for easy change
export const AB = random(0.5)
