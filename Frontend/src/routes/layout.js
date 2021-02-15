import './layout.css';
import { Link, Route } from 'react-router-dom'
import Login from './login'
import Register from './register'
import Timeline from './timeline'
import React, { useState } from 'react';

const username = "norton"

function Layout() {
    const [loggedIn, setLoggedIn] = useState(false);

    function isLoggedIn(){
        if(loggedIn){
            return(
                <>
                    <Link to="/timeline">my timeline</Link>
                    <Link to="/public_timeline">public timeline</Link>
                    <Link to="/logout">sign out {username}</Link>
                </>
            )
        }
        else{
            return(
                <>
                    <Link to="/public_timeline">public timeline</Link>
                    <Link to="/register">sign up</Link>
                    <Link to="/login">sign in</Link>
                </>
            )
        }
    }

    return (
        <div className="page">
            <h1>MiniTwit</h1>
            <div className="navigation">
                {isLoggedIn()}
            </div>
            <div className="body">
                <Route 
                    path="/public_timeline" 
                    render={(props) => (
                        <Timeline {...props} publicTimeline={true} />
                    )}
                />
                <Route 
                    path="/timeline" 
                    render={(props) => (
                        <Timeline {...props} publicTimeline={false} />
                    )}
                />
                <Route 
                    path="/login" 
                    render={(props) => (
                        <Login {...props} setLoggedIn={setLoggedIn} />
                    )}
                />
                <Route path="/register" component={Register}/>
            </div>
            <div className="footer">
                MiniTwit &mdash; A Flask Application
            </div>
        </div>
    );
}

export default Layout;
