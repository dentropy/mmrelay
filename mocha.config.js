// mocha.config.js
export default {
    spec: ['./test/*.test.js'],
    extension: ['.js'],
    timeout: 5000, // Increase timeout for async tests
    reporter: 'dot'
};