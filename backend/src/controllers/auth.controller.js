

const {loginwithEmailAndPassword}= require("../services/auth.service")
const {createUser}= require("../services/user.service")
 const dotenv = require("dotenv");
const jwt =require("jsonwebtoken")
dotenv.config();

const login = async (req, res) => {
   try{
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    await  loginwithEmailAndPassword(req,res);



   }catch(err){
    console.error("login error:", err);
    const message = err instanceof Error ? err.message : "Unknown internal server error";
    return res.status(500).json({ message: "Login failed", error: message });

   }
};

// email pass role and department lo

const signup = async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "Name, email, password, and role are required" });
        }


        const user = await createUser({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password.trim(),
            role: role.trim().toLowerCase(),
            department: role.trim().toLowerCase() === "doctor" ? (department ?? "").trim() : null,
        });

        if(!user){
        return res.status(500).json({ message: "Failed to create user" });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });
          
       return res.status(201).json({ message: "User created successfully", user });


    }catch(err){
            return res.status(500).json({ message: "Failed to create user", error: err.message });

    }

}




const me = async (req, res) => {
    return res.json({ user: req.user });
};

module.exports = {
    login,
    signup,
    me,
};