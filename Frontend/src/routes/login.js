import './layout.css';
import React, { useState } from 'react';
import axios from "axios";
import { Redirect} from 'react-router-dom'
import Layout from './layout';

function Login({ setLoggedIn }) {
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();

    async function submit (e){
        e.preventDefault();
        await axios({
            method: 'post',
            url: 'http://localhost:5000/login',
            credentials: 'include',
            withCredentials: true,
            data: {
                username: username,
                password: password
            }
        })
        .then(() => {
            setLoggedIn(true);
            setHasSubmitted(true);
        }, () => {
            alert('Wrong username or password');
        });
    }
    return (
        <>
            <h2>Sign In</h2>
            <form onSubmit={submit}>
                <label>
                    Username:
                    <input type="text" name="username" size="30" onChange={e => setUsername(e.target.value)} required/>
                </label>
                <label>
                Password:
                    <input type="password" name="password" size="30" onChange={e => setPassword(e.target.value)} required/>
                </label>
                <div className="actions">
                    <input type="submit" value="Sign In"/>
                </div>
            </form>
            {hasSubmitted ? <Redirect to="/" /> : <Redirect to="/login" />}
        </>
    );
}

export default Login;
