import './layout.css';
import { Link, Redirect, Route, useHistory, Switch } from 'react-router-dom'
import Login from './login'
import Register from './register'
import Timeline from './timeline'
import React, { useState, useEffect } from 'react';
import axios from "axios";
import cookies from "js-cookie";
import auth from '../util/auth';
import {API_BASE_PATH} from '../constants';

function Layout() {
    const history = useHistory();
    const [loggedIn, setLoggedIn] = useState(auth.isLoggedIn())
    console.log(loggedIn)

    useEffect(() => {
        setLoggedIn(auth.isLoggedIn());
    }, []);

    function getLayout()
    {
        if (loggedIn)
        {
            return(
            <>
                <Link to="/timeline">My Timeline</Link>
                <Link to="/public_timeline">Public Timeline</Link>
                <Link 
                    to="/logout"
                    onClick={ async () => {
                        await axios({
                            method: 'get',
                            url: API_BASE_PATH() + '/logout',
                            credentials: 'include',
                            withCredentials: true
                        })
                        .then(() => {
                            auth.logout();
                            setLoggedIn(false);
                            alert('Logged out');
                            history.push('/public_timeline');
                        }, () => {
                            alert('Failed to log out');
                        })
                    }}
                >
                    sign out 
                </Link>
            </>
            )
        }
        else{
            return(
                <>
                    <Link to="/public_timeline">Public Timeline</Link>
                    <Link to="/register">Sign Up</Link>
                    <Link to="/login">Sign In</Link>
                </>
            )
        }
    }

    return (
        <div className="page">
            <h1>MiniTwit</h1>
            <div className="navigation">
                {getLayout()}
            </div>
            <div className="body">

            <Switch>
                <Route 
                    path="/public_timeline" 
                    render={(props) => (
                        <Timeline {...props} publicTimeline={true} key={document.location.href} />
                    )}
                />
                
                <Route 
                    path="/timeline" 
                    render={(props) => (
                        <Timeline {...props} publicTimeline={false} userMessages={false} key={document.location.href} />
                    )}
                />
                <Route 
                    path="/login" 
                    render={(props) => (
                        <Login {...props} setLoggedIn={setLoggedIn}/>
                    )}
                />

                <Route path="/register" component={Register}/>

                <Route path="/:username"
                    exact={true}
                    render={(props) => (
                        <Timeline {...props} publicTimeline = {false} userMessages={true} key={document.location.href}/>
                    )}
                />
                
                <Route
                    path="/"
                    exact={true}
                        render={(props) => (
                            <Redirect to = "/public_timeline"/>
                    )}
                />
                </Switch>
            </div>
            <div className="footer">
                MiniTwit &mdash; A shit application 
            </div>
        </div>
    );
}

export default Layout;
