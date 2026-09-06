import { useState } from "react";

function Login() {
    const [emailValue, setEmailValue] = useState("")
    const [passwordValue, setPasswordValue] = useState("")

    const handleChange = (e) => {
    if (e.target.name === "email") {
        setEmailValue(e.target.value);
    }else {
        setPasswordValue(e.target.value);
}};

const handleSubmit = (e) => {
    e.preventDefault();
    console.log(emailValue);
    console.log(passwordValue);
};

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" value={emailValue} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" value={passwordValue} onChange={handleChange} required />
                </div>
                <button>Login</button>
            </form>
        </div>
    )
}

export default Login;