import bcrypt from "bcryptjs";
async function signUpController(req: any, res: any) {
  const { email, password } = req.body;

  try {
    const { email, password } = req.body;

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = { email, password: hashedPassword };
    // DB operation

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
}

export default signUpController;
