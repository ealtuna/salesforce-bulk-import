module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["./env.jest.js"],
  testPathIgnorePatterns: [".d.ts", ".js"]
};