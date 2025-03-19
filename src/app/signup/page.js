'use client'

import {useState} from 'react'
import { useCreateUserWithEmailAndPassword} from 'react-firebase-hooks/auth'
import { auth } from "@/lib/firebase"
import SignUpPage from '@/components/signup-form'

export default function Page() {
    const [formData, setFormData] = useState({ firstname: '', lastname: '', email: '', password: '' });
    const [errors, setErrors] = useState({}); // <{ [key: string]: string }>

    const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);
    
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
    
    const handleSubmit = async () => {
      e.preventDefault();
      const validationErrors = {};
  
      // Basic validation
      if (!formData.firstname) validationErrors.firstname = 'Name is required';
      if (!formData.lastname) validationErrors.lastname = 'Name is required';
      if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) validationErrors.email = 'Valid email is required';
      if (!formData.password || formData.password.length < 6) validationErrors.password = 'Password must be at least 6 characters long';
  
      if (Object.keys(validationErrors).length === 0) {
        try {
          const res = createUserWithEmailAndPassword(formData.email, formData.password);
          setFormData({ firstname: '', lastname: '', email: '', password: '' });
        } catch (error) {
          console.error('Error submitting form:', error);
        }
      } else {
        setErrors(validationErrors);
      }
    };

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
            <SignUpPage formData={formData} onInputChange={handleChange} onSubmit={handleSubmit}/>
            </div>
        </div>
    )
}