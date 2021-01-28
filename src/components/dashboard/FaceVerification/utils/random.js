const random = percent => {
  return Math.random() < percent ? 'A' : 'B'
}

// TODO change percent to config for easy change
export default random
