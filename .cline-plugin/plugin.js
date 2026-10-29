module.exports = function righthandClinePlugin(context) {
  // Cline plugin: exposes RightHand skills directory
  return {
    name: "righthand",
    skills: ["./skills"],
    commands: []
  };
};