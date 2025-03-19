import {
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    sendEmailVerification,
    sendPasswordResetEmail
  } from 'firebase/auth';

  import { auth } from '@/lib/firebase';
    
  export const registerUser = (req, res) => {
    const { name, email, password } = req.body;
  
    if (!email || !password) {
      return res.status(422).json({
        name: "Full name is required",
        email: "Email is required",
        password: "Password is required",
      });
    }
  
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        sendEmailVerification(auth.currentUser)
          .then(() => {
            res.status(201).json({ message: "Verification email sent! User created successfully!" });
          })
          .catch((error) => {
            console.error(error);
            res.status(500).json({ error: "Error sending email verification" });
          });
      })
      .catch((error) => {
        const errorMessage = error.message || "An error occurred while registering user";
        res.status(500).json({ error: errorMessage });
      });
  };
  
  export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({
        email: "Email is required",
        password: "Password is required",
      });
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      if (idToken) {
        res.setHeader('Set-Cookie', `access_token=${idToken}; HttpOnly; Path=/; Max-Age=3600`);
        res.status(200).json({ success: true, message: "Login successful" });
      } else {
        res.status(500).json({ success: false, error: "Cannot find ID token" });
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error.message || "An error occurred while logging in";
      res.status(500).json({ success: false, error: errorMessage });
    }
  };
  
  export const logoutUser = (req, res) => {
    signOut(auth)
      .then(() => {
        res.setHeader('Set-Cookie', 'access_token=; HttpOnly; Max-Age=0');
        res.status(200).json({ message: "User logged out successfully" });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  };
  
  export const resetPassword = (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(422).json({
        email: "Email is required",
      });
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        res.status(200).json({ message: "Password reset email sent successfully!" });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  };