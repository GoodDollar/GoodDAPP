module.exports = {
    'src/**/*.{js,jsx,ts,tsx}': ['eslint --no-ignore --max-warnings=0 --fix', () => 'tsc --noEmit'],
}
