const playAgainstComputer = async (req, res) => {
  const { userId, userChoice } = req.body;

  const validChoices = ["rock", "paper", "scissors"];
  if (!validChoices.includes(userChoice))
    return res.status(400).json({ message: "Invalid choice" });

  const computerChoice =
    validChoices[Math.floor(Math.random() * validChoices.length)];
  let result;

  if (userChoice === computerChoice) {
    result = "draw";
    // await updateUserPoints(userId, 1);
  } else if (
    (userChoice === "rock" && computerChoice === "scissors") ||
    (userChoice === "scissors" && computerChoice === "paper") ||
    (userChoice === "paper" && computerChoice === "rock")
  ) {
    result = "win";
    // await updateUserPoints(userId, 5);
  } else {
    result = "lose";
  }

  res.status(200).json({ userChoice, computerChoice, result });
};

module.exports = { playAgainstComputer };
