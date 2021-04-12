import './layout.css';
import React, { useState } from 'react';
import axios from "axios";
import { Redirect} from 'react-router-dom'
import {API_BASE_PATH} from '../constants';
import auth from '../util/auth';
import PropTypes from 'prop-types';

function Login({ setLoggedIn }) {
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();

    async function submit (e){
        e.preventDefault();
        await axios({
            method: 'post',
            url: API_BASE_PATH() + '/login',
            credentials: 'include',
            withCredentials: true,
            data: {
                username: username,
                password: password
            }
        })
        .then(() => {
            setLoggedIn(true);
            auth.login();
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

Login.propTypes= {
    setLoggedIn: PropTypes.func.isRequired,
  };

export default Login;
