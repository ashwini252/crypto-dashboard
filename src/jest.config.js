module.exports = {
    transform: {
      "^.+\\.(ts|tsx)$": "babel-jest", // Use Babel to transform TypeScript files
    },
    testEnvironment: "jsdom", // Make sure Jest uses the correct environment
  };
  