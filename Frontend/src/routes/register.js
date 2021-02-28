import './layout.css';
import React, { useState } from 'react';
import axios from "axios";
import { Redirect } from 'react-router-dom'
import {API_BASE_PATH} from '../constants';

function Register() {
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [username, setUsername] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();

    async function submit (e){
        e.preventDefault();
        await axios({
            method: 'post',
            url: API_BASE_PATH + '/register',
            data: {
                username: username,
                email: email,
                password: password
            }
        })
        .then(() => {
            alert ('Success');
            setHasSubmitted(true);
        }, () => {
            alert('Username already exists');
        });
    }

    return (
        <>
            <h2>Sign Up</h2>
            <form onSubmit={submit}>
                <label>
                    Username:
                    <input type="text" name="username" size="30" onChange={e => setUsername(e.target.value)} required />
                </label>
                <label>
                    Email:
                    <input type="text" name="email" size="30" onChange={e => setEmail(e.target.value)} required/>
                </label>
                <label>
                    Password:
                    <input type="password" name="password" size="30" onChange={e => setPassword(e.target.value)} required/>
                </label>
                <label>
                    Password (repeat):
                    <input type="password" name="password2" size="30" required/>
                </label>
                <div className="actions">
                    <input type="submit" value="Sign Up"/>
                </div>
            </form>
            {hasSubmitted ? <Redirect to="/login" /> : <Redirect to="/register" />}
        </>
    );
}

export default Register;
